import { getTransactionHistory } from "@/server/actions/portfolio";
import Link from "next/link";

export default async function HistoryPage() {
  const transactions = await getTransactionHistory();

  return (
    <div className="min-h-screen bg-black text-gray-100 p-8 font-sans selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header with Back Button */}
        <header className="flex justify-between items-center border-b border-gray-800 pb-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard" 
              className="text-sm text-zinc-400 hover:text-white transition-colors border border-zinc-800 px-3 py-1.5 rounded-md"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-light tracking-tight">Trade Ledger</h1>
          </div>
          <span className="text-sm text-gray-400">Total Records: <span className="text-white font-medium">{transactions.length}</span></span>
        </header>

        {/* The Ledger Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No transactions recorded yet. Return to the dashboard to make your first trade.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/50">
                    <th className="p-4 font-medium">Date & Time</th>
                    <th className="p-4 font-medium">Asset</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium text-right">Shares</th>
                    <th className="p-4 font-medium text-right">Exec. Price</th>
                    <th className="p-4 font-medium text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="text-zinc-300 hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4 text-zinc-400">
                        {new Date(tx.createdAt).toLocaleString('en-US', { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </td>
                      <td className="p-4 font-mono font-bold text-white">{tx.symbol}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          tx.type === 'BUY' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-4 text-right">{tx.quantity}</td>
                      <td className="p-4 text-right">${tx.price.toFixed(2)}</td>
                      <td className="p-4 text-right">${(tx.quantity * tx.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}