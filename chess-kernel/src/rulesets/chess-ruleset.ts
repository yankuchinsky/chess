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
import { ChessMoveMetadata } from './chess/move';
import { generatePatternTargets, translatePosition, MovementContext } from './movement';
import { hasOrientation, OrientedBoard } from './geometry';
import {
  CHESS_PIECES,
  STANDARD_PIECE_SPECS,
  BACK_RANK_LAYOUT,
  KING_FILE
} from './chess/pieces';
import { STANDARD_PATTERNS, PAWN_PUSH, PAWN_CAPTURE, PAWN_ATTACK_PROBE, FORWARD } from './chess/patterns';
import { ChessRuleSetConfig, resolveConfig } from './chess/config';

/**
 * Standard FIDE-style chess ruleset (square 8x8 boards).
 *
 * Implements: all piece movements, captures, check/checkmate/stalemate,
 * castling, en passant, pawn promotion, fifty-move rule and basic
 * insufficient-material draw detection.
 *
 * Layering note: this file contains RULES only. The piece vocabulary lives in
 * `chess/pieces.ts`, movement geometry in `chess/patterns.ts`, board
 * orientation requirements in `geometry.ts` and tunable conventions in
 * `chess/config.ts`. Variant rulesets compose those modules instead of
 * copying this one.
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

/**
 * Read chess-specific move metadata from an opaque kernel `Move`. The kernel
 * stores `metadata` as a plain data bag; only this ruleset knows its shape.
 */
function chessMetaOf(move: Move): ChessMoveMetadata {
  return (move.metadata ?? {}) as ChessMoveMetadata;
}

/**
 * Promotion fan-out: one entry per legal promotion target (or a single
 * `undefined` entry when the move is not a promotion).
 */
