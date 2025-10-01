"use client";

import { PlayerStats as PlayerStatsType } from "@/lib/contract";
import { formatStx } from "@/lib/stx-utils";

interface PlayerStatsProps {
  stats: PlayerStatsType;
  isLoading?: boolean;
}

export function PlayerStats({ stats, isLoading }: PlayerStatsProps) {
  if (isLoading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl animate-pulse">
        <div className="h-8 bg-white/20 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const winRate =
    stats["games-played"] > 0
      ? ((stats["games-won"] / stats["games-played"]) * 100).toFixed(1)
      : "0.0";

  const statCards = [
    {
      label: "Games Played",
      value: stats["games-played"],
      icon: "🎮",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Wins",
      value: stats["games-won"],
      icon: "🏆",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "Losses",
      value: stats["games-lost"],
      icon: "😔",
      gradient: "from-red-500 to-pink-500",
    },
    {
      label: "Draws",
      value: stats["games-drawn"],
      icon: "🤝",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      icon: "📊",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      label: "Total Bet",
      value: `${formatStx(stats["total-bet"])} STX`,
      icon: "💰",
      gradient: "from-orange-500 to-red-500",
    },
    {
      label: "Total Winnings",
      value: `${formatStx(stats["total-winnings"])} STX`,
      icon: "💎",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      label: "Net Profit",
      value: `${formatStx(stats["total-winnings"] - stats["total-bet"])} STX`,
      icon: stats["total-winnings"] >= stats["total-bet"] ? "📈" : "📉",
      gradient:
        stats["total-winnings"] >= stats["total-bet"]
          ? "from-green-500 to-teal-500"
          : "from-red-500 to-orange-500",
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <span className="text-4xl">📈</span>
        Your Statistics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 transform"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <p className="text-sm text-gray-300 font-semibold">{stat.label}</p>
            </div>
            <p
              className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Achievement Badges */}
      {stats["games-won"] >= 10 && (
        <div className="mt-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏅</span>
            <div>
              <p className="text-white font-bold">Achievement Unlocked!</p>
              <p className="text-sm text-gray-300">
                10+ Wins - You're a Tic-Tac-Toe Champion!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

