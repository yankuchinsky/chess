/**
 * Creates a move instance
 */
export function createMove(id, pieceId, from, to, capturedPieceId, metadata) {
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
 * Creates initial game state
 */
export function createGameState(id, board, players, startingPlayer, metadata) {
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
export function applyMove(state, move, newBoard, capturedPiece, newMetadata) {
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
export function finishGame(state, result) {
    return Object.freeze({
        ...state,
        phase: 'finished',
        result
    });
}
/**
 * Gets the piece that was moved in a specific move
 */
export function getMovedPiece(state, move) {
    return state.board.pieces.get(move.pieceId);
}
/**
 * Gets the captured piece from a move
 */
export function getCapturedPiece(state, move) {
    if (!move.capturedPieceId)
        return undefined;
    // Check in captured pieces list
    return state.capturedPieces.find(p => p.id === move.capturedPieceId);
}
//# sourceMappingURL=game-state.js.map