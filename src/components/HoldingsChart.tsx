"use client";

import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";

export default function HoldingsChart({ assets }: { assets: any[] }) {
  if (!assets || assets.length === 0) {
    return (
      <div className="h-64 w-full border border-zinc-800 border-dashed rounded-xl flex items-center justify-center text-zinc-500 text-sm">
        No assets in portfolio yet. Buy some stocks to see your allocation.
      </div>
    );
  }

  const COLORS = ['#ffffff', '#a1a1aa', '#52525b', '#27272a'];

  // 1. We now inject the 'fill' color directly into the data object
  const data = assets.map((asset, index) => ({
    name: asset.symbol,
    value: asset.quantity * asset.averagePrice,
    fill: COLORS[index % COLORS.length] 
  }));

  return (
    <div className="h-64 w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col">
      <h2 className="text-sm text-gray-400 mb-4">Asset Allocation</h2>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            />
            {/* 2. Changed (value: number) to (value: any) to satisfy TypeScript */}
            <Tooltip 
              formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Total Value']}
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}