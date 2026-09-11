import { Position, EntityId, PieceType, PlayerId } from './types';
/**
 * Abstract piece that exists on the board
 * Engine doesn't know what this piece does - ruleset defines behavior
 */
export interface Piece {
    readonly id: EntityId;
    readonly type: PieceType;
    readonly owner: PlayerId;
    readonly position?: Position;
}
/**
 * Creates a new piece instance
 */
export declare function createPiece(id: EntityId, type: PieceType, owner: PlayerId, position?: Position): Piece;
/**
 * Returns a new piece with updated position
 */
export declare function movePiece(piece: Piece, newPosition: Position | undefined): Piece;
/**
 * Returns a new piece with updated type (for promotions, transformations)
 */
export declare function transformPiece(piece: Piece, newType: PieceType): Piece;
//# sourceMappingURL=piece.d.ts.map