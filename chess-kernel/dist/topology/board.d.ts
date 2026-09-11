import { Position, EntityId } from '../core/types';
import { Piece } from '../core/piece';
/**
 * Abstract cell on any board topology
 */
export interface Cell {
    readonly position: Position;
    readonly piece?: Piece;
    readonly terrain?: TerrainType;
}
/**
 * Optional terrain types for advanced game mechanics
 */
export type TerrainType = string;
/**
 * Creates a cell at a given position
 */
export declare function createCell(position: Position, piece?: Piece, terrain?: TerrainType): Cell;
/**
 * Returns a new cell with updated piece
 */
export declare function setCellPiece(cell: Cell, piece?: Piece): Cell;
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
    readonly cells: ReadonlyMap<string, Cell>;
    readonly pieces: ReadonlyMap<EntityId, Piece>;
    readonly width?: number;
    readonly height?: number;
}
/**
 * Serializes a position to a string key for Map storage
 */
export declare function serializePosition(position: Position): string;
/**
 * Deserializes a string key back to a Position
 */
export declare function deserializePosition(key: string): Position;
/**
 * Creates a board instance
 */
export declare function createBoard(topology: Topology, initialPieces?: readonly Piece[]): Board;
/**
 * Gets a piece at a specific position
 */
export declare function getPieceAt(board: Board, position: Position): Piece | undefined;
/**
 * Returns a new board with a piece moved to a new position
 */
export declare function movePieceOnBoard(board: Board, pieceId: EntityId, toPosition: Position): Board | null;
/**
 * Returns a new board with a piece placed at a position (for drops in Crazyhouse)
 */
export declare function placePieceOnBoard(board: Board, piece: Piece, position: Position): Board | null;
/**
 * Returns a new board with a piece removed (for captures to hand)
 */
export declare function removePieceFromBoard(board: Board, pieceId: EntityId): Board | null;
//# sourceMappingURL=board.d.ts.map