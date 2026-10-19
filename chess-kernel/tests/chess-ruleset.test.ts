import { describe, it, expect } from 'vitest';
import {
  ChessRuleSet,
  RectangularTopology,
  GameState,
  Move,
  Position,
  Piece,
  createPosition,
  createPiece,
  createBoard,
  createMove,
  createGameState,
  getPieceAt,
  positionsEqual
} from '../src/index';
import { readChessStateMetadata } from '../src/rulesets/chess/state';
import type { ChessStateMetadata } from '../src/rulesets/chess/state';
import type { ChessMoveMetadata } from '../src/rulesets/chess/move';

const ruleset = new ChessRuleSet();
const board88 = new RectangularTopology(8, 8);

// [file, rank]: file 0=a..7=h, rank 0=white back rank
function p(file: number, rank: number): Position {
  return createPosition(file, rank);
}

function freshGame(): GameState {
  return ruleset.setupGame('g1', ['white', 'black'], board88);
}

/** Find a move by piece position + destination. */
function findMove(moves: readonly Move[], from: Position, to: Position): Move | undefined {
  return moves.find(m => positionsEqual(m.from, from) && positionsEqual(m.to, to));
}

function play(state: GameState, from: Position, to: Position): GameState {
  const move = findMove(ruleset.generateMoves(state, state.currentPlayer), from, to);
  if (!move) throw new Error(`No generated move ${from.coords} -> ${to.coords}`);
  return ruleset.executeMove(state, move);
}

// ------------------------------------------------------------------ setup

describe('ChessRuleSet setup', () => {
  it('places 32 pieces in standard arrangement', () => {
    const s = freshGame();
    expect(s.board.pieces.size).toBe(32);
    expect(getPieceAt(s.board, p(4, 0))?.type).toBe('king');
    expect(getPieceAt(s.board, p(3, 0))?.type).toBe('queen');
    expect(getPieceAt(s.board, p(0, 7))?.type).toBe('rook');
    expect(getPieceAt(s.board, p(6, 6))?.type).toBe('pawn');
    expect(s.currentPlayer).toBe('white');
    expect(s.phase).toBe('not-started');
  });

  it('rejects boards smaller than 8x8', () => {
    expect(() => ruleset.setupGame('g', ['w', 'b'], new RectangularTopology(6, 6))).toThrow();
  });

  it('exposes piece definitions with values', () => {
    expect(ruleset.getPieceDefinition('queen')?.value).toBe(9);
    expect(ruleset.getPieceDefinition('unicorn')).toBeUndefined();
  });
});

// ---------------------------------------------------------------- movement

