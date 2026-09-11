/**
 * Standard rectangular board topology (8x8, 10x8, etc.)
 * Works for chess, checkers, shogi, and other square-board games
 */
export class RectangularTopology {
    id;
    name;
    dimensions = 2;
    width;
    height;
    constructor(width, height, id) {
        this.width = width;
        this.height = height;
        this.id = id || `rect-${width}x${height}`;
        this.name = `${width}×${height} Rectangle`;
    }
    isValidPosition(position) {
        if (position.coords.length !== 2)
            return false;
        const [file, rank] = position.coords;
        if (typeof file !== 'number' || typeof rank !== 'number')
            return false;
        return file >= 0 && file < this.width && rank >= 0 && rank < this.height;
    }
    getAllPositions() {
        const positions = [];
        for (let rank = 0; rank < this.height; rank++) {
            for (let file = 0; file < this.width; file++) {
                positions.push({ coords: Object.freeze([file, rank]) });
            }
        }
        return positions;
    }
    getNeighbors(position) {
        if (!this.isValidPosition(position))
            return [];
        const [file, rank] = position.coords;
        const neighbors = [];
        // 8 directions for square board
        const deltas = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];
        for (const [df, dr] of deltas) {
            const newFile = file + df;
            const newRank = rank + dr;
            if (newFile >= 0 && newFile < this.width &&
                newRank >= 0 && newRank < this.height) {
                neighbors.push({ coords: Object.freeze([newFile, newRank]) });
            }
        }
        return neighbors;
    }
    distance(from, to) {
        const [f1, r1] = from.coords;
        const [f2, r2] = to.coords;
        // Chebyshev distance (max of absolute differences)
        return Math.max(Math.abs(f2 - f1), Math.abs(r2 - r1));
    }
}
/**
 * Hexagonal board topology using axial coordinates
 * Common variants: hex7 (radius 1), hex19 (radius 2), hex37 (radius 3)
 */
export class HexagonalTopology {
    id;
    name;
    dimensions = 2;
    radius;
    constructor(radius, id) {
        this.radius = radius;
        this.id = id || `hex-r${radius}`;
        this.name = `Hexagon (radius ${radius})`;
    }
    isValidPosition(position) {
        if (position.coords.length !== 2)
            return false;
        const [q, r] = position.coords;
        // Axial coordinate validation: |q| + |r| + |q+r| <= 2*radius
        // Simplified: max(|q|, |r|, |q+r|) <= radius for pointy-top hexes
        return Math.abs(q) <= this.radius &&
            Math.abs(r) <= this.radius &&
            Math.abs(q + r) <= this.radius;
    }
    getAllPositions() {
        const positions = [];
        for (let q = -this.radius; q <= this.radius; q++) {
            const rMin = Math.max(-this.radius, -q - this.radius);
            const rMax = Math.min(this.radius, -q + this.radius);
            for (let r = rMin; r <= rMax; r++) {
                positions.push({ coords: Object.freeze([q, r]) });
            }
        }
        return positions;
    }
    getNeighbors(position) {
        if (!this.isValidPosition(position))
            return [];
        const [q, r] = position.coords;
        const neighbors = [];
        // 6 hexagonal directions in axial coordinates
        const deltas = [
            [1, 0], [1, -1], [0, -1],
            [-1, 0], [-1, 1], [0, 1]
        ];
        for (const [dq, dr] of deltas) {
            const newQ = q + dq;
            const newR = r + dr;
            const newPos = { coords: Object.freeze([newQ, newR]) };
            if (this.isValidPosition(newPos)) {
                neighbors.push(newPos);
            }
        }
        return neighbors;
    }
    distance(from, to) {
        // Convert to cube coordinates for distance calculation
        const [q1, r1] = from.coords;
        const [q2, r2] = to.coords;
        const x1 = q1;
        const z1 = r1;
        const y1 = -x1 - z1;
        const x2 = q2;
        const z2 = r2;
        const y2 = -x2 - z2;
        // Manhattan distance in cube coordinates divided by 2
        return (Math.abs(x2 - x1) + Math.abs(y2 - y1) + Math.abs(z2 - z1)) / 2;
    }
}
/**
 * Custom topology from explicit position list
 * Useful for irregular boards, maps with obstacles, or special game boards
 */
export class CustomTopology {
    id;
    name;
    dimensions;
    validPositions;
    positionList;
    neighborMap;
    constructor(positions, neighbors, id, name) {
        this.id = id;
        this.name = name;
        this.positionList = positions;
        this.neighborMap = neighbors;
        this.dimensions = positions.length > 0 ? positions[0].coords.length : 0;
        this.validPositions = new Set(positions.map(p => p.coords.join(':')));
    }
    isValidPosition(position) {
        const key = position.coords.join(':');
        return this.validPositions.has(key);
    }
    getAllPositions() {
        return this.positionList;
    }
    getNeighbors(position) {
        const key = position.coords.join(':');
        return this.neighborMap.get(key) || [];
    }
}
//# sourceMappingURL=implementations.js.map