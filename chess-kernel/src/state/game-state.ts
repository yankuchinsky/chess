import { Position, EntityId, PlayerId } from '../core/types';
import { Piece } from '../core/piece';
import { Board } from '../topology/board';

/**
 * Opaque, ruleset-defined payload attached to a move.
 *
 * The kernel never interprets it — it only stores and replays it as part of
 * the move history. Each ruleset declares its own typed shape (e.g.
 * `ChessMoveMetadata` in `rulesets/chess/move.ts`) and casts at the boundary.
 */
export type MoveMetadata = Record<string, unknown>;

/**
 * Opaque, ruleset-defined state bag carried by `GameState`.
 *
 * Like `MoveMetadata`, the kernel treats this as a plain data container:
 * game-specific fields (castling rights, en-passant targets, hands for
 * Crazyhouse, …) are declared and interpreted exclusively by the ruleset
 * layer. Rulesets may define a typed alias for their own bag, e.g.
 * `ChessStateMetadata` in `rulesets/chess/state.ts`.
 */
export type StateMetadata = Record<string, unknown>;

/**
 * Represents a single move in the game
 * Engine doesn't know if this move is valid - ruleset validates
 */
export interface Move {
  readonly id: EntityId;
  readonly pieceId: EntityId;
  readonly from: Position;
  readonly to: Position;
  readonly capturedPieceId?: EntityId;
  readonly metadata?: MoveMetadata; // Ruleset-specific data (opaque to the kernel)
}

/**
 * Creates a move instance
 */
export function createMove(
  id: EntityId,
  pieceId: EntityId,
  from: Position,
  to: Position,
  capturedPieceId?: EntityId,
  metadata?: MoveMetadata
): Move {
  return Object.freeze({
    id,
    pieceId,
    from,
    to,
    capturedPieceId,
    metadata
  });
}

/**
 * Game phase indicator
 */
export type GamePhase = 'not-started' | 'in-progress' | 'finished';

/**
 * Game result
 */
export type GameResult = 
  | { winner: PlayerId; reason: string }
  | { draw: true; reason: string }
  | null;

/**
 * Complete immutable game state
 * Uses structural sharing for efficient history
 */
export interface GameState {
  readonly id: EntityId;
  readonly board: Board;
  readonly currentPlayer: PlayerId;
  readonly players: readonly PlayerId[];
  readonly phase: GamePhase;
  readonly result: GameResult;
  readonly halfmoveClock: number; // Generic ply counter since last reset; ruleset decides when to reset (via applyMove options)
  readonly fullmoveNumber: number;
  readonly moveHistory: readonly Move[];
  readonly capturedPieces: readonly Piece[]; // Pieces captured during game
  readonly metadata?: StateMetadata; // Ruleset-specific state (opaque to the kernel)
}

/**
 * Creates initial game state
 */
export function createGameState(
  id: EntityId,
  board: Board,
  players: readonly PlayerId[],
  startingPlayer: PlayerId,
  metadata?: StateMetadata
): GameState {
  return Object.freeze({
    id,
    board,
    currentPlayer: startingPlayer,
    players: Object.freeze(players),
    phase: 'not-started',
    result: null,
    halfmoveClock: 0,
    fullmoveNumber: 1,
    moveHistory: [],
    capturedPieces: [],
    metadata
  });
}

/**
 * Options bag for `applyMove`. Everything game-specific (like resetting the
 * halfmove clock on a pawn push) is injected by the ruleset; the kernel only
 * applies generic bookkeeping.
 */
export interface ApplyMoveOptions {
  /**
   * When true, the halfmove clock resets even though no piece was captured
   * (e.g. a pawn advance in chess). Defaults to false.
   */
  readonly resetsHalfmoveClock?: boolean;
}

/**
 * Applies a move to game state, returning new state
 * Does NOT validate the move - ruleset must validate before calling
 */
export function applyMove(
  state: GameState,
  move: Move,
  newBoard: Board,
  capturedPiece?: Piece,
  newMetadata?: StateMetadata,
  options?: ApplyMoveOptions
): GameState {
  const isCapture = !!capturedPiece;
  // Game-specific resets (pawn moves, etc.) are decided by the ruleset and
  // passed through `options`; the kernel itself knows nothing about them.
  const resetClock = isCapture || options?.resetsHalfmoveClock === true;

  const newHalfmoveClock = resetClock ? 0 : state.halfmoveClock + 1;
  const newFullmoveNumber = state.currentPlayer === state.players[0] 
    ? state.fullmoveNumber + 1 
    : state.fullmoveNumber;
  
  const newMoveHistory = [...state.moveHistory, move];
  const newCapturedPieces = capturedPiece 
    ? [...state.capturedPieces, capturedPiece]
    : state.capturedPieces;
  
  // Determine next player
  const currentIndex = state.players.indexOf(state.currentPlayer);
  const nextPlayerIndex = (currentIndex + 1) % state.players.length;
  const nextPlayer = state.players[nextPlayerIndex];
  
  return Object.freeze({
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    phase: 'in-progress',
    halfmoveClock: newHalfmoveClock,
    fullmoveNumber: newFullmoveNumber,
    moveHistory: newMoveHistory,
    capturedPieces: newCapturedPieces,
    metadata: newMetadata || state.metadata
  });
}

/**
 * Marks game as finished with a result
 */
export function finishGame(
  state: GameState,
  result: GameResult
): GameState {
  return Object.freeze({
    ...state,
    phase: 'finished',
    result
  });
}

/**
 * Gets the piece that was moved in a specific move
 */
export function getMovedPiece(state: GameState, move: Move): Piece | undefined {
  return state.board.pieces.get(move.pieceId);
}

/**
 * Gets the captured piece from a move
 */
export function getCapturedPiece(state: GameState, move: Move): Piece | undefined {
  if (!move.capturedPieceId) return undefined;
  
  // Check in captured pieces list
  return state.capturedPieces.find(p => p.id === move.capturedPieceId);
}
