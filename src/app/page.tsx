import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // If the user is already logged in, skip this page and go straight to the dashboard
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white selection:bg-white selection:text-black">
      <div className="max-w-md w-full space-y-8 p-8 border border-zinc-800 bg-zinc-900/50 rounded-2xl text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-light tracking-tight">Simulator</h1>
          <p className="text-zinc-400 text-sm">A real-time paper trading environment.</p>
        </div>
        
        {/* NextAuth Server Action Form */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button 
            type="submit" 
            className="w-full py-3 px-4 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Continue with Google</span>
          </button>
        </form>
      </div>
    </div>
  );
}