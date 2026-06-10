"use client";

import { useState, useEffect } from "react";
import { handleBuyStock, handleSellStock } from "@/server/actions/portfolio";

export default function LiveMarket({ user }: { user: any }) {
    // We start with the previous close prices as fallbacks while the WebSocket connects
    const [stocks, setStocks] = useState([
        { ticker: "BINANCE:BTCUSDT", name: "Bitcoin", price: 65000.00, color: "text-white", hasRealData: false },
        { ticker: "AAPL", name: "Apple Inc.", price: 175.50, color: "text-white", hasRealData: false },
        { ticker: "TSLA", name: "Tesla Inc.", price: 180.20, color: "text-white", hasRealData: false },
        { ticker: "NVDA", name: "NVIDIA Corp.", price: 900.00, color: "text-white", hasRealData: false },
        { ticker: "MSFT", name: "Microsoft Corp.", price: 415.30, color: "text-white", hasRealData: false },
        { ticker: "META", name: "Meta Platforms", price: 480.10, color: "text-white", hasRealData: false },
    ]);

    const [isConnected, setIsConnected] = useState(false);

    // The WebSocket Engine
    useEffect(() => {
        // 1. Open the pipe using your public environment variable
        const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!apiKey) {
            console.error("Finnhub API key is missing!");
            return;
        }

        const socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

        // 2. The Handshake: When the pipe opens, tell Finnhub which stocks we want
        socket.addEventListener('open', function (event) {
            console.log("✅ WebSocket Pipe Opened to Finnhub!");
            setIsConnected(true);
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:BTCUSDT' }));
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'AAPL' }));
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'TSLA' }));
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'NVDA' }));
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'MSFT' }));
            socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'META' }));
        });

        // 3. The Listener: Whenever data shoots down the pipe, update our UI
        socket.addEventListener('message', function (event) {
            const message = JSON.parse(event.data);
            if (message.type === 'trade') {
                const trades = message.data;

                setStocks((currentStocks) => {
                    const updatedStocks = [...currentStocks];

                    trades.forEach((trade: { s: string, p: number }) => {
                        const stockIndex = updatedStocks.findIndex(s => s.ticker === trade.s);
                        if (stockIndex !== -1) {
                            const oldPrice = updatedStocks[stockIndex].price;
                            const newPrice = trade.p;

                            let newColor = "text-white";
                            if (newPrice > oldPrice) newColor = "text-green-400";
                            else if (newPrice < oldPrice) newColor = "text-red-400";

                            updatedStocks[stockIndex] = {
                                ...updatedStocks[stockIndex],
                                price: newPrice,
                                color: newColor,
                                hasRealData: true
                            };
                        }
                    });
                    return updatedStocks;
                });
            }
        });

        // 4. Cleanup: Close the pipe if the user navigates away from the dashboard
        return () => {
            // Safety Check: Only send unsubscribe messages if the pipe is fully open (readyState === 1)
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': 'BINANCE:BTCUSDT' }));
                socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': 'AAPL' }));
                socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': 'TSLA' }));
                socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': 'NVDA' }));
                socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': 'MSFT' }));
                socket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': 'META' }));
            }

            socket.close();
        };
    }, []);

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-light tracking-tight text-gray-300">Live Market Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stocks.map((stock) => (
                    <div key={stock.ticker} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4 transition-all duration-300">
                        <div>
                            <div className="flex justify-between items-start">
                                <span className="font-mono text-lg font-bold text-white">{stock.ticker}</span>
                                <span className="text-zinc-400 text-sm">{stock.name}</span>
                            </div>
                            <p className={`text-2xl font-light mt-2 transition-colors duration-300 ${stock.color}`}>
                                ${stock.price.toFixed(2)}
                            </p>
                        </div>

                        {/* Find out how many shares the user owns of THIS specific stock */}

                        {(() => {
                            const holding = user.assets.find((a: any) => a.symbol === stock.ticker);
                            return holding ? (
                                <div className="text-xs text-zinc-500 mb-2 font-medium">
                                    You own: <span className="text-zinc-300">{holding.quantity} shares</span>
                                </div>
                            ) : (
                                <div className="text-xs text-zinc-700 mb-2 font-medium">Not in portfolio</div>
                            );
                        })()}

                        <div className="flex space-x-2">

                            <form action={handleBuyStock} className="flex-1">
                                <input type="hidden" name="ticker" value={stock.ticker} />
                                <input type="hidden" name="price" value={stock.price} />
                                <input type="hidden" name="userId" value={user.id} />
                                <button
                                    type="submit"
                                    disabled={!isConnected || !stock.hasRealData} // Disable if not connected
                                    className="w-full py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isConnected ? "Buy 10" : "Connecting..."}
                                </button>
                            </form>

                            <form action={handleSellStock} className="flex-1">
                                <input type="hidden" name="ticker" value={stock.ticker} />
                                <input type="hidden" name="price" value={stock.price} />
                                <input type="hidden" name="userId" value={user.id} />
                                <button type="submit"
                                    disabled={!isConnected || !stock.hasRealData}
                                    className="w-full py-2 bg-zinc-800 text-white border border-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isConnected ? "Sell 10" : "Connecting..."}
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}