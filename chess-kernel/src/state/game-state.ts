import { Position, EntityId, PlayerId } from '../core/types';
import { Piece } from '../core/piece';
import { Board } from '../topology/board';

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
  readonly metadata?: MoveMetadata; // Ruleset-specific data (promotion type, en passant, etc.)
}

/**
 * Metadata for special moves
 * Ruleset defines what fields are meaningful
 */
export interface MoveMetadata {
  readonly promotionType?: string;
  readonly isEnPassant?: boolean;
  readonly isCastling?: boolean;
  readonly castlingRookId?: EntityId;
  readonly dropFromHand?: boolean; // For Crazyhouse-style games
  [key: string]: unknown;
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
  readonly halfmoveClock: number; // Moves since last capture/pawn move (for 50-move rule)
  readonly fullmoveNumber: number;
  readonly moveHistory: readonly Move[];
  readonly capturedPieces: readonly Piece[]; // Pieces captured during game
  readonly metadata?: GameStateMetadata; // Ruleset-specific state (castling rights, hands, etc.)
}

/**
 * Ruleset-specific metadata
 */
export interface GameStateMetadata {
  readonly castlingRights?: ReadonlySet<string>;
  readonly enPassantTarget?: Position;
  readonly playerHands?: Map<PlayerId, readonly Piece[]>; // For Crazyhouse
  [key: string]: unknown;
}

/**
 * Creates initial game state
 */
export function createGameState(
  id: EntityId,
  board: Board,
  players: readonly PlayerId[],
  startingPlayer: PlayerId,
  metadata?: GameStateMetadata
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
 * Applies a move to game state, returning new state
 * Does NOT validate the move - ruleset must validate before calling
 */
export function applyMove(
  state: GameState,
  move: Move,
  newBoard: Board,
  capturedPiece?: Piece,
  newMetadata?: GameStateMetadata
): GameState {
  const isCapture = !!capturedPiece;
  const isPawnMove = false; // Ruleset should determine this
  
  const newHalfmoveClock = (isCapture || isPawnMove) ? 0 : state.halfmoveClock + 1;
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
