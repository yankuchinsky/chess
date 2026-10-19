import { Position } from '../../core/types';

/**
 * Castling availability for one side, per rook family.
 */
export interface ChessCastlingRights {
  readonly kingSide: boolean;
  readonly queenSide: boolean;
}

/**
 * Chess-specific game state metadata.
 *
 * Lives in the ruleset layer, NOT in the kernel: `GameState.metadata` is an
 * opaque bag (`StateMetadata = Record<string, unknown>` on the kernel side)
 * that the engine only stores and replays. Only `ChessRuleSet` reads/writes
 * these fields and casts at the boundary via `readStateMeta()` below.
 */
export interface ChessStateMetadata {
  /** Per-player castling availability (keyed by player id). */
  readonly castlingRights: Record<string, ChessCastlingRights>;
  /** Square behind a pawn that just made a double push, or null. */
  readonly enPassantTarget?: Position | null;
}

/**
 * Read chess state metadata from the opaque kernel bag, applying defaults
 * for games whose state was built without chess fields.
 */
export function readChessStateMetadata(
  metadata: Record<string, unknown> | undefined
): ChessStateMetadata {
  const m = (metadata ?? {}) as Record<string, unknown>;
  return {
    castlingRights:
      (m.castlingRights as Record<string, ChessCastlingRights>) ?? {},
    enPassantTarget:
      (m.enPassantTarget as Position | null | undefined) ?? null
  };
}
