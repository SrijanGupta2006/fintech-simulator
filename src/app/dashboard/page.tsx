import { getPortfolioData, resetPortfolio } from "@/server/actions/portfolio";
import LiveMarket from "@/components/LiveMarket"; // Injecting the engine!
import HoldingsChart from "@/components/HoldingsChart";
import Link from "next/link";
import { signOut } from "@/auth";
import ResetButton from "@/components/ResetButton";


export default async function Dashboard() {
  const user = await getPortfolioData();
  const balance = user.wallet?.balance || 0;

  const totalHoldingsValue = user.assets.reduce(
    (sum, asset) => sum + (asset.quantity * asset.averagePrice), 0
  );

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 font-sans selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex justify-between items-center border-b border-gray-800 pb-6">
          <h1 className="text-3xl font-light tracking-tight">Portfolio Overview</h1>
          <div className="flex items-center space-x-4">

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-800 px-3 py-1.5 rounded-md"
              >
                Sign Out
              </button>
            </form>

            <ResetButton />

            {/* NEW LINK ADDED HERE */}
            <Link href="/history" className="text-sm text-zinc-400 hover:text-white transition-colors">
              View Ledger
            </Link>

            <span className="text-sm text-gray-400">Status: <span className="text-green-500 font-medium animate-pulse">Market Live</span></span>

            {/* The dynamic Google Profile Image */}
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="h-8 w-8 rounded-full border border-gray-700"
                referrerPolicy="no-referrer" /* <-- Add this magic line! */
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold uppercase">
                {user?.name?.substring(0, 2) || "USER"}
              </div>
            )}

          </div>
        </header>

        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm text-gray-400 mb-2">Buying Power</h2>
            <p className="text-4xl font-light">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm text-gray-400 mb-2">Total Holdings</h2>
            <p className="text-4xl font-light">
              ${totalHoldingsValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* The New Analytics Chart */}
        <div className="w-full">
          <HoldingsChart assets={user.assets} />
        </div>

        {/* The Live Market Component Injected Here */}
        <LiveMarket user={user} />

        {/* Dynamic Holdings Display */}
        {user.assets.length > 0 && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-light tracking-tight text-gray-300">Your Holdings</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="p-4 font-medium">Asset</th>
                    <th className="p-4 font-medium text-right">Shares</th>
                    <th className="p-4 font-medium text-right">Avg Price</th>
                    <th className="p-4 font-medium text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {user.assets.map((asset) => (
                    <tr key={asset.id} className="text-zinc-300">
                      <td className="p-4 font-mono font-bold text-white">{asset.symbol}</td>
                      <td className="p-4 text-right">{asset.quantity}</td>
                      <td className="p-4 text-right">${asset.averagePrice.toFixed(2)}</td>
                      <td className="p-4 text-right">${(asset.quantity * asset.averagePrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}