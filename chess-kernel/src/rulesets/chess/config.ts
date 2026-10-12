import { PlayerId, PieceType } from '../core/types';

/**
 * Configuration object for `ChessRuleSet` — the seam that keeps the ruleset
 * decoupled from hard-coded chess conventions.
 *
 * Defaults reproduce standard FIDE chess with the legacy player ids
 * ('white'/'black'). Variant authors override pieces/patterns (Capablanca),
 * orientation or board extents (large variant boards) without subclassing.
 */

export interface ChessOrientation {
  readonly firstPlayer: PlayerId;
  readonly secondPlayer: PlayerId;
  /** Coordinate index of the rank axis (axis pawns advance along). */
  readonly rankIndex: number;
  readonly homeRankFirst: number;
  readonly homeRankSecond: number;
  readonly pawnStartRankFirst: number;
  readonly pawnStartRankSecond: number;
  /** Promotion ranks are the home ranks of the opposing side. */
}

export interface BoardExtents {
  readonly minFile: number;
  readonly maxFile: number;
}

export interface ChessRuleSetConfig {
  readonly id?: string;
  readonly name?: string;
  readonly requiredTopology?: string;
  readonly orientation?: ChessOrientation;
  readonly extents?: BoardExtents;
  /** Piece-type strings treated as royal (check/mate is tracked for them). */
  readonly royalTypes?: readonly PieceType[];
  /** Piece types a "step-2" pawn may promote to. */
  readonly promotionTargets?: readonly PieceType[];
  /** Files of the rooks eligible for castling. */
  readonly castleRookFiles?: { readonly kingSide: number; readonly queenSide: number };
}

export const DEFAULT_CHESS_CONFIG: Required<Omit<ChessRuleSetConfig, 'orientation' | 'extents'>> = {
  id: 'chess-standard',
  name: 'Standard Chess',
  requiredTopology: 'rect-8x8',
  royalTypes: ['king'],
  promotionTargets: ['queen', 'rook', 'bishop', 'knight'],
  castleRookFiles: { kingSide: 7, queenSide: 0 }
};

export const DEFAULT_ORIENTATION: ChessOrientation = {
  firstPlayer: 'white',
  secondPlayer: 'black',
  rankIndex: 1,
  homeRankFirst: 0,
  homeRankSecond: 7,
  pawnStartRankFirst: 1,
  pawnStartRankSecond: 6
};

export const DEFAULT_EXTENTS: BoardExtents = { minFile: 0, maxFile: 7 };

export function resolveConfig(config: ChessRuleSetConfig = {}): {
  readonly id: string;
  readonly name: string;
  readonly requiredTopology: string;
  readonly royalTypes: readonly PieceType[];
  readonly promotionTargets: readonly PieceType[];
  readonly castleRookFiles: { kingSide: number; queenSide: number };
  readonly orientation: ChessOrientation;
  readonly extents: BoardExtents;
} {
  return {
    ...DEFAULT_CHESS_CONFIG,
    ...config,
    orientation: config.orientation ?? DEFAULT_ORIENTATION,
    extents: config.extents ?? DEFAULT_EXTENTS
  };
}