describe('piece movement from starting position', () => {
  it('white has exactly 20 legal opening moves', () => {
    const s = freshGame();
    expect(ruleset.getLegalMoves(s, 'white')).toHaveLength(20);
  });

  it('knight e1... b1 goes to a3/c3 only (L-shape, blocked otherwise)', () => {
    const s = freshGame();
    const targets = ruleset.getLegalMoves(s, 'white')
      .filter(m => m.from.coords[0] === 1 && m.from.coords[1] === 0)
      .map(m => m.to.coords.join(','))
      .sort();
    expect(targets).toEqual(['0,2', '2,2']);
  });

  it('pawn double push allowed only from start rank', () => {
    let s = freshGame();
    s = play(s, p(4, 1), p(4, 3)); // e2-e4
    s = play(s, p(4, 6), p(4, 4)); // e7-e5
    // now white pawn on e4 can only go one step
    const e4moves = ruleset.getLegalMoves(s, 'white').filter(m => positionsEqual(m.from, p(4, 3)));
    expect(e4moves.map(m => m.to.coords[1]).sort()).toEqual([4]);
  });

  it('sliding pieces stop at first occupied square', () => {
    const pieces: Piece[] = [
      createPiece('wk', 'king', 'white', p(0, 0)),
      createPiece('wr', 'rook', 'white', p(0, 1)),
      createPiece('bp', 'pawn', 'black', p(0, 4)),
      createPiece('bk', 'king', 'black', p(7, 7))
    ];
    const s = createGameState('slide', createBoard(board88, pieces), ['white', 'black'], 'white');
    const rookMoves = ruleset.getLegalMoves(s, 'white').filter(m => m.pieceId === 'wr');
    const fileRanks = rookMoves.filter(m => m.to.coords[0] === 0).map(m => m.to.coords[1]).sort((a, b) => a - b);
    // downward: [0] occupied by own king -> no push; upward: stops ON the enemy pawn at rank 4
    expect(fileRanks).toEqual([2, 3, 4]);
    // sideways along rank 1: b1..g1 free, capture h-file? rook can also capture black pawn? none on rank1
    const files = rookMoves.filter(m => m.to.coords[1] === 1).map(m => m.to.coords[0]);
    expect(files.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('captures remove the enemy piece and advance turn/history', () => {
    let s = freshGame();
    s = play(s, p(4, 1), p(4, 3)); // e4
    s = play(s, p(3, 6), p(3, 4)); // d5
    const before = s.board.pieces.size;
    s = play(s, p(4, 3), p(3, 4)); // exd5
    expect(s.board.pieces.size).toBe(before - 1);
    expect(getPieceAt(s.board, p(3, 4))?.owner).toBe('white');
    expect(s.capturedPieces).toHaveLength(1);
    expect(s.moveHistory).toHaveLength(3);
  });
});

// ------------------------------------------------------------------- check

describe('check handling', () => {
  it('detects a real checkmate (rook + king vs king, ladder mate)', () => {
    const pieces: Piece[] = [
      createPiece('bk', 'king', 'black', p(7, 7)),
      createPiece('wk', 'king', 'white', p(5, 5)),
      createPiece('wr', 'rook', 'white', p(0, 6))
    ];
    const s = createGameState('mate2', createBoard(board88, pieces), ['white', 'black'], 'white');
    // White plays Rg8#? rook a7->g7? no. Move rook to g-file rank7: rook from (0,6) to (6,6) = Rg7 covers g-file & rank7?
    // King h8 escapes: h7 attacked by Rg7 (rank 7), g8 attacked by Rg7(file g) and Kf6 covers g7... g8 also adjacent to nothing else. Kh8 has no moves: g8 attacked by rook on g7? yes file g. h7 attacked rank 7. g7 occupied-attacked by rook & king. Mate only if rook protected at g7? Kxg7 possible? f6 king protects g7. So Rg7 is mate if black king can't capture (protected) and all escapes covered.
    const rg7 = findMove(ruleset.generateMoves(s, 'white'), p(0, 6), p(6, 6))!;
    const after = ruleset.executeMove(s, rg7);
    expect(ruleset.isInCheck(after, 'black')).toBe(true);
    expect(ruleset.getLegalMoves(after, 'black')).toHaveLength(0);
    expect(ruleset.checkGameOver(after)).toEqual({ winner: 'white', reason: 'checkmate' });
  });

  it('fool\'s mate gives black the win', () => {
    let s = freshGame();
    s = play(s, p(5, 1), p(5, 2)); // f3
    s = play(s, p(4, 6), p(4, 5)); // e6
    s = play(s, p(6, 1), p(6, 3)); // g4
    const qh4 = findMove(ruleset.generateMoves(s, 'black'), p(3, 7), p(7, 3)); // Qd8-h4#
    expect(qh4).toBeDefined();
    s = ruleset.executeMove(s, qh4!);
    expect(ruleset.checkGameOver(s)).toEqual({ winner: 'black', reason: 'checkmate' });
  });

  it('pins: king cannot move into check and pinned piece cannot leave line', () => {
    // White king e1, white knight e2... simpler: king e1, rook e8, pawn e2 -> king stuck
    const pieces: Piece[] = [
      createPiece('wk', 'king', 'white', p(4, 0)),
      createPiece('wp', 'pawn', 'white', p(4, 1)),
      createPiece('wr', 'rook', 'white', p(0, 0)),
      createPiece('bk', 'king', 'black', p(0, 7)),
      createPiece('br', 'rook', 'black', p(4, 7))
    ];
    const s = createGameState('pin', createBoard(board88, pieces), ['white', 'black'], 'white');
    const legal = ruleset.getLegalMoves(s, 'white');
    // pawn e2 may push (blocks file) but king may NOT stay on file? king can move sideways off file
    expect(findMove(legal, p(4, 0), p(3, 0))).toBeDefined(); // Kd1 ok
    expect(findMove(legal, p(4, 0), p(4, 1))).toBeUndefined(); // Kxe2 own piece
    // after pawn pushes, king still in check? no—pawn blocks. ensure rook e8 checks through empty e-file variant:
    const pieces2: Piece[] = [
      createPiece('wk', 'king', 'white', p(4, 0)),
      createPiece('bk', 'king', 'black', p(0, 7)),
      createPiece('br', 'rook', 'black', p(4, 7))
    ];
    const s2 = createGameState('pin2', createBoard(board88, pieces2), ['white', 'black'], 'white');
    expect(ruleset.isInCheck(s2, 'white')).toBe(true);
    const lm = ruleset.getLegalMoves(s2, 'white');
    // all legal king moves must escape the e-file or capture the rook
    expect(lm.every(m => m.to.coords[0] !== 4 || positionsEqual(m.to, p(4, 7)))).toBe(true);
  });

  it('stalemate is a draw', () => {
    const pieces: Piece[] = [
      createPiece('bk', 'king', 'black', p(7, 7)),
      createPiece('wq', 'queen', 'white', p(6, 5)),
      createPiece('wk', 'king', 'white', p(0, 0))
    ];
    const s = createGameState('sm', createBoard(board88, pieces), ['white', 'black'], 'black');
    expect(ruleset.isInCheck(s, 'black')).toBe(false);
    expect(ruleset.getLegalMoves(s, 'black')).toHaveLength(0);
    expect(ruleset.checkGameOver(s)).toEqual({ draw: true, reason: 'stalemate' });
  });
});

// -------------------------------------------------------------- castling

describe('castling', () => {
  function castlingSetup(withBlackAttackOnF1 = false): GameState {
    const pieces: Piece[] = [
      createPiece('wk', 'king', 'white', p(4, 0)),
      createPiece('wrh', 'rook', 'white', p(7, 0)),
      createPiece('wra', 'rook', 'white', p(0, 0)),
      createPiece('bk', 'king', 'black', p(4, 7))
    ];
    if (withBlackAttackOnF1) {
      pieces.push(createPiece('bn', 'knight', 'black', p(6, 2))); // knight g3 attacks f1 and h1
    }
    return createGameState('castle', createBoard(board88, pieces), ['white', 'black'], 'white', {
      castlingRights: { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } },
      enPassantTarget: null
    } satisfies ChessStateMetadata);
  }

  it('generates O-O when path clear and safe', () => {
    const s = castlingSetup();
    const oo = findMove(ruleset.generateMoves(s, 'white'), p(4, 0), p(6, 0));
    expect(oo?.metadata?.isCastling).toBe(true);
  });

  it('executes O-O: king g1, rook f1', () => {
    const s = castlingSetup();
    const oo = findMove(ruleset.generateMoves(s, 'white'), p(4, 0), p(6, 0))!;
    const after = ruleset.executeMove(s, oo);
    expect(getPieceAt(after.board, p(6, 0))?.type).toBe('king');
    expect(getPieceAt(after.board, p(5, 0))?.type).toBe('rook');
    expect(getPieceAt(after.board, p(7, 0))).toBeUndefined();
  });

  it('cannot castle through an attacked square (f1)', () => {
    const s = castlingSetup(true);
    expect(findMove(ruleset.getLegalMoves(s, 'white'), p(4, 0), p(6, 0))).toBeUndefined();
    // queenside still available (b1,c1,d1 free & safe)
    expect(findMove(ruleset.getLegalMoves(s, 'white'), p(4, 0), p(2, 0))).toBeDefined();
  });

  it('loses rights after king or rook moves; second castle impossible', () => {
    const s = castlingSetup();
    const oo = findMove(ruleset.generateMoves(s, 'white'), p(4, 0), p(6, 0))!;
    const after = ruleset.executeMove(s, oo);
    const blackMove = ruleset.getLegalMoves(after, 'black')[0];
    const afterBlack = ruleset.executeMove(after, blackMove);
    // white king already moved; no further castling
    expect(findMove(ruleset.generateMoves(afterBlack, 'white'), p(6, 0), p(4, 0))).toBeUndefined();
    const meta = afterBlack.metadata as Record<string, unknown>;
    const rights = meta.castlingRights as Record<string, { kingSide: boolean; queenSide: boolean }>;
    expect(rights.white.kingSide).toBe(false);
    expect(rights.white.queenSide).toBe(false);
  });
});

// ------------------------------------------------------------- en passant

describe('en passant', () => {
  it('records target after double push', () => {
    let s = freshGame();
    s = play(s, p(4, 1), p(4, 3)); // e4
    s = play(s, p(3, 6), p(3, 4)); // d5
    s = play(s, p(1, 0), p(2, 2)); // Nb1-c3 (waiting)
    s = play(s, p(2, 6), p(2, 4)); // c5 double push -> ep target c6
    const meta = s.metadata as Record<string, unknown>;
    expect((meta.enPassantTarget as Position).coords).toEqual([2, 5]);
  });

  it('captures en passant and removes the victim pawn', () => {
    const pieces: Piece[] = [
      createPiece('wk', 'king', 'white', p(4, 0)),
      createPiece('wp', 'pawn', 'white', p(3, 4)),
      createPiece('bp', 'pawn', 'black', p(4, 4)),
      createPiece('bk', 'king', 'black', p(0, 7))
    ];
    const st = createGameState('ep', createBoard(board88, pieces), ['white', 'black'], 'white', {
      castlingRights: {},
      enPassantTarget: p(4, 5)
    });
    const ep = findMove(ruleset.generateMoves(st, 'white'), p(3, 4), p(4, 5));
    expect(ep?.metadata?.isEnPassant).toBe(true);
    const after = ruleset.executeMove(st, ep!);
    expect(getPieceAt(after.board, p(4, 5))?.type).toBe('pawn');
    expect(getPieceAt(after.board, p(4, 4))).toBeUndefined(); // victim removed
    expect(after.board.pieces.size).toBe(3);
  });

  it('target expires after one ply', () => {
    let s = freshGame();
    s = play(s, p(4, 1), p(4, 3)); // e4
    s = play(s, p(0, 6), p(0, 4)); // a5 double -> ep a6
    s = play(s, p(1, 0), p(2, 2)); // Nb1-c3 (waiting move)
    const meta = s.metadata as Record<string, unknown>;
    expect(meta.enPassantTarget).toBeNull();
  });
});

// -------------------------------------------------------------- promotion

describe('promotion', () => {
  it('pawn reaching last rank auto-promotes to queen', () => {
    const pieces: Piece[] = [
      createPiece('wk', 'king', 'white', p(0, 0)),
      createPiece('wp', 'pawn', 'white', p(6, 6)),
      createPiece('bk', 'king', 'black', p(0, 7))
    ];
    const s = createGameState('promo', createBoard(board88, pieces), ['white', 'black'], 'white');
    const mv = findMove(ruleset.generateMoves(s, 'white'), p(6, 6), p(6, 7))!;
    expect(mv.metadata?.promotionType).toBe('queen');
    const after = ruleset.executeMove(s, mv);
    expect(getPieceAt(after.board, p(6, 7))?.type).toBe('queen');
  });
});

// ------------------------------------------------------------ game results

describe('game over detection', () => {
  it('ongoing game returns null', () => {
    expect(ruleset.checkGameOver(freshGame())).toBeNull();
  });

  it('K vs K is insufficient material draw', () => {
    const pieces: Piece[] = [
      createPiece('wk', 'king', 'white', p(4, 0)),
      createPiece('bk', 'king', 'black', p(4, 7))
    ];
    const s = createGameState('kk', createBoard(board88, pieces), ['white', 'black'], 'white');
    expect(ruleset.checkGameOver(s)).toEqual({ draw: true, reason: 'insufficient-material' });
  });

  it('K+lonest bishop vs K is a draw', () => {
    const pieces: Piece[] = [
      createPiece('wk', 'king', 'white', p(4, 0)),
      createPiece('wb', 'bishop', 'white', p(2, 0)),
      createPiece('bk', 'king', 'black', p(4, 7))
    ];
    const s = createGameState('kb', createBoard(board88, pieces), ['white', 'black'], 'white');
    expect(ruleset.checkGameOver(s)).toEqual({ draw: true, reason: 'insufficient-material' });
  });

  it('state is immutable: executeMove does not mutate original', () => {
    const s = freshGame();
    const mv = findMove(ruleset.generateMoves(s, 'white'), p(4, 1), p(4, 3))!;
    const after = ruleset.executeMove(s, mv);
    expect(s.board.pieces.size).toBe(32);
    expect(s.moveHistory).toHaveLength(0);
    expect(after.moveHistory).toHaveLength(1);
    expect(after.currentPlayer).toBe('black');
  });

  it('isValidMove rejects wrong-turn and non-matching moves', () => {
    const s = freshGame();
    const blackPawnMove = createMove('x', 'black-pawn-4', p(4, 6), p(4, 5));
    expect(ruleset.isValidMove(s, blackPawnMove)).toBe(false);
    const bogus = createMove('y', 'white-pawn-4', p(4, 1), p(4, 7));
    expect(ruleset.isValidMove(s, bogus)).toBe(false);
  });

  it('executeMove throws on illegal move', () => {
    const s = freshGame();
    const bogus = createMove('y', 'white-pawn-4', p(4, 1), p(4, 7));
    expect(() => ruleset.executeMove(s, bogus)).toThrow(/Illegal/);
  });
});

// ------------------------------------------------------------ perft sanity

describe('perft (move generation sanity)', () => {
  function perft(state: GameState, depth: number): number {
    if (depth === 0) return 1;
    const moves = ruleset.getLegalMoves(state, state.currentPlayer);
    if (depth === 1) return moves.length;
    let n = 0;
    for (const m of moves) n += perft(ruleset.executeMove(state, m), depth - 1);
    return n;
  }

  it('depth 1 = 20, depth 2 = 400, depth 3 = 8902 from start', () => {
    const s = freshGame();
    expect(perft(s, 1)).toBe(20);
    expect(perft(s, 2)).toBe(400);
    expect(perft(s, 3)).toBe(8902);
  });
});
