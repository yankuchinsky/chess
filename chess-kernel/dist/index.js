// Core types
export { createPosition, positionsEqual } from './core/types';
// Direction utilities
export { createDirection, applyDirection, directionsEqual, reverseDirection } from './core/direction';
// Piece management
export { createPiece, movePiece, transformPiece } from './core/piece';
// Board and topology
export { createCell, setCellPiece, serializePosition, deserializePosition, createBoard, getPieceAt, movePieceOnBoard, placePieceOnBoard, removePieceFromBoard } from './topology/board';
// Built-in topology implementations
export { RectangularTopology, HexagonalTopology, CustomTopology } from './topology/implementations';
// Game state
export { createMove, createGameState, applyMove, finishGame, getMovedPiece, getCapturedPiece } from './state/game-state';
//# sourceMappingURL=index.js.map