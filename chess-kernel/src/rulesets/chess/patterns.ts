import { PieceType } from '../../core/types';
import { MovementPattern, DirectionSpec } from '../../core/ruleset';
import { CHESS_PIECES } from './pieces';

/**
 * Declarative movement geometry for standard chess pieces.
 *
 * IMPORTANT: all deltas here are ABSOLUTE board deltas (rank axis grows "up"
 * the board). The only orientation-sensitive piece in chess is the pawn, so
 * pawn patterns use a symbolic forward delta `[0, FORWARD]` and the ruleset
 * resolves it through the injected `OrientedBoard.forwardOf()` via the
 * generator's `mapDirection` hook. Every other piece is symmetric, so its
 * pattern is identical for both players — no per-owner branching needed.
 */

/** Symbolic rank step replaced by the board's `forwardOf(player)` at runtime. */
export const FORWARD = 1;

const orthogonals: readonly DirectionSpec[] =
  ([[0, -1], [0, 1], [-1, 0], [1, 0]] as number[][]).map(delta => ({ delta }));

const diagonals: readonly DirectionSpec[] =
  ([[-1, -1], [1, -1], [-1, 1], [1, 1]] as number[][]).map(delta => ({ delta }));

const knightDeltas: readonly DirectionSpec[] =
  ([[-1, -2], [1, -2], [-2, -1], [2, -1],
    [-2, 1], [2, 1], [-1, 2], [1, 2]] as number[][]).map(delta => ({ delta }));

export const PAWN_PUSH: MovementPattern = {
  id: 'pawn-push',
  directions: [{ delta: [0, FORWARD], minSteps: 1, maxSteps: 2 }],
  isSliding: false,
  canCapture: false,
  canMoveEmpty: true
};

export const PAWN_CAPTURE: MovementPattern = {
  id: 'pawn-capture',
  directions: [[-1, FORWARD], [1, FORWARD]].map(delta => ({ delta })),
  isSliding: false,
  canCapture: true,
  canMoveEmpty: false
};

export const KNIGHT_MOVE: MovementPattern = {
  id: 'knight',
  directions: knightDeltas,
  isSliding: false,
  canCapture: true,
  canMoveEmpty: true
};

export const BISHOP_MOVE: MovementPattern = {
  id: 'bishop',
  directions: diagonals,
  isSliding: true,
  canCapture: true,
  canMoveEmpty: true
};

export const ROOK_MOVE: MovementPattern = {
  id: 'rook',
  directions: orthogonals,
  isSliding: true,
  canCapture: true,
  canMoveEmpty: true
};

export const QUEEN_MOVE: MovementPattern = {
  id: 'queen',
  directions: [...orthogonals, ...diagonals],
  isSliding: true,
  canCapture: true,
  canMoveEmpty: true
};

export const KING_MOVE: MovementPattern = {
  id: 'king',
  directions: [...orthogonals, ...diagonals],
  isSliding: false,
  canCapture: true,
  canMoveEmpty: true
};

/**
 * Attack-probe pattern: one step diagonally ahead, landing on empty squares
 * allowed. Used by the generic movement generator to compute pawn attack maps
 * without hand-rolled coordinate math (see `getAttackedPositions`).
 */
export const PAWN_ATTACK_PROBE: MovementPattern = {
  id: 'pawn-attack-probe',
  directions: [[-1, FORWARD], [1, FORWARD]].map(delta => ({ delta })),
  isSliding: false,
  canCapture: true,
  canMoveEmpty: true
};

/**
 * Registry mapping piece-type strings to their movement patterns.
 * Variant rulesets can build their own registry (`{ ...STANDARD_PATTERNS,
 * [MY_PIECE]: MY_PATTERN }`) without modifying this module.
 */
export const STANDARD_PATTERNS: Readonly<Record<PieceType, readonly MovementPattern[]>> = {
  [CHESS_PIECES.PAWN]: [PAWN_PUSH, PAWN_CAPTURE],
  [CHESS_PIECES.KNIGHT]: [KNIGHT_MOVE],
  [CHESS_PIECES.BISHOP]: [BISHOP_MOVE],
  [CHESS_PIECES.ROOK]: [ROOK_MOVE],
  [CHESS_PIECES.QUEEN]: [QUEEN_MOVE],
  [CHESS_PIECES.KING]: [KING_MOVE]
};
