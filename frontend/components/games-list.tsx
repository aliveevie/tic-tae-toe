"use client";

import { Game, Move } from "@/lib/contract";
import Link from "next/link";
import { GameBoard } from "./game-board";
import { useStacks } from "@/hooks/use-stacks";
import { useMemo } from "react";
import { formatStx } from "@/lib/stx-utils";

export function GamesList({ games }: { games: Game[] }) {
  const { userData } = useStacks();

  const userGames = useMemo(() => {
    if (!userData) return [];
    const userAddress = userData.profile.stxAddress.testnet;
    return games.filter(
      (game) =>
        (game["player-one"] === userAddress ||
          game["player-two"] === userAddress) &&
        game.winner === null &&
        !game["is-draw"]
    );
  }, [userData, games]);

  const joinableGames = useMemo(() => {
    if (!userData) return [];
    const userAddress = userData.profile.stxAddress.testnet;

    return games.filter(
      (game) =>
        !game["is-single-player"] &&
        game.winner === null &&
        !game["is-draw"] &&
        game["player-one"] !== userAddress &&
        game["player-two"] === null
    );
  }, [games, userData]);

  const endedGames = useMemo(() => {
    return games.filter((game) => game.winner !== null || game["is-draw"]);
  }, [games]);

  const GameCard = ({ game, type }: { game: Game; type: string }) => {
    const nextMove = game["is-player-one-turn"] ? Move.X : Move.O;
    const gameTypeIcon = game["is-single-player"] ? "🤖" : "👥";
    const statusColor = game.winner
      ? "from-green-500/20 to-emerald-500/20 border-green-500/30"
      : game["is-draw"]
      ? "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
      : "from-cyan-500/20 to-blue-500/20 border-cyan-500/30";

    return (
      <Link
        href={`/game/${game.id}`}
        className="group shrink-0 flex flex-col gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 transform w-64 hover-lift"
      >
        {/* Game Type Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl">{gameTypeIcon}</span>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-gray-300 font-semibold">
            Game #{game.id}
          </span>
        </div>

        {/* Game Board */}
        <div className="flex justify-center bg-white/5 rounded-xl p-3">
          <GameBoard board={game.board} cellClassName="size-10 text-2xl" />
        </div>

        {/* Bet Amount */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-3 border border-yellow-500/20 text-center">
          <p className="text-xs text-gray-400 mb-1">Prize Pool</p>
          <p className="text-xl font-bold text-yellow-400">
            {formatStx(game["bet-amount"] * (game["is-single-player"] ? 1 : 2))} STX
          </p>
        </div>

        {/* Game Status */}
        <div className={`bg-gradient-to-r ${statusColor} rounded-xl p-3 border text-center`}>
          <p className="text-sm font-semibold text-white">
            {game.winner
              ? "🏆 Finished"
              : game["is-draw"]
              ? "🤝 Draw"
              : `Next: ${nextMove === Move.X ? "X" : "O"}`}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full space-y-10">
      {/* Active Games */}
      {userData && userGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">🎮</span>
            Your Active Games
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {userGames.map((game) => (
              <GameCard key={`user-game-${game.id}`} game={game} type="active" />
            ))}
          </div>
        </div>
      )}

      {/* Joinable Games */}
      {joinableGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">🚀</span>
            Joinable Games
          </h2>
          {joinableGames.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
              <p className="text-4xl mb-4">🎯</p>
              <p className="text-gray-300 mb-4">No joinable games available</p>
              <Link
                href="/create"
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
              >
                Create New Game
              </Link>
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {joinableGames.map((game) => (
                <GameCard key={`joinable-game-${game.id}`} game={game} type="joinable" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ended Games */}
      {endedGames.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">📜</span>
            Game History
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {endedGames.slice(0, 10).map((game) => (
              <GameCard key={`ended-game-${game.id}`} game={game} type="ended" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {userData &&
        userGames.length === 0 &&
        joinableGames.length === 0 &&
        endedGames.length === 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-6xl mb-4">🎮</p>
            <p className="text-2xl text-white mb-2">No games found</p>
            <p className="text-gray-300 mb-6">Be the first to create a game!</p>
            <Link
              href="/create"
              className="inline-block bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              🎯 Create New Game
            </Link>
          </div>
        )}
    </div>
  );
}
