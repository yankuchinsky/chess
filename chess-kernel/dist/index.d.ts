export { EntityId, PlayerId, PieceType, Coordinate, Position, createPosition, positionsEqual } from './core/types';
export { Direction, DirectionDelta, createDirection, applyDirection, directionsEqual, reverseDirection } from './core/direction';
export { Piece, createPiece, movePiece, transformPiece } from './core/piece';
export { Cell, TerrainType, Topology, Board, createCell, setCellPiece, serializePosition, deserializePosition, createBoard, getPieceAt, movePieceOnBoard, placePieceOnBoard, removePieceFromBoard } from './topology/board';
export { RectangularTopology, HexagonalTopology, CustomTopology } from './topology/implementations';
export { Move, MoveMetadata, GamePhase, GameResult, GameState, GameStateMetadata, createMove, createGameState, applyMove, finishGame, getMovedPiece, getCapturedPiece } from './state/game-state';
export { PieceDefinition, MovementPattern, DirectionSpec, MovementCondition, RuleSet } from './core/ruleset';
//# sourceMappingURL=index.d.ts.map