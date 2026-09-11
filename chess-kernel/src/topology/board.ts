import { Position, EntityId } from '../core/types';
import { Piece } from '../core/piece';

/**
 * Abstract cell on any board topology
 */
export interface Cell {
  readonly position: Position;
  readonly piece?: Piece;
  readonly terrain?: TerrainType; // Optional terrain (mountain, water, etc.)
}

/**
 * Optional terrain types for advanced game mechanics
 */
export type TerrainType = string;

/**
 * Creates a cell at a given position
 */
export function createCell(position: Position, piece?: Piece, terrain?: TerrainType): Cell {
  return Object.freeze({
    position,
    piece,
    terrain
  });
}

/**
 * Returns a new cell with updated piece
 */
export function setCellPiece(cell: Cell, piece?: Piece): Cell {
  return createCell(cell.position, piece, cell.terrain);
}

/**
 * Board topology definition
 * Engine doesn't know the shape - topology defines valid positions and neighbors
 */
export interface Topology {
  /**
   * Unique identifier for this topology
   */
  readonly id: string;
  
  /**
   * Human-readable name
   */
  readonly name: string;
  
  /**
   * Dimensionality of the coordinate system
   */
  readonly dimensions: number;
  
  /**
   * Checks if a position is valid in this topology
   */
  isValidPosition(position: Position): boolean;
  
  /**
   * Gets all valid positions in the topology (for finite boards)
   * Returns undefined for infinite boards
   */
  getAllPositions(): readonly Position[] | undefined;
  
  /**
   * Gets neighboring positions for a given position
   * Used for movement validation and adjacency checks
   */
  getNeighbors(position: Position): readonly Position[];
  
  /**
   * Calculates distance between two positions (optional, topology-specific metric)
   */
  distance?(from: Position, to: Position): number;
}

/**
 * Abstract board that works with any topology
 */
export interface Board {
  readonly topology: Topology;
  readonly cells: ReadonlyMap<string, Cell>; // Key: serialized position
  readonly pieces: ReadonlyMap<EntityId, Piece>;
  readonly width?: number; // Optional, for rectangular boards
  readonly height?: number;
}

/**
 * Serializes a position to a string key for Map storage
 */
export function serializePosition(position: Position): string {
  return position.coords.join(':');
}

/**
 * Deserializes a string key back to a Position
 */
export function deserializePosition(key: string): Position {
  const coords = key.split(':').map(c => {
    const num = Number(c);
    return isNaN(num) ? c : num;
  });
  return { coords: Object.freeze(coords) };
}

/**
 * Creates a board instance
 */
export function createBoard(
  topology: Topology,
  initialPieces: readonly Piece[] = []
): Board {
  const cells = new Map<string, Cell>();
  const pieces = new Map<EntityId, Piece>();
  
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
    cells: new Map(cells) as ReadonlyMap<string, Cell>,
    pieces: new Map(pieces) as ReadonlyMap<EntityId, Piece>
  });
}

/**
 * Gets a piece at a specific position
 */
export function getPieceAt(board: Board, position: Position): Piece | undefined {
  const key = serializePosition(position);
  const cell = board.cells.get(key);
  return cell?.piece;
}

/**
 * Returns a new board with a piece moved to a new position
 */
export function movePieceOnBoard(
  board: Board,
  pieceId: EntityId,
  toPosition: Position
): Board | null {
  const piece = board.pieces.get(pieceId);
  if (!piece || !piece.position) return null;
  
  const fromKey = serializePosition(piece.position);
  const toKey = serializePosition(toPosition);
  
  const fromCell = board.cells.get(fromKey);
  const toCell = board.cells.get(toKey);
  
  if (!fromCell || !toCell) return null;
  
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
  newPieces.set(pieceId, Object.freeze(movedPiece) as Piece);
  
  // Remove captured piece if any
  if (capturedPiece) {
    newPieces.delete(capturedPiece.id);
  }
  
  return Object.freeze({
    ...board,
    cells: newCells as ReadonlyMap<string, Cell>,
    pieces: newPieces as ReadonlyMap<EntityId, Piece>
  });
}

/**
 * Returns a new board with a piece placed at a position (for drops in Crazyhouse)
 */
export function placePieceOnBoard(
  board: Board,
  piece: Piece,
  position: Position
): Board | null {
  if (!board.topology.isValidPosition(position)) return null;
  
  const key = serializePosition(position);
  const cell = board.cells.get(key);
  if (!cell || cell.piece) return null; // Can't place on occupied cell
  
  const newCell = setCellPiece(cell, piece);
  const newCells = new Map(board.cells);
  newCells.set(key, newCell);
  
  const newPieces = new Map(board.pieces);
  const placedPiece = { ...piece, position };
  newPieces.set(piece.id, Object.freeze(placedPiece) as Piece);
  
  return Object.freeze({
    ...board,
    cells: newCells as ReadonlyMap<string, Cell>,
    pieces: newPieces as ReadonlyMap<EntityId, Piece>
  });
}

/**
 * Returns a new board with a piece removed (for captures to hand)
 */
export function removePieceFromBoard(
  board: Board,
  pieceId: EntityId
): Board | null {
  const piece = board.pieces.get(pieceId);
  if (!piece || !piece.position) return null;
  
  const key = serializePosition(piece.position);
  const cell = board.cells.get(key);
  if (!cell) return null;
  
  const newCell = setCellPiece(cell, undefined);
  const newCells = new Map(board.cells);
  newCells.set(key, newCell);
  
  const newPieces = new Map(board.pieces);
  newPieces.delete(pieceId);
  
  return Object.freeze({
    ...board,
    cells: newCells as ReadonlyMap<string, Cell>,
    pieces: newPieces as ReadonlyMap<EntityId, Piece>
  });
}
