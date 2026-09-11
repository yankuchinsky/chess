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
    readonly metadata?: MoveMetadata;
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
    readonly dropFromHand?: boolean;
    [key: string]: unknown;
}
/**
 * Creates a move instance
 */
export declare function createMove(id: EntityId, pieceId: EntityId, from: Position, to: Position, capturedPieceId?: EntityId, metadata?: MoveMetadata): Move;
/**
 * Game phase indicator
 */
export type GamePhase = 'not-started' | 'in-progress' | 'finished';
/**
 * Game result
 */
export type GameResult = {
    winner: PlayerId;
    reason: string;
} | {
    draw: true;
    reason: string;
} | null;
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
    readonly halfmoveClock: number;
    readonly fullmoveNumber: number;
    readonly moveHistory: readonly Move[];
    readonly capturedPieces: readonly Piece[];
    readonly metadata?: GameStateMetadata;
}
/**
 * Ruleset-specific metadata
 */
export interface GameStateMetadata {
    readonly castlingRights?: ReadonlySet<string>;
    readonly enPassantTarget?: Position;
    readonly playerHands?: Map<PlayerId, readonly Piece[]>;
    [key: string]: unknown;
}
/**
 * Creates initial game state
 */
export declare function createGameState(id: EntityId, board: Board, players: readonly PlayerId[], startingPlayer: PlayerId, metadata?: GameStateMetadata): GameState;
/**
 * Applies a move to game state, returning new state
 * Does NOT validate the move - ruleset must validate before calling
 */
export declare function applyMove(state: GameState, move: Move, newBoard: Board, capturedPiece?: Piece, newMetadata?: GameStateMetadata): GameState;
/**
 * Marks game as finished with a result
 */
export declare function finishGame(state: GameState, result: GameResult): GameState;
/**
 * Gets the piece that was moved in a specific move
 */
export declare function getMovedPiece(state: GameState, move: Move): Piece | undefined;
/**
 * Gets the captured piece from a move
 */
export declare function getCapturedPiece(state: GameState, move: Move): Piece | undefined;
//# sourceMappingURL=game-state.d.ts.map