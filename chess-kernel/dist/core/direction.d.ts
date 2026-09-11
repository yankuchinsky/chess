import { Position } from './types';
/**
 * Direction in any topology
 * Represents a delta that can be applied to a position
 * For square boards: [1, 0] = one step right
 * For hex boards (axial): [1, -1] = southeast direction
 */
export type DirectionDelta = readonly number[];
/**
 * Abstract direction that works with any coordinate system
 */
export interface Direction {
    readonly delta: DirectionDelta;
    readonly id?: string;
}
/**
 * Creates a direction from a delta array
 */
export declare function createDirection(...delta: number[]): Direction;
/**
 * Applies a direction delta to a position, returning a new position
 * This is topology-agnostic - just adds numbers component-wise
 */
export declare function applyDirection(position: Position, direction: Direction, steps?: number): Position;
/**
 * Checks if two directions are equivalent (same delta)
 */
export declare function directionsEqual(a: Direction, b: Direction): boolean;
/**
 * Reverses a direction (negates the delta)
 */
export declare function reverseDirection(direction: Direction): Direction;
//# sourceMappingURL=direction.d.ts.map