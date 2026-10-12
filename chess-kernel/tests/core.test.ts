import { describe, it, expect } from 'vitest';
import {
  createPosition,
  positionsEqual,
  createDirection,
  applyDirection,
  reverseDirection,
  directionsEqual,
  createPiece,
  movePiece,
  transformPiece,
  RectangularTopology,
  HexagonalTopology,
  createBoard,
  getPieceAt,
  movePieceOnBoard,
  serializePosition,
  deserializePosition
} from '../src/index';

describe('core types', () => {
  it('creates and compares positions', () => {
    const a = createPosition(3, 4);
    const b = createPosition(3, 4);
    const c = createPosition(4, 4);
    expect(positionsEqual(a, b)).toBe(true);
    expect(positionsEqual(a, c)).toBe(false);
    expect(positionsEqual(createPosition(1), createPosition(1, 2))).toBe(false);
  });

  it('freezes position coords (immutability)', () => {
    const p = createPosition(0, 0);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p.coords as any)[0] = 5;
    }).toThrow();
  });
});

describe('direction utilities', () => {
  it('applies direction with steps', () => {
    const start = createPosition(2, 2);
    const dir = createDirection(1, -1);
    expect(applyDirection(start, dir, 3).coords).toEqual([5, -1]);
  });

  it('reverses and compares directions', () => {
    const d = createDirection(1, 2);
    const r = reverseDirection(d);
    expect(r.delta).toEqual([-1, -2]);
    expect(directionsEqual(d, reverseDirection(r))).toBe(true);
  });
});

describe('pieces', () => {
  it('movePiece returns new piece with updated position', () => {
    const p = createPiece('id1', 'pawn', 'white', createPosition(1, 1));
    const moved = movePiece(p, createPosition(1, 3));
    expect(moved.position?.coords).toEqual([1, 3]);
    expect(p.position?.coords).toEqual([1, 1]); // original untouched
  });

  it('transformPiece changes type but keeps id/owner/position', () => {
    const p = createPiece('id1', 'pawn', 'white', createPosition(0, 7));
    const q = transformPiece(p, 'queen');
    expect(q.type).toBe('queen');
    expect(q.id).toBe('id1');
    expect(q.owner).toBe('white');
  });
});

describe('RectangularTopology', () => {
  const t = new RectangularTopology(8, 8);

  it('validates bounds', () => {
    expect(t.isValidPosition(createPosition(0, 0))).toBe(true);
    expect(t.isValidPosition(createPosition(7, 7))).toBe(true);
    expect(t.isValidPosition(createPosition(8, 0))).toBe(false);
    expect(t.isValidPosition(createPosition(-1, 0))).toBe(false);
  });

  it('enumerates all 64 cells', () => {
    expect(t.getAllPositions()).toHaveLength(64);
  });

  it('corner has 3 neighbors, center has 8', () => {
    expect(t.getNeighbors(createPosition(0, 0))).toHaveLength(3);
    expect(t.getNeighbors(createPosition(4, 4))).toHaveLength(8);
  });

  it('uses Chebyshev distance', () => {
    expect(t.distance(createPosition(0, 0), createPosition(3, 7))).toBe(7);
  });
});

describe('HexagonalTopology', () => {
  const t = new HexagonalTopology(2);

  it('has 19 cells for radius 2 (3*2*(2+1)+1)', () => {
    expect(t.getAllPositions()).toHaveLength(19);
  });

  it('center has 6 neighbors', () => {
    expect(t.getNeighbors(createPosition(0, 0))).toHaveLength(6);
  });

  it('rejects out-of-hex positions', () => {
    expect(t.isValidPosition(createPosition(3, 0))).toBe(false);
    expect(t.isValidPosition(createPosition(2, 2))).toBe(false); // |q+r|=4 > 2
  });

  it('computes hex distance via cube coords', () => {
    expect(t.distance(createPosition(0, 0), createPosition(2, 0))).toBe(2);
    expect(t.distance(createPosition(0, 0), createPosition(2, -2))).toBe(2);
  });
});

describe('board operations', () => {
  const topo = new RectangularTopology(8, 8);

  function boardWithPieces() {
    const wp = createPiece('wp1', 'pawn', 'white', createPosition(1, 1));
    const bp = createPiece('bp1', 'pawn', 'black', createPosition(1, 3));
    return { board: createBoard(topo, [wp, bp]), wp, bp };
  }

  it('serializes/deserializes positions round-trip', () => {
    const p = createPosition(5, 6);
    expect(deserializePosition(serializePosition(p))).toEqual(p);
  });

  it('getPieceAt finds pieces', () => {
    const { board, wp } = boardWithPieces();
    expect(getPieceAt(board, createPosition(1, 1))?.id).toBe(wp.id);
    expect(getPieceAt(board, createPosition(4, 4))).toBeUndefined();
  });

  it('movePieceOnBoard is immutable and clears origin', () => {
    const { board } = boardWithPieces();
    const moved = movePieceOnBoard(board, 'wp1', createPosition(1, 2));
    expect(moved).not.toBeNull();
    expect(getPieceAt(moved!, createPosition(1, 2))?.id).toBe('wp1');
    expect(getPieceAt(moved!, createPosition(1, 1))).toBeUndefined();
    // original board unchanged
    expect(getPieceAt(board, createPosition(1, 1))?.id).toBe('wp1');
  });

  it('movePieceOnBoard onto enemy removes captured piece', () => {
    const { board } = boardWithPieces();
    const moved = movePieceOnBoard(board, 'wp1', createPosition(1, 3));
    expect(getPieceAt(moved!, createPosition(1, 3))?.id).toBe('wp1');
    expect(moved!.pieces.has('bp1')).toBe(false);
    expect(moved!.pieces.size).toBe(1);
  });

  it('movePieceOnBoard to invalid cell returns null', () => {
    const { board } = boardWithPieces();
    expect(movePieceOnBoard(board, 'wp1', createPosition(9, 9))).toBeNull();
  });
});
