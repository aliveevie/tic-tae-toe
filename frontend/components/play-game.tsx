"use client";

import { Game, Move } from "@/lib/contract";
import { GameBoard } from "./game-board";
import { abbreviateAddress, explorerAddress, formatStx } from "@/lib/stx-utils";
import Link from "next/link";
import { useStacks } from "@/hooks/use-stacks";
import { useState } from "react";

interface PlayGameProps {
  game: Game;
}

export function PlayGame({ game }: PlayGameProps) {
  const {
    userData,
    handleJoinGame,
    handlePlayGame,
    handlePlaySinglePlayer,
  } = useStacks();
  const [board, setBoard] = useState(game.board);
  const [playedMoveIndex, setPlayedMoveIndex] = useState(-1);
  
  if (!userData) return null;

  const isPlayerOne =
    userData.profile.stxAddress.testnet === game["player-one"];
  const isPlayerTwo =
    userData.profile.stxAddress.testnet === game["player-two"];

  const isJoinable = game["player-two"] === null && !isPlayerOne && !game["is-single-player"];
  const isJoinedAlready = isPlayerOne || isPlayerTwo;
  const nextMove = game["is-player-one-turn"] ? Move.X : Move.O;
  const isMyTurn =
    game["is-single-player"]
      ? isPlayerOne && !game.winner && !game["is-draw"]
      : (game["is-player-one-turn"] && isPlayerOne) ||
        (!game["is-player-one-turn"] && isPlayerTwo);
  const isGameOver = game.winner !== null || game["is-draw"];

  const playerSymbol = game["is-single-player"] && isPlayerOne
    ? game["player-one-symbol"]
    : isPlayerOne
    ? Move.X
    : Move.O;

  function onCellClick(index: number) {
    const tempBoard = [...game.board];
    const moveToPlay = game["is-single-player"] ? playerSymbol : nextMove;
    tempBoard[index] = moveToPlay;
    setBoard(tempBoard);
    setPlayedMoveIndex(index);
  }

  async function handlePlay() {
    if (game["is-single-player"]) {
      await handlePlaySinglePlayer(game.id, playedMoveIndex);
    } else {
      await handlePlayGame(game.id, playedMoveIndex, nextMove);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Game Board Section */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="flex justify-center mb-6">
          <GameBoard
            board={board}
            onCellClick={isMyTurn && !isGameOver ? onCellClick : undefined}
            nextMove={game["is-single-player"] ? playerSymbol : nextMove}
            cellClassName="size-28 text-6xl font-bold transition-all duration-300 hover:scale-105 hover:bg-white/20"
          />
        </div>

        {/* Game Status */}
        <div className="mt-6">
          {game.winner && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30 text-center">
              <p className="text-2xl font-bold text-white mb-2">
                {game.winner === userData.profile.stxAddress.testnet
                  ? "🎉 You Won!"
                  : "😔 You Lost"}
              </p>
              <p className="text-sm text-gray-300">
                Winner gets {formatStx(game["bet-amount"] * (game["is-single-player"] ? 1 : 2))} STX
              </p>
            </div>
          )}

          {game["is-draw"] && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30 text-center">
              <p className="text-2xl font-bold text-white mb-2">🤝 It's a Draw!</p>
              <p className="text-sm text-gray-300">
                Bet amount returned to both players
              </p>
            </div>
          )}

          {!isGameOver && isMyTurn && (
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30 text-center">
              <p className="text-xl font-bold text-white">✨ Your Turn!</p>
              <p className="text-sm text-gray-300 mt-1">
                You are playing as{" "}
                <span className="font-bold text-white">
                  {playerSymbol === Move.X ? "X" : "O"}
                </span>
              </p>
            </div>
          )}

          {!isGameOver && !isMyTurn && isJoinedAlready && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30 text-center">
              <p className="text-xl font-bold text-white">⏳ Waiting...</p>
              <p className="text-sm text-gray-300 mt-1">
                {game["is-single-player"]
                  ? "Computer is thinking..."
                  : "Waiting for opponent's move"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Game Info Section */}
      <div className="space-y-6">
        {/* Game Details Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">ℹ️</span>
            Game Details
          </h3>

          <div className="space-y-4">
            {/* Game Mode */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Game Mode</p>
              <p className="text-lg font-bold text-white flex items-center gap-2">
                {game["is-single-player"] ? (
                  <>
                    <span className="text-2xl">🤖</span>
                    Single Player (vs AI)
                  </>
                ) : (
                  <>
                    <span className="text-2xl">👥</span>
                    Multiplayer
                  </>
                )}
              </p>
            </div>

            {/* Bet Amount */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20">
              <p className="text-sm text-gray-400 mb-1">Bet Amount</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {formatStx(game["bet-amount"])} STX
              </p>
            </div>

            {/* Prize Pool */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
              <p className="text-sm text-gray-400 mb-1">Prize Pool</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {formatStx(game["bet-amount"] * (game["is-single-player"] ? 1 : 2))} STX
              </p>
            </div>

            {/* Player One */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">
                Player One {game["is-single-player"] && `(${game["player-one-symbol"] === Move.X ? "X" : "O"})`}
              </p>
              <Link
                href={explorerAddress(game["player-one"])}
                target="_blank"
                className="text-cyan-400 hover:text-cyan-300 font-mono text-sm hover:underline flex items-center gap-2"
              >
                {abbreviateAddress(game["player-one"])}
                <span>🔗</span>
              </Link>
              {isPlayerOne && (
                <span className="inline-block mt-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                  You
                </span>
              )}
            </div>

            {/* Player Two */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">
                Player Two {game["is-single-player"] && `(${game["player-one-symbol"] === Move.X ? "O" : "X"})`}
              </p>
              {game["player-two"] ? (
                <>
                  {game["is-single-player"] ? (
                    <p className="text-purple-400 font-mono text-sm flex items-center gap-2">
                      <span className="text-xl">🤖</span>
                      Computer AI
                    </p>
                  ) : (
                    <Link
                      href={explorerAddress(game["player-two"])}
                      target="_blank"
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-sm hover:underline flex items-center gap-2"
                    >
                      {abbreviateAddress(game["player-two"])}
                      <span>🔗</span>
                    </Link>
                  )}
                  {isPlayerTwo && (
                    <span className="inline-block mt-2 text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic">Waiting for player...</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isJoinable && (
            <button
              onClick={() => handleJoinGame(game.id, playedMoveIndex, nextMove)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              🎮 Join Game
            </button>
          )}

          {isMyTurn && !isGameOver && (
            <button
              onClick={handlePlay}
              disabled={playedMoveIndex === -1}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {playedMoveIndex === -1 ? "Select a cell to play" : "🎯 Play Move"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
