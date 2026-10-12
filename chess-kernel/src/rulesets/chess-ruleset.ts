import { PlayerId, PieceType, Position, createPosition, positionsEqual } from '../core/types';
import { Piece, createPiece, transformPiece } from '../core/piece';
import {
  Board,
  createBoard,
  getPieceAt,
  movePieceOnBoard,
  removePieceFromBoard
} from '../topology/board';
import {
  GameState,
  GameResult,
  GameStateMetadata,
  Move,
  createGameState,
  createMove,
  applyMove
} from '../state/game-state';
import { MovementPattern, PieceDefinition, RuleSet } from '../core/ruleset';
import { generatePatternTargets, translatePosition, MovementContext } from './movement';

/**
 * Standard FIDE-style chess ruleset (square 8x8 boards).
 *
 * Implements: all piece movements, captures, check/checkmate/stalemate,
 * castling, en passant, pawn promotion, fifty-move rule and basic
 * insufficient-material draw detection.
 *
 * Coordinate convention: [file, rank], file 0..7 = a..h,
 * rank 0 = white back rank, rank 7 = black back rank (white moves "up").
 */

const WHITE = 'white';
const BLACK = 'black';

interface ChessMeta {
  castlingRights: Record<string, { kingSide: boolean; queenSide: boolean }>;
  enPassantTarget?: Position | null;
}

function readMeta(state: GameState): ChessMeta {
  const m = (state.metadata ?? {}) as Record<string, unknown>;
  return {
    castlingRights: (m.castlingRights as ChessMeta['castlingRights']) ?? {},
    enPassantTarget: (m.enPassantTarget as Position | null | undefined) ?? null
  };
}

function pos(file: number, rank: number): Position {
  return createPosition(file, rank);
}

function key(p: Position): string {
  return p.coords.join(':');
}

export class ChessRuleSet implements RuleSet {
  readonly id = 'chess-standard';
  readonly name = 'Standard Chess';
  readonly requiredTopology = 'rect-8x8';

  readonly pieceDefinitions: readonly PieceDefinition[] = [
    { type: 'pawn', name: 'Pawn', value: 1 },
    { type: 'rook', name: 'Rook', value: 5 },
    { type: 'knight', name: 'Knight', value: 3 },
    { type: 'bishop', name: 'Bishop', value: 3 },
    { type: 'queen', name: 'Queen', value: 9 },
    { type: 'king', name: 'King', value: 0 }
  ];

  getPieceDefinition(type: PieceType): PieceDefinition | undefined {
    return this.pieceDefinitions.find(d => d.type === type);
  }

  // ------------------------------------------------------------------ setup

  setupGame(gameId: string, players: readonly PlayerId[], topology: Board['topology']): GameState {
    if (!topology.isValidPosition(pos(7, 7)) || !topology.isValidPosition(pos(0, 0))) {
      throw new Error(`ChessRuleSet requires at least an 8x8 board, got topology ${topology.id}`);
    }

    const white = players[0] ?? WHITE;
    const black = players[1] ?? BLACK;
    const pieces: Piece[] = [];
    // deterministic ids: e.g. white-pawn-4 (e2), black-king-4 (e8)
    const add = (type: PieceType, owner: PlayerId, file: number, rank: number) => {
      pieces.push(createPiece(`${owner}-${type}-${file}`, type, owner, pos(file, rank)));
    };

    const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let f = 0; f < 8; f++) {
      add(backRank[f], white, f, 0);
      add('pawn', white, f, 1);
      add('pawn', black, f, 6);
      add(backRank[f], black, f, 7);
    }

    const board = createBoard(topology, pieces);

    const metadata: GameStateMetadata = {
      castlingRights: {
        [white]: { kingSide: true, queenSide: true },
        [black]: { kingSide: true, queenSide: true }
      },
      enPassantTarget: null
    };

