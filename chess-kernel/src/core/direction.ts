import { Position, Coordinate } from './types';

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
  readonly id?: string; // Optional identifier for debugging
}

/**
 * Creates a direction from a delta array
 */
export function createDirection(...delta: number[]): Direction {
  return { delta: Object.freeze(delta) };
}

/**
 * Applies a direction delta to a position, returning a new position
 * This is topology-agnostic - just adds numbers component-wise
 */
export function applyDirection(position: Position, direction: Direction, steps: number = 1): Position {
  const newCoords = position.coords.map((coord, i) => {
    if (typeof coord === 'number' && i < direction.delta.length) {
      return coord + direction.delta[i] * steps;
    }
    return coord; // Non-numeric coords stay unchanged (e.g., file letters)
  });
  
  return { coords: Object.freeze(newCoords) as Coordinate };
}

/**
 * Checks if two directions are equivalent (same delta)
 */
export function directionsEqual(a: Direction, b: Direction): boolean {
  if (a.delta.length !== b.delta.length) return false;
  return a.delta.every((d, i) => d === b.delta[i]);
}

/**
 * Reverses a direction (negates the delta)
 */
export function reverseDirection(direction: Direction): Direction {
  return {
    delta: Object.freeze(direction.delta.map(d => -d)),
    id: direction.id ? `rev_${direction.id}` : undefined
  };
}
