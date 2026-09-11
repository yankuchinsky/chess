/**
 * Creates a cell at a given position
 */
export function createCell(position, piece, terrain) {
    return Object.freeze({
        position,
        piece,
        terrain
    });
}
/**
 * Returns a new cell with updated piece
 */
export function setCellPiece(cell, piece) {
    return createCell(cell.position, piece, cell.terrain);
}
/**
 * Serializes a position to a string key for Map storage
 */
export function serializePosition(position) {
    return position.coords.join(':');
}
/**
 * Deserializes a string key back to a Position
 */
export function deserializePosition(key) {
    const coords = key.split(':').map(c => {
        const num = Number(c);
        return isNaN(num) ? c : num;
    });
    return { coords: Object.freeze(coords) };
}
/**
 * Creates a board instance
 */
export function createBoard(topology, initialPieces = []) {
    const cells = new Map();
    const pieces = new Map();
    // Initialize all cells in the topology
    const allPositions = topology.getAllPositions();
    if (allPositions) {
        for (const position of allPositions) {
            const key = serializePosition(position);
            cells.set(key, createCell(position));
        }
    }
    // Place initial pieces
    for (const piece of initialPieces) {
        if (piece.position) {
            const key = serializePosition(piece.position);
            const cell = cells.get(key);
            if (cell) {
                const updatedCell = setCellPiece(cell, piece);
                cells.set(key, updatedCell);
            }
            pieces.set(piece.id, piece);
        }
    }
    return Object.freeze({
        topology,
        cells: new Map(cells),
        pieces: new Map(pieces)
    });
}
/**
 * Gets a piece at a specific position
 */
export function getPieceAt(board, position) {
    const key = serializePosition(position);
    const cell = board.cells.get(key);
    return cell?.piece;
}
/**
 * Returns a new board with a piece moved to a new position
 */
export function movePieceOnBoard(board, pieceId, toPosition) {
    const piece = board.pieces.get(pieceId);
    if (!piece || !piece.position)
        return null;
    const fromKey = serializePosition(piece.position);
    const toKey = serializePosition(toPosition);
    const fromCell = board.cells.get(fromKey);
    const toCell = board.cells.get(toKey);
    if (!fromCell || !toCell)
        return null;
    // Create new cells with updated pieces
    const newFromCell = setCellPiece(fromCell, undefined);
    const capturedPiece = toCell.piece;
    const newToCell = setCellPiece(toCell, piece);
    // Update cells map
    const newCells = new Map(board.cells);
    newCells.set(fromKey, newFromCell);
    newCells.set(toKey, newToCell);
    // Update pieces map
    const newPieces = new Map(board.pieces);
    const movedPiece = { ...piece, position: toPosition };
    newPieces.set(pieceId, Object.freeze(movedPiece));
    // Remove captured piece if any
    if (capturedPiece) {
        newPieces.delete(capturedPiece.id);
    }
    return Object.freeze({
        ...board,
        cells: newCells,
        pieces: newPieces
    });
}
/**
 * Returns a new board with a piece placed at a position (for drops in Crazyhouse)
 */
export function placePieceOnBoard(board, piece, position) {
    if (!board.topology.isValidPosition(position))
        return null;
    const key = serializePosition(position);
    const cell = board.cells.get(key);
    if (!cell || cell.piece)
        return null; // Can't place on occupied cell
    const newCell = setCellPiece(cell, piece);
    const newCells = new Map(board.cells);
    newCells.set(key, newCell);
    const newPieces = new Map(board.pieces);
    const placedPiece = { ...piece, position };
    newPieces.set(piece.id, Object.freeze(placedPiece));
    return Object.freeze({
        ...board,
        cells: newCells,
        pieces: newPieces
    });
}
/**
 * Returns a new board with a piece removed (for captures to hand)
 */
export function removePieceFromBoard(board, pieceId) {
    const piece = board.pieces.get(pieceId);
    if (!piece || !piece.position)
        return null;
    const key = serializePosition(piece.position);
    const cell = board.cells.get(key);
    if (!cell)
        return null;
    const newCell = setCellPiece(cell, undefined);
    const newCells = new Map(board.cells);
    newCells.set(key, newCell);
    const newPieces = new Map(board.pieces);
    newPieces.delete(pieceId);
    return Object.freeze({
        ...board,
        cells: newCells,
        pieces: newPieces
    });
}
//# sourceMappingURL=board.js.map