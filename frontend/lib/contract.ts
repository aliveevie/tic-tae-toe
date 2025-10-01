import { STACKS_TESTNET } from "@stacks/network";
import {
  BooleanCV,
  cvToValue,
  fetchCallReadOnlyFunction,
  ListCV,
  OptionalCV,
  principalCV,
  PrincipalCV,
  TupleCV,
  uintCV,
  UIntCV,
} from "@stacks/transactions";

const CONTRACT_ADDRESS = "ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ";
const CONTRACT_NAME = "tic-tac-toe";

type GameCV = {
  "player-one": PrincipalCV;
  "player-two": OptionalCV<PrincipalCV>;
  "is-player-one-turn": BooleanCV;
  "bet-amount": UIntCV;
  board: ListCV<UIntCV>;
  winner: OptionalCV<PrincipalCV>;
  "is-single-player": BooleanCV;
  "player-one-symbol": UIntCV;
  "is-draw": BooleanCV;
};

export type Game = {
  id: number;
  "player-one": string;
  "player-two": string | null;
  "is-player-one-turn": boolean;
  "bet-amount": number;
  board: number[];
  winner: string | null;
  "is-single-player": boolean;
  "player-one-symbol": number;
  "is-draw": boolean;
};

export type PlayerStats = {
  "games-played": number;
  "games-won": number;
  "games-lost": number;
  "games-drawn": number;
  "total-bet": number;
  "total-winnings": number;
};

export enum Move {
  EMPTY = 0,
  X = 1,
  O = 2,
}

export const EMPTY_BOARD = [
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
  Move.EMPTY,
];

export async function getLatestGameId(): Promise<number> {
  const latestGameIdCV = (await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-latest-game-id",
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  })) as UIntCV;

  return parseInt(latestGameIdCV.value.toString());
}

export async function getAllGames() {
  // Fetch the latest-game-id from the contract
  const latestGameId = await getLatestGameId();

  // Loop from 0 to latestGameId-1 and fetch the game details for each game
  const games: Game[] = [];
  for (let i = 0; i < latestGameId; i++) {
    const game = await getGame(i);
    if (game) games.push(game);
  }
  return games;
}

export async function getGame(gameId: number) {
  // Use the get-game read only function to fetch the game details for the given gameId
  const gameDetails = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-game",
    functionArgs: [uintCV(gameId)],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  const responseCV = gameDetails as OptionalCV<TupleCV<GameCV>>;
  // If we get back a none, then the game does not exist and we return null
  if (responseCV.type === "none") return null;
  // If we get back a value that is not a tuple, something went wrong and we return null
  if (responseCV.value.type !== "tuple") return null;

  // If we got back a GameCV tuple, we can convert it to a Game object
  const gameCV = responseCV.value.value;

  const game: Game = {
    id: gameId,
    "player-one": gameCV["player-one"].value,
    "player-two":
      gameCV["player-two"].type === "some"
        ? gameCV["player-two"].value.value
        : null,
    "is-player-one-turn": cvToValue(gameCV["is-player-one-turn"]),
    "bet-amount": parseInt(gameCV["bet-amount"].value.toString()),
    board: gameCV["board"].value.map((cell) => parseInt(cell.value.toString())),
    winner:
      gameCV["winner"].type === "some" ? gameCV["winner"].value.value : null,
    "is-single-player": cvToValue(gameCV["is-single-player"]),
    "player-one-symbol": parseInt(gameCV["player-one-symbol"].value.toString()),
    "is-draw": cvToValue(gameCV["is-draw"]),
  };
  return game;
}

export async function createNewGame(
  betAmount: number,
  moveIndex: number,
  move: Move
) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-game",
    functionArgs: [uintCV(betAmount), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function joinGame(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "join-game",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function play(gameId: number, moveIndex: number, move: Move) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "play",
    functionArgs: [uintCV(gameId), uintCV(moveIndex), uintCV(move)],
  };

  return txOptions;
}

export async function createSinglePlayerGame(
  betAmount: number,
  playerSymbol: Move,
  moveIndex: number
) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "create-single-player-game",
    functionArgs: [uintCV(betAmount), uintCV(playerSymbol), uintCV(moveIndex)],
  };

  return txOptions;
}

export async function playSinglePlayer(gameId: number, moveIndex: number) {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "play-single-player",
    functionArgs: [uintCV(gameId), uintCV(moveIndex)],
  };

  return txOptions;
}

export async function getPlayerStats(address: string): Promise<PlayerStats> {
  const statsCV = await fetchCallReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-player-stats",
    functionArgs: [principalCV(address)],
    senderAddress: CONTRACT_ADDRESS,
    network: STACKS_TESTNET,
  });

  const statsTuple = statsCV as TupleCV;
  const stats: PlayerStats = {
    "games-played": parseInt(
      (statsTuple.value["games-played"] as UIntCV).value.toString()
    ),
    "games-won": parseInt(
      (statsTuple.value["games-won"] as UIntCV).value.toString()
    ),
    "games-lost": parseInt(
      (statsTuple.value["games-lost"] as UIntCV).value.toString()
    ),
    "games-drawn": parseInt(
      (statsTuple.value["games-drawn"] as UIntCV).value.toString()
    ),
    "total-bet": parseInt(
      (statsTuple.value["total-bet"] as UIntCV).value.toString()
    ),
    "total-winnings": parseInt(
      (statsTuple.value["total-winnings"] as UIntCV).value.toString()
    ),
  };

  return stats;
}
