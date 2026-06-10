// Backend logic:

"use server"
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth"; // <-- Import the bouncer
import { redis } from "@/lib/redis";

export async function getPortfolioData() {
  // 1. Ask Auth.js who is currently logged in
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("You must be logged in to view this page.");
  }

  // 2. Fetch the real user from the database using their Google email
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      wallet: true,
      assets: true,
    }
  });

  if (!user) throw new Error("User not found in database.");

  // 3. New User Onboarding: Hand them their starting cash!
  if (!user.wallet) {
    // Upsert gracefully handles the Next.js double-firing race condition
    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {}, // If the wallet already exists (from the other thread), do absolutely nothing
      create: { userId: user.id, balance: 100000.00 }
    });

    // Re-fetch the user so we have the new wallet attached
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wallet: true,
        assets: true,
      }
    });
  }

  if (!user) {
    throw new Error("User session corrupted during initialization.");
  }

  return user;
}

// Add this below your existing getPortfolioData function in portfolio.ts

export async function handleBuyStock(formData: FormData) {
  const symbol = formData.get("ticker") as string;
  const price = parseFloat(formData.get("price") as string);
  const userId = formData.get("userId") as string; // Grabbing from hidden input
  const quantity = 10;
  const totalCost = price * quantity;

  // 1. REDIS RATE LIMITER (The Bouncer)
  const rateLimitKey = `rate_limit:buy:${userId}`;
  const isLocked = await redis.get(rateLimitKey);

  if (isLocked) {
    throw new Error("Trading too fast! Please wait a few seconds between trades.");
  }

  // Set a 2-second cooldown lock
  await redis.set(rateLimitKey, "locked", { ex: 2 });

  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < totalCost) throw new Error("Insufficient funds");

    await tx.wallet.update({
      where: { userId },
      data: { balance: { decrement: totalCost } }
    });

    const existingHolding = await tx.assetHolding.findFirst({ where: { userId, symbol } });

    if (existingHolding) {
      const newQuantity = existingHolding.quantity + quantity;
      const newAvgPrice = ((existingHolding.averagePrice * existingHolding.quantity) + totalCost) / newQuantity;
      await tx.assetHolding.update({
        where: { id: existingHolding.id },
        data: { quantity: newQuantity, averagePrice: newAvgPrice }
      });
    } else {
      await tx.assetHolding.create({
        data: { userId, symbol, quantity, averagePrice: price }
      });
    }

    await tx.transaction.create({
      data: { userId, symbol, quantity, price, type: "BUY" }
    });
  });
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

export async function handleSellStock(formData: FormData) {
  const symbol = formData.get("ticker") as string;
  const price = parseFloat(formData.get("price") as string);
  const userId = formData.get("userId") as string;
  const quantityToSell = 10;
  const totalRevenue = price * quantityToSell;

  // 1. REDIS RATE LIMITER (The Bouncer)
  const rateLimitKey = `rate_limit:sell:${userId}`;
  const isLocked = await redis.get(rateLimitKey);

  if (isLocked) {
    throw new Error("Trading too fast! Please wait a few seconds between trades.");
  }

  // Set a 2-second cooldown lock
  await redis.set(rateLimitKey, "locked", { ex: 2 });

  await prisma.$transaction(async (tx) => {
    const existingHolding = await tx.assetHolding.findFirst({ where: { userId, symbol } });
    if (!existingHolding || existingHolding.quantity < quantityToSell) throw new Error("Insufficient shares");

    await tx.wallet.update({
      where: { userId },
      data: { balance: { increment: totalRevenue } }
    });

    if (existingHolding.quantity === quantityToSell) {
      await tx.assetHolding.delete({ where: { id: existingHolding.id } });
    } else {
      await tx.assetHolding.update({
        where: { id: existingHolding.id },
        data: { quantity: { decrement: quantityToSell } }
      });
    } 

    await tx.transaction.create({
      data: { userId, symbol, quantity: quantityToSell, price, type: "SELL" }
    });
  });
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

export async function getTransactionHistory() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not logged in");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    // Only grab the transactions, and sort them newest-first!
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) throw new Error("User not found");

  return user.transactions;
}

export async function resetPortfolio() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Not authorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Atomic transaction to wipe everything and reset money simultaneously
  await prisma.$transaction(async (tx) => {
    // 1. Sell all assets (Delete holdings)
    await tx.assetHolding.deleteMany({ where: { userId: user.id } });

    // 2. Erase the ledger
    await tx.transaction.deleteMany({ where: { userId: user.id } });

    // 3. Reset the bank account
    await tx.wallet.update({
      where: { userId: user.id },
      data: { balance: 100000.00 }
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/history");
}