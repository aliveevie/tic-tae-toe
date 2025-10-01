"use client";

import { PlayGame } from "@/components/play-game";
import { getGame, Game } from "@/lib/contract";
import { useEffect, useState } from "react";
import { use } from "react";

type Params = Promise<{ gameId: string }>;

export default function GamePage({ params }: { params: Params }) {
  const resolvedParams = use(params);
  const gameId = parseInt(resolvedParams.gameId);
  
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Fetch game data
  useEffect(() => {
    async function loadGame() {
      try {
        const gameData = await getGame(gameId);
        setGame(gameData);
      } catch (error) {
        console.error("Error loading game:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();
  }, [gameId, lastUpdate]);

  // Auto-refresh every 5 seconds for active games
  useEffect(() => {
    if (!game || game.winner || game["is-draw"]) {
      return; // Don't poll if game is over
    }

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [game]);

  // Function to manually refresh (call after making a move)
  const refreshGame = () => {
    setLastUpdate(Date.now());
  };

  if (isLoading) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-cyan-500 mb-4"></div>
          <p className="text-xl text-white">Loading game...</p>
        </div>
      </section>
    );
  }

  if (!game) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 shadow-2xl text-center">
          <p className="text-6xl mb-4">🎮</p>
          <h1 className="text-3xl font-bold text-white mb-2">Game Not Found</h1>
          <p className="text-gray-300">This game doesn't exist or has been removed.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Game #{gameId}
          </h1>
          <p className="text-xl text-gray-300">
            {game["is-single-player"]
              ? "Battle against the AI"
              : "Compete with your opponent"}
          </p>
          {game.winner && (
            <div className="mt-4 inline-block bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full px-6 py-2 border border-green-500/30">
              <span className="text-green-400 font-bold">Game Finished</span>
            </div>
          )}
          {game["is-draw"] && (
            <div className="mt-4 inline-block bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full px-6 py-2 border border-yellow-500/30">
              <span className="text-yellow-400 font-bold">Draw</span>
            </div>
          )}
          {!game.winner && !game["is-draw"] && (
            <div className="mt-4 inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full px-6 py-2 border border-cyan-500/30">
              <span className="text-cyan-400 font-bold animate-pulse">In Progress</span>
            </div>
          )}
        </div>

        <PlayGame game={game} onMoveComplete={refreshGame} />
      </div>
    </section>
  );
}
