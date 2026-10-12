/**
 * Standard chess ruleset implementation
 * Implements FIDE chess rules for 8x8 board
 * 
 * Architecture:
 * - Piece is just data (type, color, id, position) - no behavior
 * - All movement logic lives in RuleSet
 * - Position is immutable, each move creates new state
 */

import {
  RuleSet,
  PieceDefinition,
  GameState,
  Move,
  PlayerId,
  Topology,
  Position,
  createMove,
  GameResult,
  GameStateMetadata,
  applyMove,
  movePieceOnBoard,
  getPieceAt,
  serializePosition,
  deserializePosition,
  createBoard,
  createPiece,
  placePieceOnBoard,
  createGameState,
  transformPiece,
  PieceType
} from '@chess-kernel/core';

// Piece type constants
export const PIECE_TYPES = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  BISHOP: 'bishop',
  KNIGHT: 'knight',
  PAWN: 'pawn'
} as const;

/**
 * Standard chess piece definitions
 */
export const STANDARD_PIECE_DEFINITIONS: readonly PieceDefinition[] = [
  { type: PIECE_TYPES.KING, name: 'King', value: 0 },
  { type: PIECE_TYPES.QUEEN, name: 'Queen', value: 9 },
  { type: PIECE_TYPES.ROOK, name: 'Rook', value: 5 },
  { type: PIECE_TYPES.BISHOP, name: 'Bishop', value: 3 },
  { type: PIECE_TYPES.KNIGHT, name: 'Knight', value: 3 },
  { type: PIECE_TYPES.PAWN, name: 'Pawn', value: 1 }
];

/**
 * Chess-specific metadata for game state
 */
export interface ChessGameStateMetadata extends GameStateMetadata {
  readonly castlingRights?: ReadonlySet<string>;
  readonly enPassantTarget?: Position;
  readonly isCheck?: boolean;
  readonly halfmoveClock?: number;
}

/**
 * Direction delta for rectangular board [fileDelta, rankDelta]
 */
type Direction = [number, number];

// Re-export movement generators
export {
  generatePawnMoves,
  generateKnightMoves,
  generateBishopMoves,
  generateRookMoves,
  generateQueenMoves,
  generateKingMoves,
} from './rules/movements';

/**
 * Standard Chess Ruleset Implementation
 */
export class StandardChessRuleSet implements RuleSet {
  readonly id = 'standard-chess';
  readonly name = 'Standard Chess';
  readonly requiredTopology = 'rectangular-8x8';
  readonly pieceDefinitions = STANDARD_PIECE_DEFINITIONS;

  /**
   * Sets up the initial chess position
   */
  setupGame(
    gameId: string,
    players: readonly PlayerId[],
    topology: Topology
  ): GameState {
    // Validate topology
    if (!(topology.id === 'rectangular' && topology.name.includes('8x8'))) {
      throw new Error('Standard chess requires 8x8 rectangular topology');
    }

    // Create empty board
    const board = createBoard(topology);

    // Setup initial position
    let currentBoard = board;

    // Place pawns
    for (let file = 0; file < 8; file++) {
      // White pawns on rank 1 (index 1)
      const whitePawn = createPiece(`w-pawn-${file}`, PIECE_TYPES.PAWN, players[0]);
      const whitePawnPos = { coords: [file, 1] as const };
      const result1 = placePieceOnBoard(currentBoard, whitePawn, whitePawnPos);
      if (result1) currentBoard = result1;

      // Black pawns on rank 6 (index 6)
      const blackPawn = createPiece(`b-pawn-${file}`, PIECE_TYPES.PAWN, players[1]);
      const blackPawnPos = { coords: [file, 6] as const };
      const result2 = placePieceOnBoard(currentBoard, blackPawn, blackPawnPos);
      if (result2) currentBoard = result2;
    }

    // Place other pieces
    const pieceOrder = [
      PIECE_TYPES.ROOK,
      PIECE_TYPES.KNIGHT,
      PIECE_TYPES.BISHOP,
      PIECE_TYPES.QUEEN,
      PIECE_TYPES.KING,
      PIECE_TYPES.BISHOP,
      PIECE_TYPES.KNIGHT,
      PIECE_TYPES.ROOK
    ];

    for (let file = 0; file < 8; file++) {
      // White pieces on rank 0
      const whitePiece = createPiece(`w-${pieceOrder[file]}-${file}`, pieceOrder[file], players[0]);
      const whitePos = { coords: [file, 0] as const };
      const result1 = placePieceOnBoard(currentBoard, whitePiece, whitePos);
      if (result1) currentBoard = result1;

      // Black pieces on rank 7
      const blackPiece = createPiece(`b-${pieceOrder[file]}-${file}`, pieceOrder[file], players[1]);
      const blackPos = { coords: [file, 7] as const };
      const result2 = placePieceOnBoard(currentBoard, blackPiece, blackPos);
      if (result2) currentBoard = result2;
    }

    // Initial castling rights
    const castlingRights = new Set(['K', 'Q', 'k', 'q']);

    return createGameState(gameId, currentBoard, players, players[0], {
      castlingRights
    });
  }

