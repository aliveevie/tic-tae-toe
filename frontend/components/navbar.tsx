"use client";

import { useStacks } from "@/hooks/use-stacks";
import { abbreviateAddress, formatStx } from "@/lib/stx-utils";
import Link from "next/link";

export function Navbar() {
  const { userData, stxBalance, connectWallet, disconnectWallet } = useStacks();

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-lg border-b border-white/10 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-3xl transition-transform group-hover:scale-110 group-hover:rotate-12 duration-300">
              🎲
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              TicTacToe
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors duration-300 font-semibold relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/create"
              className="text-gray-300 hover:text-white transition-colors duration-300 font-semibold relative group"
            >
              Create Game
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Wallet Section */}
          <div className="flex items-center gap-3">
            {userData ? (
              <>
                {/* Balance Display */}
                <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <span className="text-yellow-400 font-bold">💰</span>
                  <span className="text-white font-semibold">
                    {formatStx(stxBalance)} STX
                  </span>
                </div>

                {/* Address Display */}
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30">
                  <span className="text-cyan-400 font-mono font-semibold">
                    {abbreviateAddress(userData.profile.stxAddress.testnet)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  type="button"
                  onClick={disconnectWallet}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={connectWallet}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <span>🔗</span>
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
