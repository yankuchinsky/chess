/**
 * Creates a direction from a delta array
 */
export function createDirection(...delta) {
    return { delta: Object.freeze(delta) };
}
/**
 * Applies a direction delta to a position, returning a new position
 * This is topology-agnostic - just adds numbers component-wise
 */
export function applyDirection(position, direction, steps = 1) {
    const newCoords = position.coords.map((coord, i) => {
        if (typeof coord === 'number' && i < direction.delta.length) {
            return coord + direction.delta[i] * steps;
        }
        return coord; // Non-numeric coords stay unchanged (e.g., file letters)
    });
    return { coords: Object.freeze(newCoords) };
}
/**
 * Checks if two directions are equivalent (same delta)
 */
export function directionsEqual(a, b) {
    if (a.delta.length !== b.delta.length)
        return false;
    return a.delta.every((d, i) => d === b.delta[i]);
}
/**
 * Reverses a direction (negates the delta)
 */
export function reverseDirection(direction) {
    return {
        delta: Object.freeze(direction.delta.map(d => -d)),
        id: direction.id ? `rev_${direction.id}` : undefined
    };
}
//# sourceMappingURL=direction.js.map