  /**
   * Generates all pseudo-legal moves for a player
   * Pseudo-legal = follows piece movement rules but may leave king in check
   */
  generateMoves(state: GameState, player: PlayerId): readonly Move[] {
    const moves: Move[] = [];

    // Get all player's pieces
    for (const [pieceId, piece] of state.board.pieces) {
      if (piece.owner !== player) continue;
      if (!piece.position) continue;

      const pieceMoves = this.generatePieceMoves(state, piece);
      moves.push(...pieceMoves);
    }

    return moves;
  }

  /**
   * Generates moves for a specific piece based on its type
   */
  private generatePieceMoves(state: GameState, piece: any): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;

    switch (piece.type) {
      case PIECE_TYPES.PAWN:
        moves.push(...this.generatePawnMoves(state, piece));
        break;
      case PIECE_TYPES.KNIGHT:
        moves.push(...this.generateKnightMoves(state, piece));
        break;
      case PIECE_TYPES.BISHOP:
        moves.push(...this.generateSlidingMoves(state, piece, this.getBishopDirections()));
        break;
      case PIECE_TYPES.ROOK:
        moves.push(...this.generateSlidingMoves(state, piece, this.getRookDirections()));
        break;
      case PIECE_TYPES.QUEEN:
        moves.push(...this.generateSlidingMoves(state, piece, this.getQueenDirections()));
        break;
      case PIECE_TYPES.KING:
        moves.push(...this.generateKingMoves(state, piece));
        break;
    }

