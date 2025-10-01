"use client";

import { GameBoard } from "@/components/game-board";
import { useStacks } from "@/hooks/use-stacks";
import { EMPTY_BOARD, Move } from "@/lib/contract";
import { formatStx, parseStx } from "@/lib/stx-utils";
import { useState } from "react";

export default function CreateGame() {
  const { stxBalance, userData, connectWallet, handleCreateSinglePlayerGame } =
    useStacks();

  const [betAmount, setBetAmount] = useState(0);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [playerSymbol, setPlayerSymbol] = useState<Move>(Move.X);
  const [gameMode, setGameMode] = useState<"single" | "multi">("single");

  function onCellClick(index: number) {
    const tempBoard = [...EMPTY_BOARD];
    tempBoard[index] = playerSymbol;
    setBoard(tempBoard);
  }

  async function onCreateGame() {
    const moveIndex = board.findIndex((cell) => cell !== Move.EMPTY);
    if (moveIndex === -1) {
      window.alert("Please make a move on the board first!");
      return;
    }

    await handleCreateSinglePlayerGame(parseStx(betAmount), playerSymbol, moveIndex);
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Create New Game
          </h1>
          <p className="text-xl text-gray-300">
            Choose your symbol, place your bet, and make your first move
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Game Settings Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">⚙️</span>
              Game Settings
            </h2>

            {/* Game Mode Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">
                Game Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setGameMode("single")}
                  className={`py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    gameMode === "single"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <div className="text-2xl mb-1">🤖</div>
                  vs Computer
                </button>
                <button
                  onClick={() => setGameMode("multi")}
                  className={`py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    gameMode === "multi"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <div className="text-2xl mb-1">👥</div>
                  vs Player
                </button>
              </div>
            </div>

            {/* Symbol Selection */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">
                Choose Your Symbol
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setPlayerSymbol(Move.X);
                    setBoard(EMPTY_BOARD);
                  }}
                  className={`py-6 px-8 rounded-xl font-bold text-4xl transition-all duration-300 ${
                    playerSymbol === Move.X
                      ? "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg scale-105 transform"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  X
                </button>
                <button
                  onClick={() => {
                    setPlayerSymbol(Move.O);
                    setBoard(EMPTY_BOARD);
                  }}
                  className={`py-6 px-8 rounded-xl font-bold text-4xl transition-all duration-300 ${
                    playerSymbol === Move.O
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg scale-105 transform"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  O
                </button>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-300 mb-3 block">
                Bet Amount (STX)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  placeholder="Enter bet amount"
                  value={betAmount || ""}
                  onChange={(e) => {
                    setBetAmount(parseFloat(e.target.value) || 0);
                  }}
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
                  onClick={() => {
                    setBetAmount(formatStx(stxBalance));
                  }}
                >
                  MAX
                </button>
              </div>
              {userData && (
                <p className="text-xs text-gray-400 mt-2">
                  Available: {formatStx(stxBalance)} STX
                </p>
              )}
            </div>

            {/* Current Bet Display */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-4 mb-6 border border-cyan-500/30">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 font-semibold">Current Bet:</span>
                <span className="text-2xl font-bold text-white">
                  {betAmount.toFixed(2)} STX
                </span>
              </div>
            </div>

            {/* Action Button */}
            {userData ? (
              <button
                type="button"
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 text-white px-8 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                onClick={onCreateGame}
              >
                🎮 Create Game & Start Playing
              </button>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-5 rounded-xl font-bold text-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                🔗 Connect Wallet to Play
              </button>
            )}
          </div>

          {/* Game Board Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-3xl">🎯</span>
              Make Your First Move
            </h2>

            <div className="flex justify-center">
              <GameBoard
                board={board}
                onCellClick={onCellClick}
                nextMove={playerSymbol}
                cellClassName="size-24 md:size-28 text-5xl md:text-6xl font-bold transition-all duration-300 hover:scale-105 hover:bg-white/20"
              />
            </div>

            {/* Game Instructions */}
            <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>💡</span>
                How to Play
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">1.</span>
                  <span>Choose your game mode (vs Computer or vs Player)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">2.</span>
                  <span>Select your symbol (X or O)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">3.</span>
                  <span>Enter your bet amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">4.</span>
                  <span>Click on the board to make your first move</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">5.</span>
                  <span>
                    {gameMode === "single"
                      ? "The computer will respond automatically!"
                      : "Wait for another player to join!"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
