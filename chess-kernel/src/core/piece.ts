import { Position, EntityId, PieceType, PlayerId } from './types';

/**
 * Abstract piece that exists on the board
 * Engine doesn't know what this piece does - ruleset defines behavior
 */
export interface Piece {
  readonly id: EntityId;
  readonly type: PieceType;
  readonly owner: PlayerId;
  readonly position?: Position; // Undefined if in hand (Crazyhouse) or off-board
}

/**
 * Creates a new piece instance
 */
export function createPiece(
  id: EntityId,
  type: PieceType,
  owner: PlayerId,
  position?: Position
): Piece {
  return Object.freeze({
    id,
    type,
    owner,
    position
  });
}

/**
 * Returns a new piece with updated position
 */
export function movePiece(piece: Piece, newPosition: Position | undefined): Piece {
  return createPiece(piece.id, piece.type, piece.owner, newPosition);
}

/**
 * Returns a new piece with updated type (for promotions, transformations)
 */
export function transformPiece(piece: Piece, newType: PieceType): Piece {
  return createPiece(piece.id, newType, piece.owner, piece.position);
}