    return createGameState(gameId, board, [white, black], white, metadata);
  }

  // -------------------------------------------------------------- movement

  /** Declares movement patterns per piece type; orientation depends on owner. */
  patternsForOwner(type: PieceType, owner: PlayerId): readonly MovementPattern[] {
    const dir = owner === WHITE ? 1 : -1;
    const startRank = owner === WHITE ? 1 : 6;
    const promoRank = owner === WHITE ? 7 : 0;

    switch (type) {
      case 'pawn':
        return [
          {
            id: 'pawn-push',
            directions: [{ delta: [0, dir], minSteps: 1, maxSteps: 2 }],
            isSliding: false,
            canCapture: false,
            canMoveEmpty: true,
            metadata: { startRank, promoRank }
          },
          {
            id: 'pawn-capture',
            directions: [
              { delta: [-1, dir], minSteps: 1, maxSteps: 1 },
              { delta: [1, dir], minSteps: 1, maxSteps: 1 }
            ],
            isSliding: false,
            canCapture: true,
            canMoveEmpty: false,
            metadata: { promoRank }
          }
        ];
      case 'knight':
        return [{
          id: 'knight',
          directions: ([[-1, -2], [1, -2], [-2, -1], [2, -1],
                        [-2, 1], [2, 1], [-1, 2], [1, 2]] as number[][]).map(delta => ({ delta })),
          isSliding: false,
          canCapture: true,
          canMoveEmpty: true
        }];
      case 'bishop':
        return [{
          id: 'bishop',
          directions: ([[-1, -1], [1, -1], [-1, 1], [1, 1]] as number[][]).map(delta => ({ delta })),
          isSliding: true,
          canCapture: true,
          canMoveEmpty: true
        }];
      case 'rook':
        return [{
          id: 'rook',
          directions: ([[0, -1], [0, 1], [-1, 0], [1, 0]] as number[][]).map(delta => ({ delta })),
          isSliding: true,
          canCapture: true,
          canMoveEmpty: true
        }];
      case 'queen':
        return [{
          id: 'queen',
          directions: ([[0, -1], [0, 1], [-1, 0], [1, 0],
                        [-1, -1], [1, -1], [-1, 1], [1, 1]] as number[][]).map(delta => ({ delta })),
          isSliding: true,
          canCapture: true,
          canMoveEmpty: true
        }];
      case 'king':
        return [{
          id: 'king',
          directions: ([[0, -1], [0, 1], [-1, 0], [1, 0],
                        [-1, -1], [1, -1], [-1, 1], [1, 1]] as number[][]).map(delta => ({ delta })),
          isSliding: false,
          canCapture: true,
          canMoveEmpty: true
        }];
      default:
        return [];
    }
  }

  /** Pseudo-legal moves (may leave own king in check). Includes specials. */
  generateMoves(state: GameState, player: PlayerId): readonly Move[] {
    const moves: Move[] = [];
    const meta = readMeta(state);
    let moveId = 0;
    const nextId = () => `${state.id}-ply${state.moveHistory.length}-${moveId++}`;

    const ownPieces = [...state.board.pieces.values()].filter(p => p.owner === player && p.position);

    for (const piece of ownPieces) {
      const patterns = this.patternsForOwner(piece.type, piece.owner);

      for (const pattern of patterns) {
        const ctx: MovementContext = { board: state.board, piece };
        let targets = generatePatternTargets(ctx, pattern);

        if (pattern.id === 'pawn-push') {
          const { startRank, promoRank } = pattern.metadata as { startRank: number; promoRank: number };
          const [, fromRank] = piece.position!.coords as [number, number];
          // two-step only from the start rank (generator already stops lines on occupied cells)
          targets = targets.filter(t => {
            const [, rank] = t.coords as [number, number];
            return Math.abs(rank - fromRank) === 2 ? fromRank === startRank : true;
          });
          for (const to of targets) {
            const isPromotion = to.coords[1] === promoRank;
            for (const promo of this.promotionOptions(piece, isPromotion)) {
              moves.push(createMove(nextId(), piece.id, piece.position!, to, undefined, promo));
            }
          }
          continue;
        }

        if (pattern.id === 'pawn-capture') {
          const promoRank = (pattern.metadata as { promoRank: number }).promoRank;
          for (const to of targets) {
            const captured = getPieceAt(state.board, to)!;
            const isPromotion = to.coords[1] === promoRank;
            for (const promo of this.promotionOptions(piece, isPromotion)) {
              moves.push(createMove(nextId(), piece.id, piece.position!, to, captured.id, promo));
            }
          }

          // En passant: diagonal onto the (empty) target square behind an enemy pawn
          const ep = meta.enPassantTarget;
          if (ep) {
            const [pf, pr] = piece.position!.coords as [number, number];
            const [ef, er] = ep.coords as [number, number];
            if (Math.abs(ef - pf) === 1 && er === pr + (piece.owner === WHITE ? 1 : -1)) {
              const victim = getPieceAt(state.board, pos(ef, pr));
              if (victim && victim.owner !== player) {
                moves.push(createMove(nextId(), piece.id, piece.position!, ep, victim.id, { isEnPassant: true }));
              }
            }
          }
          continue;
        }

        for (const to of targets) {
          const captured = getPieceAt(state.board, to);
          moves.push(createMove(nextId(), piece.id, piece.position!, to, captured?.id));
        }
      }
    }

    // Castling
    const rights = meta.castlingRights[player];
    if (rights) {
      const king = ownPieces.find(p => p.type === 'king');
      if (king) {
        const [kf, kr] = king.position!.coords as [number, number];
        if (kf === 4 && kr === this.backRankOf(player)) {
          const opp = this.opponent(player);
          const attacked = new Set(this.getAttackedPositions(state, opp).map(key));
          const rookK = getPieceAt(state.board, pos(7, kr));
          const rookQ = getPieceAt(state.board, pos(0, kr));

          const pathFree = (files: number[]) => files.every(f => !getPieceAt(state.board, pos(f, kr)));
          // a square is unsafe if attacked OR occupied by an enemy piece (captures count as attacks)
          const pathSafe = (files: number[]) => files.every(f => {
            if (attacked.has(`${f}:${kr}`)) return false;
            const occ = getPieceAt(state.board, pos(f, kr));
            return !(occ && occ.owner !== player);
          });

          if (rights.kingSide && rookK?.type === 'rook' && rookK.owner === player &&
              pathFree([5, 6]) && pathSafe([4, 5, 6])) {
            moves.push(createMove(nextId(), king.id, king.position!, pos(6, kr), undefined,
              { isCastling: true, castlingRookId: rookK.id }));
          }
          if (rights.queenSide && rookQ?.type === 'rook' && rookQ.owner === player &&
              pathFree([1, 2, 3]) && pathSafe([4, 3, 2])) {
            moves.push(createMove(nextId(), king.id, king.position!, pos(2, kr), undefined,
              { isCastling: true, castlingRookId: rookQ.id }));
          }
        }
      }
    }

    return moves;
  }

  isValidMove(state: GameState, move: Move): boolean {
    if (state.phase === 'finished') return false;
    const piece = state.board.pieces.get(move.pieceId);
    if (!piece || piece.owner !== state.currentPlayer) return false;
    if (!piece.position || !positionsEqual(piece.position, move.from)) return false;
    if (!state.board.topology.isValidPosition(move.to)) return false;

    const pseudo = this.generateMoves(state, state.currentPlayer);
    const match = pseudo.find(m => this.sameMove(m, move));
    if (!match) return false;

    return this.moveIsSafe(state, state.currentPlayer, match);
  }

  executeMove(state: GameState, move: Move): GameState {
    if (!this.isValidMove(state, move)) {
      throw new Error(`Illegal move: [${move.from.coords}] -> [${move.to.coords}]`);
    }
    return this.executeMoveInternal(state, move);
  }

  private executeMoveInternal(state: GameState, move: Move): GameState {
    const piece = state.board.pieces.get(move.pieceId)!;
    const captured = move.capturedPieceId ? state.board.pieces.get(move.capturedPieceId) : undefined;
    const meta = readMeta(state);

    let board = movePieceOnBoard(state.board, move.pieceId, move.to);
    if (!board) throw new Error('Cannot execute move: bad positions');

    // En passant: physically remove the pawn standing beside the mover
    if (move.metadata?.isEnPassant && captured?.position) {
      board = removePieceFromBoard(board, captured.id) ?? board;
      board = clearCell(board, captured.position); // drop stale cell mapping too
    }

    // Castling: move the rook too
    if (move.metadata?.isCastling && move.metadata.castlingRookId) {
      const rank = move.to.coords[1] as number;
      const rookToFile = (move.to.coords[0] as number) === 6 ? 5 : 3;
      board = movePieceOnBoard(board, move.metadata.castlingRookId, pos(rookToFile, rank)) ?? board;
    }

    // Promotion
    if (move.metadata?.promotionType && piece.type === 'pawn') {
      const promoted = transformPiece(piece, move.metadata.promotionType as PieceType);
      board = replacePieceOnBoard(board, promoted);
    }

    // Update castling rights
    const rights: ChessMeta['castlingRights'] = JSON.parse(JSON.stringify(meta.castlingRights));
    const loseAll = (owner: PlayerId) => {
      if (rights[owner]) rights[owner] = { kingSide: false, queenSide: false };
    };
    if (piece.type === 'king') loseAll(piece.owner);
    if (captured?.type === 'rook' && captured.position) {
      const [cf, cr] = captured.position.coords as [number, number];
      const owner = captured.owner;
      if (rights[owner] && cr === this.backRankOf(owner)) {
        if (cf === 0) rights[owner] = { ...rights[owner], queenSide: false };
        if (cf === 7) rights[owner] = { ...rights[owner], kingSide: false };
      }
    }
    if (piece.type === 'rook' && piece.position) {
      const [f, r] = piece.position.coords as [number, number];
      const owner = piece.owner;
      if (rights[owner] && r === this.backRankOf(owner)) {
        if (f === 0) rights[owner] = { ...rights[owner], queenSide: false };
        if (f === 7) rights[owner] = { ...rights[owner], kingSide: false };
      }
    }

    // En passant target: set only after a double pawn push
    let enPassantTarget: Position | null = null;
    if (piece.type === 'pawn') {
      const [, fromRank] = move.from.coords as [number, number];
      const [, toRank] = move.to.coords as [number, number];
      if (Math.abs(toRank - fromRank) === 2) {
        enPassantTarget = pos(move.to.coords[0] as number, (fromRank + toRank) / 2);
      }
    }

    const newMetadata: GameStateMetadata = { castlingRights: rights, enPassantTarget };

    const advanced = applyMove(state, move, board, captured, newMetadata);
    // Fix halfmove clock: core applyMove cannot know about pawn moves (see its TODO)
    const resets = !!captured || piece.type === 'pawn';
    return Object.freeze({
      ...advanced,
      halfmoveClock: resets ? 0 : advanced.halfmoveClock
    }) as GameState;
  }

  // ---------------------------------------------------------------- checks

  isInCheck(state: GameState, player: PlayerId): boolean {
    const king = [...state.board.pieces.values()]
      .find(p => p.type === 'king' && p.owner === player && p.position);
    if (!king) return false;
    if (this.kingsAreFacing(state)) return true;
    return this.getAttackedPositions(state, this.opponent(player))
      .some(p => positionsEqual(p, king.position!));
  }

  /** True when the two kings share an unobstructed line (illegal in chess). */
  private kingsAreFacing(state: GameState): boolean {
    const kings = [...state.board.pieces.values()].filter(p => p.type === 'king' && p.position);
    if (kings.length < 2) return false;
    const [[f1, r1], [f2, r2]] = kings.map(k => k.position!.coords as [number, number]);
    if (f1 !== f2 && r1 !== r2 && Math.abs(f1 - f2) !== Math.abs(r1 - r2)) return false;
    const df = Math.sign(f2 - f1), dr = Math.sign(r2 - r1);
    let f = f1 + df, r = r1 + dr;
    while (f !== f2 || r !== r2) {
      if (getPieceAt(state.board, pos(f, r))) return false; // blocked
      f += df; r += dr;
    }
    return true;
  }

  /** Squares attacked by `player`'s pieces (includes pawn attack diagonals). */
  getAttackedPositions(state: GameState, player: PlayerId): readonly Position[] {
    const attacked: Position[] = [];
    const pieces = [...state.board.pieces.values()].filter(p => p.owner === player && p.position);

    for (const piece of pieces) {
      if (piece.type === 'pawn') {
        const dir = piece.owner === WHITE ? 1 : -1;
        for (const df of [-1, 1]) {
          const t = translatePosition(piece.position!, [df, dir]);
          if (t && state.board.topology.isValidPosition(t)) attacked.push(t);
        }
        continue;
      }

      const patterns = this.patternsForOwner(piece.type, player);
      for (const pattern of patterns) {
        for (const t of generatePatternTargets({ board: state.board, piece }, pattern)) {
          // A king attacks adjacent empty/enemy-occupied squares but never
          // squares defended by the enemy king (handled via facing-kings rule).
          attacked.push(t);
        }
      }
    }
    return attacked;
  }

  /**
   * Non-recursive attack probe: is `square` attacked by any piece of `byPlayer`,
   * including pawns (diagonals) and kings (adjacency)? Used for the
   * "kings may never face each other" rule without risking infinite recursion.
   */
  isSquareAttackedBy(state: GameState, square: Position, byPlayer: PlayerId): boolean {
    const pieces = [...state.board.pieces.values()]
      .filter(p => p.owner === byPlayer && p.position);
    for (const piece of pieces) {
      if (piece.type === 'pawn') {
        const dir = byPlayer === WHITE ? 1 : -1;
        for (const df of [-1, 1]) {
          const t = translatePosition(piece.position!, [df, dir]);
          if (t && positionsEqual(t, square)) return true;
        }
        continue;
      }
      for (const pattern of this.patternsForOwner(piece.type, byPlayer)) {
        if (generatePatternTargets({ board: state.board, piece }, pattern)
            .some(t => positionsEqual(t, square))) {
          return true;
        }
      }
    }
    return false;
  }

  /** True if `square` is attacked by any NON-KING piece of `byPlayer` (pawns included). */
  isSquareAttackedByNonKing(state: GameState, square: Position, byPlayer: PlayerId): boolean {
    const pieces = [...state.board.pieces.values()]
      .filter(p => p.owner === byPlayer && p.position && p.type !== 'king');
    for (const piece of pieces) {
      if (piece.type === 'pawn') {
        const dir = byPlayer === WHITE ? 1 : -1;
        for (const df of [-1, 1]) {
          const t = translatePosition(piece.position!, [df, dir]);
          if (t && positionsEqual(t, square)) return true;
        }
        continue;
      }
      for (const pattern of this.patternsForOwner(piece.type, byPlayer)) {
        if (generatePatternTargets({ board: state.board, piece }, pattern)
            .some(t => positionsEqual(t, square))) {
          return true;
        }
      }
    }
    return false;
  }

  // ------------------------------------------------------------- game over

  checkGameOver(state: GameState): GameResult {
    if (state.phase === 'finished') return state.result;

    const legal = this.getLegalMoves(state, state.currentPlayer);
    if (legal.length === 0) {
      if (this.isInCheck(state, state.currentPlayer)) {
        return { winner: this.opponent(state.currentPlayer), reason: 'checkmate' };
      }
      return { draw: true, reason: 'stalemate' };
    }

    if (state.halfmoveClock >= 100) {
      return { draw: true, reason: 'fifty-move-rule' };
    }

    if (this.isInsufficientMaterial(state)) {
      return { draw: true, reason: 'insufficient-material' };
    }

    return null;
  }

  /** Fully legal moves (filtered by check safety). */
  getLegalMoves(state: GameState, player: PlayerId): readonly Move[] {
    return this.generateMoves(state, player).filter(m => this.moveIsSafe(state, player, m));
  }

  /** Consistency guard + check-safety test for a generated move in `state`. */
  private moveIsSafe(state: GameState, player: PlayerId, move: Move): boolean {
    if (move.capturedPieceId) {
      const victim = state.board.pieces.get(move.capturedPieceId);
      if (!victim || !victim.position || !positionsEqual(victim.position, move.to)) {
        return false; // stale move object from another state
      }
    } else if (getPieceAt(state.board, move.to)) {
      return false;
    }
    return !this.isInCheck(this.executeMoveInternal(state, move), player);
  }

  private isInsufficientMaterial(state: GameState): boolean {
    const nonKings = [...state.board.pieces.values()].filter(p => p.type !== 'king');
    if (nonKings.length === 0) return true; // K vs K
    if (nonKings.length === 1) {
      const t = nonKings[0].type;
      return t === 'bishop' || t === 'knight'; // lone minor cannot mate
    }
    if (nonKings.length === 2 && nonKings.every(p => p.type === 'bishop')) {
      const colors = nonKings.map(p => {
        const [f, r] = p.position!.coords as [number, number];
        return (f + r) % 2;
      });
      if (colors[0] === colors[1]) return true; // same-color bishops
    }
    return false;
  }

  // --------------------------------------------------------------- helpers

  /** Promotion fan-out: a promoting pawn move expands into one move per piece. */
  private promotionOptions(
    piece: Piece,
    isPromotion: boolean
  ): ReadonlyArray<{ promotionType?: PieceType } | undefined> {
    if (!isPromotion || piece.type !== 'pawn') return [undefined];
    return ['queen', 'rook', 'bishop', 'knight'].map(t => ({ promotionType: t as PieceType }));
  }

  /** Moves match when piece/from/to agree; promotion type must agree too. */
  private sameMove(a: Move, b: Move): boolean {
    return a.pieceId === b.pieceId &&
      positionsEqual(a.from, b.from) &&
      positionsEqual(a.to, b.to) &&
      a.metadata?.promotionType === b.metadata?.promotionType;
  }

  private opponent(player: PlayerId): PlayerId {
    return player === WHITE ? BLACK : WHITE;
  }

  private backRankOf(player: PlayerId): number {
    return player === WHITE ? 0 : 7;
  }
}

function clearCell(board: Board, position: Position): Board {
  const k = key(position);
  const cell = board.cells.get(k);
  if (!cell || !cell.piece) return board;
  const cells = new Map(board.cells);
  cells.set(k, Object.freeze({ ...cell, piece: undefined }));
  return Object.freeze({ ...board, cells }) as Board;
}

function replacePieceOnBoard(board: Board, piece: Piece): Board {
  const cells = new Map(board.cells);
  if (piece.position) {
    const k = key(piece.position);
    const cell = cells.get(k);
    if (cell) cells.set(k, Object.freeze({ ...cell, piece }));
  }
  const pieces = new Map(board.pieces);
  pieces.set(piece.id, piece);
  return Object.freeze({ ...board, cells, pieces }) as Board;
}