function expandPromotions(
  base: ChessMoveMetadata,
  piece: Piece,
  isPromotion: boolean,
  targets: readonly PieceType[]
): ChessMoveMetadata[] {
  if (!isPromotion || piece.type !== CHESS_PIECES.PAWN) return [base];
  return targets.map(t => ({ ...base, promotionType: t }));
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
  readonly id: string;
  readonly name: string;
  readonly requiredTopology: string;

  private readonly cfg: ReturnType<typeof resolveConfig>;
  /** Orientation capability resolved from the board at setup time. */
  private orientation?: OrientedBoard;

  constructor(config: ChessRuleSetConfig = {}) {
    this.cfg = resolveConfig(config);
    this.id = this.cfg.id;
    this.name = this.cfg.name;
    this.requiredTopology = this.cfg.requiredTopology;
  }

  readonly pieceDefinitions: readonly PieceDefinition[] = STANDARD_PIECE_SPECS;

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
    // Boards that expose orientation opt into it; otherwise fall back to the
    // configured default so plain test boards keep working.
    this.orientation = hasOrientation(topology) ? topology : undefined;
    const pieces: Piece[] = [] as Piece[];
    // deterministic ids: e.g. white-pawn-4 (e2), black-king-4 (e8)
    const add = (type: PieceType, owner: PlayerId, file: number, rank: number) => {
      pieces.push(createPiece(`${owner}-${type}-${file}`, type, owner, pos(file, rank)));
    };

    for (let f = 0; f < 8; f++) {
      add(BACK_RANK_LAYOUT[f], white, f, this.homeRankOf(white));
      add(CHESS_PIECES.PAWN, white, f, this.pawnStartRankOf(white));
      add(CHESS_PIECES.PAWN, black, f, this.pawnStartRankOf(black));
      add(BACK_RANK_LAYOUT[f], black, f, this.homeRankOf(black));
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

  /**
   * Movement patterns per piece type. Patterns are declared once (absolute
   * deltas with a symbolic `FORWARD` step for pawns); the board's orientation
   * resolves `FORWARD` per owner through the generator's `mapDirection` hook.
   */
  patternsFor(type: PieceType): readonly MovementPattern[] {
    return STANDARD_PATTERNS[type] ?? [];
  }

  private movementCtx(board: Board, piece: Piece): MovementContext {
    const forward = (player: PlayerId): readonly number[] => {
      if (this.orientation) return this.orientation.forwardOf(player);
      // Default rectangular convention: first player advances along +rank.
      const sign = this.isFirstPlayer(player) ? 1 : -1;
      return [0, sign];
    };
    return {
      board,
      piece,
      mapDirection: (delta, owner) => {
        if (delta[this.cfg.orientation.rankIndex] !== FORWARD) return delta;
        const fwd = forward(owner);
        return delta.map((d, i) => (i === this.cfg.orientation.rankIndex ? fwd[i] : d));
      }
    };
  }

  /** Pseudo-legal moves (may leave own king in check). Includes specials. */
  generateMoves(state: GameState, player: PlayerId): readonly Move[] {
    const moves: Move[] = [];
    const meta = readMeta(state);
    let moveId = 0;
    // Ply number is snapshotted once: generateMoves() runs against a single
    // immutable state, so every candidate belongs to the same ply.
    const ply = state.moveHistory.length;
    const nextId = () => `${state.id}-ply${ply}-${moveId++}`;

    const ownPieces = [...state.board.pieces.values()].filter(p => p.owner === player && p.position);

    for (const piece of ownPieces) {
      const patterns = this.patternsFor(piece.type);

      for (const pattern of patterns) {
        const ctx = this.movementCtx(state.board, piece);
        let targets = generatePatternTargets(ctx, pattern);

        if (pattern === PAWN_PUSH) {
          const startRank = this.pawnStartRankOf(piece.owner);
          const promoRank = this.promotionRankOf(piece.owner);
          const fromRank = this.rankOf(piece.position!);
          // two-step only from the start rank (generator already stops lines on occupied cells)
          targets = targets.filter(t => {
            const rank = this.rankOf(t);
            return Math.abs(rank - fromRank) === 2 ? fromRank === startRank : true;
          });
          for (const to of targets) {
            const isPromotion = this.rankOf(to) === promoRank;
            for (const promo of expandPromotions({}, piece, isPromotion, this.cfg.promotionTargets)) {
              moves.push(createMove(nextId(), piece.id, piece.position!, to, undefined, promo));
            }
          }
          continue;
        }

        if (pattern === PAWN_CAPTURE) {
          const promoRank = this.promotionRankOf(piece.owner);
          const ep = meta.enPassantTarget;
          for (const to of targets) {
            // A diagonal push onto an *empty* square is only legal as en passant.
            if (!getPieceAt(state.board, to) && !this.isEnPassantSquare(state, piece, to, ep)) {
              continue;
            }
            const captured = getPieceAt(state.board, to) ?? this.enPassantVictim(state, piece, to, ep);
            const isPromotion = this.rankOf(to) === promoRank;
            const isEp = !!captured && !positionsEqual(captured.position!, to);
            const base: ChessMoveMetadata = isEp ? { isEnPassant: true } : {};
            for (const promo of expandPromotions(base, piece, isPromotion, this.cfg.promotionTargets)) {
              moves.push(createMove(
                nextId(), piece.id, piece.position!, to,
                captured?.id,
                promo
              ));
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
      const king = ownPieces.find(p => this.isRoyal(p.type));
      if (king) {
        const kf = this.fileOf(king.position!);
        const kr = this.rankOf(king.position!);
        if (kf === KING_FILE && kr === this.homeRankOf(player)) {
          const opp = this.opponent(player);
          const attacked = new Set(this.getAttackedPositions(state, opp).map(key));
          const rookK = getPieceAt(state.board, pos(this.cfg.castleRookFiles.kingSide, kr));
          const rookQ = getPieceAt(state.board, pos(this.cfg.castleRookFiles.queenSide, kr));

          const pathFree = (files: number[]) => files.every(f => !getPieceAt(state.board, pos(f, kr)));
          // a square is unsafe if attacked OR occupied by an enemy piece (captures count as attacks)
          const pathSafe = (files: number[]) => files.every(f => {
            if (attacked.has(`${f}:${kr}`)) return false;
            const occ = getPieceAt(state.board, pos(f, kr));
            return !(occ && occ.owner !== player);
          });

          if (rights.kingSide && rookK?.type === CHESS_PIECES.ROOK && rookK.owner === player &&
              pathFree([5, 6]) && pathSafe([4, 5, 6])) {
            moves.push(createMove(nextId(), king.id, king.position!, pos(6, kr), undefined,
              { isCastling: true, castlingRookId: rookK.id }));
          }
          if (rights.queenSide && rookQ?.type === CHESS_PIECES.ROOK && rookQ.owner === player &&
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
    const moveMeta = chessMetaOf(move);

    let board = movePieceOnBoard(state.board, move.pieceId, move.to);
    if (!board) throw new Error('Cannot execute move: bad positions');

    // En passant: physically remove the pawn standing beside the mover
    if (moveMeta.isEnPassant && captured?.position) {
      board = removePieceFromBoard(board, captured.id) ?? board;
      board = clearCell(board, captured.position); // drop stale cell mapping too
    }

    // Castling: move the rook too
    if (moveMeta.isCastling && moveMeta.castlingRookId) {
      const rank = this.rankOf(move.to);
      const rookToFile = this.fileOf(move.to) === 6 ? 5 : 3;
      board = movePieceOnBoard(board, moveMeta.castlingRookId, pos(rookToFile, rank)) ?? board;
    }

    // Promotion
    if (moveMeta.promotionType && piece.type === CHESS_PIECES.PAWN) {
      const promoted = transformPiece(piece, moveMeta.promotionType as PieceType);
      board = replacePieceOnBoard(board, promoted);
    }

    // Update castling rights
    const rights: ChessMeta['castlingRights'] = JSON.parse(JSON.stringify(meta.castlingRights));
    const loseAll = (owner: PlayerId) => {
      if (rights[owner]) rights[owner] = { kingSide: false, queenSide: false };
    };
    if (this.isRoyal(piece.type)) loseAll(piece.owner);
    if (captured?.type === CHESS_PIECES.ROOK && captured.position) {
      const cf = this.fileOf(captured.position);
      const cr = this.rankOf(captured.position);
      const owner = captured.owner;
      if (rights[owner] && cr === this.homeRankOf(owner)) {
        if (cf === this.cfg.castleRookFiles.queenSide) rights[owner] = { ...rights[owner], queenSide: false };
        if (cf === this.cfg.castleRookFiles.kingSide) rights[owner] = { ...rights[owner], kingSide: false };
      }
    }
    if (piece.type === CHESS_PIECES.ROOK && piece.position) {
      const f = this.fileOf(piece.position);
      const r = this.rankOf(piece.position);
      const owner = piece.owner;
      if (rights[owner] && r === this.homeRankOf(owner)) {
        if (f === this.cfg.castleRookFiles.queenSide) rights[owner] = { ...rights[owner], queenSide: false };
        if (f === this.cfg.castleRookFiles.kingSide) rights[owner] = { ...rights[owner], kingSide: false };
      }
    }

    // En passant target: set only after a double pawn push
    let enPassantTarget: Position | null = null;
    if (piece.type === CHESS_PIECES.PAWN) {
      const fromRank = this.rankOf(move.from);
      const toRank = this.rankOf(move.to);
      if (Math.abs(toRank - fromRank) === 2) {
        enPassantTarget = pos(this.fileOf(move.to), (fromRank + toRank) / 2);
      }
    }

    const newMetadata: GameStateMetadata = { castlingRights: rights, enPassantTarget };

    const advanced = applyMove(state, move, board, captured, newMetadata);
    // Fix halfmove clock: core applyMove cannot know about pawn moves (see its TODO)
    const resets = !!captured || piece.type === CHESS_PIECES.PAWN;
    return Object.freeze({
      ...advanced,
      halfmoveClock: resets ? 0 : advanced.halfmoveClock
    }) as GameState;
  }

  // ---------------------------------------------------------------- checks

  isInCheck(state: GameState, player: PlayerId): boolean {
    const king = [...state.board.pieces.values()]
      .find(p => this.isRoyal(p.type) && p.owner === player && p.position);
    if (!king) return false;
    if (this.kingsAreFacing(state)) return true;
    return this.getAttackedPositions(state, this.opponent(player))
      .some(p => positionsEqual(p, king.position!));
  }

  /** True when the two kings share an unobstructed line (illegal in chess). */
  private kingsAreFacing(state: GameState): boolean {
    const kings = [...state.board.pieces.values()]
      .filter(p => this.isRoyal(p.type) && p.position);
    if (kings.length < 2) return false;
    const f1 = this.fileOf(kings[0].position!), r1 = this.rankOf(kings[0].position!);
    const f2 = this.fileOf(kings[1].position!), r2 = this.rankOf(kings[1].position!);
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
      // Pawns attack one step diagonally ahead. Reuse the generic generator by
      // overriding the piece type to a symmetric one-step diagonal stepper and
      // relaxing `canMoveEmpty`, so empty squares still count as attacked.
      if (piece.type === CHESS_PIECES.PAWN) {
        const probe: Piece = { ...piece, type: this.cfg.attackProbeType };
        const ctx = this.movementCtx(state.board, probe);
        for (const t of generatePatternTargets(ctx, PAWN_ATTACK_PROBE)) {
          attacked.push(t);
        }
        continue;
      }

      for (const pattern of this.patternsFor(piece.type)) {
        for (const t of generatePatternTargets(this.movementCtx(state.board, piece), pattern)) {
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
    return this.getAttackedPositions(state, byPlayer).some(p => positionsEqual(p, square));
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
      if (!victim || !victim.position) return false;
      // Normal captures land on the victim; en passant captures it beside the target.
      const landsOnVictim = positionsEqual(victim.position, move.to);
      if (!landsOnVictim && !chessMetaOf(move).isEnPassant) return false;
    } else if (getPieceAt(state.board, move.to)) {
      return false;
    }
    return !this.isInCheck(this.executeMoveInternal(state, move), player);
  }

  private isInsufficientMaterial(state: GameState): boolean {
    const nonRoyal = [...state.board.pieces.values()].filter(p => !this.isRoyal(p.type));
    if (nonRoyal.length === 0) return true; // lone royals only
    if (nonRoyal.length === 1) {
      const t = nonRoyal[0].type;
      return t === CHESS_PIECES.BISHOP || t === CHESS_PIECES.KNIGHT; // lone minor cannot mate
    }
    if (nonRoyal.length === 2 && nonRoyal.every(p => p.type === CHESS_PIECES.BISHOP)) {
      const colors = nonRoyal.map(p => {
        const f = this.fileOf(p.position!);
        const r = this.rankOf(p.position!);
        return (f + r) % 2;
      });
      if (colors[0] === colors[1]) return true; // same-color bishops
    }
    return false;
  }

  // --------------------------------------------------------------- helpers

  /** Moves match when piece/from/to agree; promotion type must agree too. */
  private sameMove(a: Move, b: Move): boolean {
    return a.pieceId === b.pieceId &&
      positionsEqual(a.from, b.from) &&
      positionsEqual(a.to, b.to) &&
      chessMetaOf(a).promotionType === chessMetaOf(b).promotionType;
  }

  private isFirstPlayer(player: PlayerId): boolean {
    return player === this.cfg.orientation.firstPlayer;
  }

  private opponent(player: PlayerId): PlayerId {
    return this.isFirstPlayer(player) ? this.cfg.orientation.secondPlayer : this.cfg.orientation.firstPlayer;
  }

  private isRoyal(type: PieceType): boolean {
    return this.cfg.royalTypes.includes(type);
  }

  private homeRankOf(player: PlayerId): number {
    if (this.orientation) return this.orientation.homeRankOf(player);
    return this.isFirstPlayer(player)
      ? this.cfg.orientation.homeRankFirst
      : this.cfg.orientation.homeRankSecond;
  }

  private pawnStartRankOf(player: PlayerId): number {
    if (this.orientation) return this.orientation.pawnStartRankOf(player);
    return this.isFirstPlayer(player)
      ? this.cfg.orientation.pawnStartRankFirst
      : this.cfg.orientation.pawnStartRankSecond;
  }

  /** Pawns promote on the opposing side's home rank. */
  private promotionRankOf(player: PlayerId): number {
    return this.homeRankOf(this.opponent(player));
  }

  private forwardDelta(player: PlayerId): readonly number[] {
    if (this.orientation) return this.orientation.forwardOf(player);
    const delta: number[] = [];
    for (let i = 0; i <= this.cfg.orientation.rankIndex; i++) delta.push(0);
    delta[this.cfg.orientation.rankIndex] = this.isFirstPlayer(player) ? 1 : -1;
    return delta;
  }

  /** True when `to` is the en-passant target square for pawn `piece`. */
  private isEnPassantSquare(
    _state: GameState,
    piece: Piece,
    to: Position,
    ep: Position | null
  ): boolean {
    if (!ep || !positionsEqual(to, ep)) return false;
    const pf = this.fileOf(piece.position!);
    const pr = this.rankOf(piece.position!);
    const ef = this.fileOf(ep);
    const er = this.rankOf(ep);
    const fwdSign = Math.sign(this.forwardDelta(piece.owner)[this.cfg.orientation.rankIndex]);
    // The target must sit one rank ahead of the pawn and beside it in file —
    // i.e. exactly what a double push would have crossed through.
    return Math.abs(ef - pf) === 1 && er === pr + fwdSign;
  }

  /** The pawn standing beside the en-passant target (the captured victim). */
  private enPassantVictim(
    state: GameState,
    piece: Piece,
    to: Position,
    ep: Position | null
  ): Piece | undefined {
    if (!this.isEnPassantSquare(state, piece, to, ep)) return undefined;
    const victim = getPieceAt(state.board, pos(this.fileOf(to), this.rankOf(piece.position!)));
    return victim && victim.owner !== piece.owner ? victim : undefined;
  }

  private rankOf(position: Position): number {
    const value = position.coords[this.cfg.orientation.rankIndex];
    if (typeof value !== 'number') {
      throw new Error(`Non-numeric rank in position [${position.coords}]`);
    }
    return value;
  }

  private fileOf(position: Position): number {
    const fileIndex = this.cfg.orientation.rankIndex === 1 ? 0 : 1;
    const value = position.coords[fileIndex];
    if (typeof value !== 'number') {
      throw new Error(`Non-numeric file in position [${position.coords}]`);
    }
    return value;
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
