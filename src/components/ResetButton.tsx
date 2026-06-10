"use client";

import { resetPortfolio } from "@/server/actions/portfolio";

export default function ResetButton() {
  return (
    <form 
      action={resetPortfolio}
      onSubmit={(e) => {
        const isConfirmed = window.confirm(
          "Are you sure you want to reset your portfolio?\n\nThis will permanently erase your transaction history, sell all assets, and reset your balance to $100,000."
        );
        
        // If they click 'Cancel', abort the form submission
        if (!isConfirmed) {
          e.preventDefault(); 
        }
      }}
    >
      <button 
        type="submit" 
        className="text-sm text-red-400 hover:text-red-300 transition-colors border border-red-900/50 bg-red-900/10 px-3 py-1.5 rounded-md"
      >
        Reset Account
      </button>
    </form>
  );
}