    return moves;
  }

  /**
   * Generate pawn moves (basic: single push, double push, captures)
   * TODO: Add en passant and promotion later
   */
  private generatePawnMoves(state: GameState, piece: any): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;
    const [file, rank] = fromPos.coords as [number, number];
    const isWhite = piece.owner === state.players[0];
    const direction = isWhite ? 1 : -1;
    const startRank = isWhite ? 1 : 6;

    // Single push forward
    const oneStepRank = rank + direction;
    if (oneStepRank >= 0 && oneStepRank <= 7) {
      const oneStepPos = { coords: [file, oneStepRank] as const };
      const targetPiece = getPieceAt(state.board, oneStepPos);
      
      if (!targetPiece) {
        // Empty square - can move here
        moves.push(createMove(
          this.generateMoveId(state, piece, oneStepPos),
          piece.id,
          fromPos,
          oneStepPos
        ));

        // Double push from starting position
        if (rank === startRank) {
          const twoStepRank = rank + 2 * direction;
          const twoStepPos = { coords: [file, twoStepRank] as const };
          const twoStepTarget = getPieceAt(state.board, twoStepPos);
          
          if (!twoStepTarget) {
            moves.push(createMove(
              this.generateMoveId(state, piece, twoStepPos),
              piece.id,
              fromPos,
              twoStepPos
            ));
          }
        }
      }
    }

    // Captures (diagonal)
    for (const captureFile of [file - 1, file + 1]) {
      if (captureFile < 0 || captureFile > 7) continue;
      
      const captureRank = rank + direction;
      if (captureRank < 0 || captureRank > 7) continue;

      const capturePos = { coords: [captureFile, captureRank] as const };
      const targetPiece = getPieceAt(state.board, capturePos);

      if (targetPiece && targetPiece.owner !== piece.owner) {
        // Enemy piece - can capture
        moves.push(createMove(
          this.generateMoveId(state, piece, capturePos),
          piece.id,
          fromPos,
          capturePos,
          targetPiece.id
        ));
      }
    }

    return moves;
  }

  /**
   * Generate knight moves (L-shape: 2+1 or 1+2)
   */
  private generateKnightMoves(state: GameState, piece: any): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;
    const [startFile, startRank] = fromPos.coords as [number, number];

    // All 8 knight moves
    const knightMoves: Direction[] = [
      [1, 2], [2, 1], [2, -1], [1, -2],
      [-1, -2], [-2, -1], [-2, 1], [-1, 2]
    ];

    for (const [df, dr] of knightMoves) {
      const newFile = startFile + df;
      const newRank = startRank + dr;

      if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) continue;

      const toPos = { coords: [newFile, newRank] as const };
      const targetPiece = getPieceAt(state.board, toPos);

      if (!targetPiece) {
        // Empty square
        moves.push(createMove(
          this.generateMoveId(state, piece, toPos),
          piece.id,
          fromPos,
          toPos
        ));
      } else if (targetPiece.owner !== piece.owner) {
        // Enemy piece - capture
        moves.push(createMove(
          this.generateMoveId(state, piece, toPos),
          piece.id,
          fromPos,
          toPos,
          targetPiece.id
        ));
      }
      // Friendly piece - skip
    }

    return moves;
  }

  /**
   * Generate sliding piece moves (bishop, rook, queen)
   */
  private generateSlidingMoves(
    state: GameState,
    piece: any,
    directions: readonly Direction[]
  ): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;
    const [startFile, startRank] = fromPos.coords as [number, number];

    for (const [df, dr] of directions) {
      for (let step = 1; step <= 7; step++) {
        const newFile = startFile + df * step;
        const newRank = startRank + dr * step;

        if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) break;

        const toPos = { coords: [newFile, newRank] as const };
        const targetPiece = getPieceAt(state.board, toPos);

        if (!targetPiece) {
          // Empty square - can move here
          moves.push(createMove(
            this.generateMoveId(state, piece, toPos),
            piece.id,
            fromPos,
            toPos
          ));
        } else if (targetPiece.owner !== piece.owner) {
          // Enemy piece - can capture, then stop
          moves.push(createMove(
            this.generateMoveId(state, piece, toPos),
            piece.id,
            fromPos,
            toPos,
            targetPiece.id
          ));
          break;
        } else {
          // Friendly piece - blocked, stop
          break;
        }
      }
    }

    return moves;
  }

  /**
   * Generate king moves (one step in any direction)
   * TODO: Add castling later
   */
  private generateKingMoves(state: GameState, piece: any): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;
    const [startFile, startRank] = fromPos.coords as [number, number];

    // All 8 king moves
    const kingMoves: Direction[] = [
      [0, 1], [1, 1], [1, 0], [1, -1],
      [0, -1], [-1, -1], [-1, 0], [-1, 1]
    ];

    for (const [df, dr] of kingMoves) {
      const newFile = startFile + df;
      const newRank = startRank + dr;

      if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) continue;

      const toPos = { coords: [newFile, newRank] as const };
      const targetPiece = getPieceAt(state.board, toPos);

      if (!targetPiece) {
        moves.push(createMove(
          this.generateMoveId(state, piece, toPos),
          piece.id,
          fromPos,
          toPos
        ));
      } else if (targetPiece.owner !== piece.owner) {
        moves.push(createMove(
          this.generateMoveId(state, piece, toPos),
          piece.id,
          fromPos,
          toPos,
          targetPiece.id
        ));
      }
    }

    return moves;
  }

  /**
   * Direction helpers for sliding pieces
   */
  private getBishopDirections(): readonly Direction[] {
    return [[1, 1], [1, -1], [-1, -1], [-1, 1]] as const;
  }

  private getRookDirections(): readonly Direction[] {
    return [[0, 1], [1, 0], [0, -1], [-1, 0]] as const;
  }

  private getQueenDirections(): readonly Direction[] {
    return [...this.getBishopDirections(), ...this.getRookDirections()];
  }

  /**
   * Validates if a move is legal
   * For now, just checks if move is in generated moves
   * TODO: Add check validation
   */
  isValidMove(state: GameState, move: Move): boolean {
    const allMoves = this.generateMoves(state, state.currentPlayer);
    return allMoves.some(m => m.id === move.id);
  }

  /**
   * Executes a validated move and returns new game state
   */
  executeMove(state: GameState, move: Move): GameState {
    const piece = state.board.pieces.get(move.pieceId);
    if (!piece) throw new Error('Piece not found');

    // Move the piece on the board
    const newBoard = movePieceOnBoard(state.board, move.pieceId, move.to);
    if (!newBoard) throw new Error('Invalid move');

    // Get captured piece if any
    const capturedPiece = move.capturedPieceId 
      ? state.board.pieces.get(move.capturedPieceId)
      : undefined;

    // Update metadata (en passant target, castling rights)
    const newMetadata = this.updateMetadata(state, move, piece);

    // Apply the move to game state
    return applyMove(state, move, newBoard, capturedPiece, newMetadata);
  }

  /**
   * Updates game metadata after a move
   */
  private updateMetadata(
    state: GameState,
    move: Move,
    piece: any
  ): ChessGameStateMetadata | undefined {
    const currentMetadata = state.metadata as ChessGameStateMetadata | undefined;
    
    // Update en passant target
    let enPassantTarget: Position | undefined;
    if (piece.type === PIECE_TYPES.PAWN) {
      const [fromFile, fromRank] = move.from.coords as [number, number];
      const [toFile, toRank] = move.to.coords as [number, number];
      
      // If pawn moved two squares, set en passant target
      if (Math.abs(toRank - fromRank) === 2) {
        const epRank = (fromRank + toRank) / 2;
        enPassantTarget = { coords: [fromFile, epRank] as const };
      }
    }

    // Update castling rights
    let castlingRights = currentMetadata?.castlingRights 
      ? new Set(currentMetadata.castlingRights) 
      : new Set(['K', 'Q', 'k', 'q']);

    // Remove rights if king moves
    if (piece.type === PIECE_TYPES.KING) {
      if (piece.owner === state.players[0]) {
        castlingRights.delete('K');
        castlingRights.delete('Q');
      } else {
        castlingRights.delete('k');
        castlingRights.delete('q');
      }
    }

    // Remove rights if rook moves or is captured
    if (piece.type === PIECE_TYPES.ROOK) {
      const [fromFile, fromRank] = move.from.coords as [number, number];
      if (piece.owner === state.players[0]) {
        if (fromFile === 0 && fromRank === 0) castlingRights.delete('Q');
        if (fromFile === 7 && fromRank === 0) castlingRights.delete('K');
      } else {
        if (fromFile === 0 && fromRank === 7) castlingRights.delete('q');
        if (fromFile === 7 && fromRank === 7) castlingRights.delete('k');
      }
    }

    return {
      castlingRights,
      enPassantTarget,
      isCheck: false,
      halfmoveClock: state.halfmoveClock
    };
  }

  /**
   * Checks if the game is over
   * TODO: Implement checkmate and stalemate detection
   */
  checkGameOver(state: GameState): GameResult {
    // Placeholder - will implement later
    return null;
  }

  /**
   * Gets all positions attacked by a player's pieces
   * TODO: Implement for check detection
   */
  getAttackedPositions(state: GameState, player: PlayerId): readonly Position[] {
    // Placeholder - will implement later
    return [];
  }

  /**
   * Gets piece definition by type
   */
  getPieceDefinition(type: PieceType): PieceDefinition | undefined {
    return this.pieceDefinitions.find(def => def.type === type);
  }

  /**
   * Generates a unique move ID
   */
  private generateMoveId(state: GameState, piece: any, toPos: Position): string {
    const fromKey = serializePosition(piece.position!);
    const toKey = serializePosition(toPos);
    return `${piece.id}-${fromKey}-${toKey}`;
  }
}

// Export default instance
export const standardChess = new StandardChessRuleSet();
