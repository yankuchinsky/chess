/**
 * Creates a position from coordinates
 */
export function createPosition(...coords) {
    return { coords: Object.freeze(coords) };
}
/**
 * Compares two positions for equality
 */
export function positionsEqual(a, b) {
    if (a.coords.length !== b.coords.length)
        return false;
    return a.coords.every((coord, i) => coord === b.coords[i]);
}
//# sourceMappingURL=types.js.map