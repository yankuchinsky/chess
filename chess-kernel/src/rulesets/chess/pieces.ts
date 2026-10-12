import { PieceType } from '../../core/types';

/**
 * Standard FIDE chess piece vocabulary.
 *
 * This module is pure data — type strings, display names, material values and
 * the initial back-rank layout. It contains NO rules: movement patterns,
 * setup logic and special rules live in `../chess-ruleset.ts`, which consumes
 * this vocabulary. Variant rulesets (Capablanca, Crazyhouse, hex chess) can
 * import and extend it (`withExtraPieces`) or define their own vocabulary
 * entirely, without touching either the kernel core or this file's consumers.
 */

export const CHESS_PIECES = {
  PAWN: 'pawn',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  ROOK: 'rook',
  QUEEN: 'queen',
  KING: 'king'
} as const satisfies Record<string, PieceType>;

export type ChessPieceName = keyof typeof CHESS_PIECES;
export type ChessPieceId = (typeof CHESS_PIECES)[ChessPieceName];

export interface ChessPieceSpec {
  readonly type: PieceType;
  readonly name: string;
  /** Material value for evaluation heuristics; king is non-comparable (0). */
  readonly value: number;
}

export const STANDARD_PIECE_SPECS: readonly ChessPieceSpec[] = [
  { type: CHESS_PIECES.PAWN, name: 'Pawn', value: 1 },
  { type: CHESS_PIECES.KNIGHT, name: 'Knight', value: 3 },
  { type: CHESS_PIECES.BISHOP, name: 'Bishop', value: 3 },
  { type: CHESS_PIECES.ROOK, name: 'Rook', value: 5 },
  { type: CHESS_PIECES.QUEEN, name: 'Queen', value: 9 },
  { type: CHESS_PIECES.KING, name: 'King', value: 0 }
];

/** Pieces a pawn may promote to (everything except pawns and kings). */
export const PROMOTION_TARGETS: readonly PieceType[] = [
  CHESS_PIECES.QUEEN,
  CHESS_PIECES.ROOK,
  CHESS_PIECES.BISHOP,
  CHESS_PIECES.KNIGHT
];

/** Files 0..7 of the white/black back rank (a..h), mirrored for both sides. */
export const BACK_RANK_LAYOUT: readonly PieceType[] = [
  CHESS_PIECES.ROOK,
  CHESS_PIECES.KNIGHT,
  CHESS_PIECES.BISHOP,
  CHESS_PIECES.QUEEN,
  CHESS_PIECES.KING,
  CHESS_PIECES.BISHOP,
  CHESS_PIECES.KNIGHT,
  CHESS_PIECES.ROOK
];

/** King's home file on standard boards. */
export const KING_FILE = 4;

/**
 * Extend the standard vocabulary with variant pieces (Capablanca's
 * archbishop/chancellor, shogi-style pieces, etc.). Non-mutating.
 */
export function withExtraPieces(
  extra: readonly ChessPieceSpec[],
  base: readonly ChessPieceSpec[] = STANDARD_PIECE_SPECS
): readonly ChessPieceSpec[] {
  const known = new Set(base.map(s => s.type));
  return [...base, ...extra.filter(s => !known.has(s.type))];
}
