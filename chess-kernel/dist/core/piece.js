/**
 * Creates a new piece instance
 */
export function createPiece(id, type, owner, position) {
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
export function movePiece(piece, newPosition) {
    return createPiece(piece.id, piece.type, piece.owner, newPosition);
}
/**
 * Returns a new piece with updated type (for promotions, transformations)
 */
export function transformPiece(piece, newType) {
    return createPiece(piece.id, newType, piece.owner, piece.position);
}
//# sourceMappingURL=piece.js.map