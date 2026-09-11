// Core types
export {
  EntityId,
  PlayerId,
  PieceType,
  Coordinate,
  Position,
  createPosition,
  positionsEqual
} from './core/types';

// Direction utilities
export {
  Direction,
  DirectionDelta,
  createDirection,
  applyDirection,
  directionsEqual,
  reverseDirection
} from './core/direction';

// Piece management
export {
  Piece,
  createPiece,
  movePiece,
  transformPiece
} from './core/piece';

// Board and topology
export {
  Cell,
  TerrainType,
  Topology,
  Board,
  createCell,
  setCellPiece,
  serializePosition,
  deserializePosition,
  createBoard,
  getPieceAt,
  movePieceOnBoard,
  placePieceOnBoard,
  removePieceFromBoard
} from './topology/board';

// Built-in topology implementations
export {
  RectangularTopology,
  HexagonalTopology,
  CustomTopology
} from './topology/implementations';

// Game state
export {
  Move,
  MoveMetadata,
  GamePhase,
  GameResult,
  GameState,
  GameStateMetadata,
  createMove,
  createGameState,
  applyMove,
  finishGame,
  getMovedPiece,
  getCapturedPiece
} from './state/game-state';

// Ruleset interface
export {
  PieceDefinition,
  MovementPattern,
  DirectionSpec,
  MovementCondition,
  RuleSet
} from './core/ruleset';
