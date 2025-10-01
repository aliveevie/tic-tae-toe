"use client";

import { GamesList } from "@/components/games-list";
import { PlayerStats } from "@/components/player-stats";
import { getAllGames, getPlayerStats, PlayerStats as PlayerStatsType } from "@/lib/contract";
import { useStacks } from "@/hooks/use-stacks";
import { useEffect, useState } from "react";
import { Game } from "@/lib/contract";
import Link from "next/link";

export default function Home() {
  const { userData } = useStacks();
  const [games, setGames] = useState<Game[]>([]);
  const [stats, setStats] = useState<PlayerStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const allGames = await getAllGames();
        setGames(allGames);

        if (userData) {
          const playerStats = await getPlayerStats(
            userData.profile.stxAddress.testnet
          );
          setStats(playerStats);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [userData]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tic Tac Toe 🎲
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Play 1v1 or challenge the AI on the Stacks blockchain
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create"
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              🎮 Create New Game
            </Link>
            <button
              onClick={() => {
                const gamesSection = document.getElementById("games-list");
                gamesSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              📋 Browse Games
            </button>
          </div>
        </div>

        {/* Player Stats Section */}
        {userData && stats && (
          <div className="mb-12 animate-fade-in">
            <PlayerStats stats={stats} isLoading={isLoading} />
          </div>
        )}

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">Play vs AI</h3>
            <p className="text-gray-300 text-sm">
              Challenge our smart AI opponent that adapts to your strategy
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Multiplayer</h3>
            <p className="text-gray-300 text-sm">
              Compete with other players and prove your skills
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Win STX</h3>
            <p className="text-gray-300 text-sm">
              Bet and win real STX tokens on the Stacks blockchain
            </p>
          </div>
        </div>

        {/* Games List Section */}
        <div id="games-list" className="scroll-mt-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              All Games
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-cyan-500"></div>
                <p className="text-gray-300 mt-4">Loading games...</p>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">🎮</p>
                <p className="text-xl text-gray-300 mb-4">No games yet!</p>
                <p className="text-gray-400">Be the first to create a game.</p>
              </div>
            ) : (
              <GamesList games={games} />
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Built on Stacks blockchain • Powered by Clarity smart contracts</p>
        </div>
      </div>
    </section>
  );
}
