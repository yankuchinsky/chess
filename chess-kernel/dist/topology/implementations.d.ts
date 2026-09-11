import { Position } from '../core/types';
import { Topology } from './board';
/**
 * Standard rectangular board topology (8x8, 10x8, etc.)
 * Works for chess, checkers, shogi, and other square-board games
 */
export declare class RectangularTopology implements Topology {
    readonly id: string;
    readonly name: string;
    readonly dimensions = 2;
    readonly width: number;
    readonly height: number;
    constructor(width: number, height: number, id?: string);
    isValidPosition(position: Position): boolean;
    getAllPositions(): readonly Position[];
    getNeighbors(position: Position): readonly Position[];
    distance(from: Position, to: Position): number;
}
/**
 * Hexagonal board topology using axial coordinates
 * Common variants: hex7 (radius 1), hex19 (radius 2), hex37 (radius 3)
 */
export declare class HexagonalTopology implements Topology {
    readonly id: string;
    readonly name: string;
    readonly dimensions = 2;
    readonly radius: number;
    constructor(radius: number, id?: string);
    isValidPosition(position: Position): boolean;
    getAllPositions(): readonly Position[];
    getNeighbors(position: Position): readonly Position[];
    distance(from: Position, to: Position): number;
}
/**
 * Custom topology from explicit position list
 * Useful for irregular boards, maps with obstacles, or special game boards
 */
export declare class CustomTopology implements Topology {
    readonly id: string;
    readonly name: string;
    readonly dimensions: number;
    private readonly validPositions;
    private readonly positionList;
    private readonly neighborMap;
    constructor(positions: readonly Position[], neighbors: Map<string, readonly Position[]>, id: string, name: string);
    isValidPosition(position: Position): boolean;
    getAllPositions(): readonly Position[];
    getNeighbors(position: Position): readonly Position[];
}
//# sourceMappingURL=implementations.d.ts.map