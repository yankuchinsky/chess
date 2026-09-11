/**
 * Unique identifier for any entity in the game
 */
export type EntityId = string;

/**
 * Player identifier - engine doesn't know about relationships, just IDs
 */
export type PlayerId = string;

/**
 * Piece type identifier (e.g., 'pawn', 'knight', 'dragon', 'queen')
 * Engine doesn't know what these mean - ruleset defines behavior
 */
export type PieceType = string;

/**
 * Generic coordinate system that works with any topology
 * For square boards: [file, rank] e.g., [0, 4] or ['a', 4]
 * For hex boards: axial coordinates [q, r] or cube coordinates [x, y, z]
 * For custom boards: any tuple of numbers/strings
 */
export type Coordinate = readonly (number | string)[];

/**
 * Abstract cell position on any board topology
 */
export interface Position {
  readonly coords: Coordinate;
}

/**
 * Creates a position from coordinates
 */
export function createPosition(...coords: Coordinate): Position {
  return { coords: Object.freeze(coords) };
}

/**
 * Compares two positions for equality
 */
export function positionsEqual(a: Position, b: Position): boolean {
  if (a.coords.length !== b.coords.length) return false;
  return a.coords.every((coord, i) => coord === b.coords[i]);
}
