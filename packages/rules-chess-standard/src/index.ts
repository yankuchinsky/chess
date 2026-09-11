/**
 * Standard chess ruleset implementation
 * Implements FIDE chess rules for 8x8 board
 */

import {
  RuleSet,
  PieceDefinition,
  MovementPattern,
  DirectionSpec,
  GameState,
  Move,
  PlayerId,
  Topology,
  Position,
  createMove,
  GameResult,
  GameStateMetadata,
  finishGame,
  applyMove,
  movePieceOnBoard,
  getPieceAt,
  serializePosition,
  deserializePosition,
  createBoard,
  createPiece,
  placePieceOnBoard,
  createGameState,
  transformPiece
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

// Movement pattern IDs
const MOVEMENT_PATTERNS = {
  KING: 'king-move',
  QUEEN: 'queen-move',
  ROOK: 'rook-move',
  BISHOP: 'bishop-move',
  KNIGHT: 'knight-move',
  PAWN: 'pawn-move'
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
   */
  generateMoves(state: GameState, player: PlayerId): readonly Move[] {
    const moves: Move[] = [];
    
    const { createMove } = await import('@chess-kernel/core');

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
   * Generates moves for a specific piece
   */
  private generatePieceMoves(state: GameState, piece: any): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;

    switch (piece.type) {
      case PIECE_TYPES.PAWN:
        moves.push(...this.generatePawnMoves(state, piece));
        break;
      case PIECE_TYPES.KNIGHT:
        moves.push(...this.generateSlidingMoves(state, piece, this.getKnightDirections(), 1));
        break;
      case PIECE_TYPES.BISHOP:
        moves.push(...this.generateSlidingMoves(state, piece, this.getBishopDirections(), Infinity));
        break;
      case PIECE_TYPES.ROOK:
        moves.push(...this.generateSlidingMoves(state, piece, this.getRookDirections(), Infinity));
        break;
      case PIECE_TYPES.QUEEN:
        moves.push(...this.generateSlidingMoves(state, piece, this.getQueenDirections(), Infinity));
        break;
      case PIECE_TYPES.KING:
        moves.push(...this.generateSlidingMoves(state, piece, this.getKingDirections(), 1));
        moves.push(...this.generateCastlingMoves(state, piece));
        break;
    }

    return moves;
  }

  /**
   * Generate pawn moves
   */
  private generatePawnMoves(state: GameState, piece: any): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;
    const [file, rank] = fromPos.coords;
    const isWhite = piece.owner === state.players[0];
    const direction = isWhite ? 1 : -1;
    const startRank = isWhite ? 1 : 6;
    const promotionRank = isWhite ? 7 : 0;

    
    const { createMove, getPieceAt, serializePosition } = await import('@chess-kernel/core');

    // Single push
    const oneStepRank = rank + direction;
    if (oneStepRank >= 0 && oneStepRank <= 7) {
      const oneStepPos = { coords: [file, oneStepRank] as const };
      const targetPiece = getPieceAt(state.board, oneStepPos);
      
      if (!targetPiece) {
        // Check for promotion
        if (oneStepRank === promotionRank) {
          // Promotion moves
          for (const promoType of [PIECE_TYPES.QUEEN, PIECE_TYPES.ROOK, PIECE_TYPES.BISHOP, PIECE_TYPES.KNIGHT]) {
            const move = createMove(
              this.generateMoveId(state, piece, oneStepPos),
              piece.id,
              fromPos,
              oneStepPos,
              undefined,
              { promotionType: promoType }
            );
            moves.push(move);
          }
        } else {
          const move = createMove(
            this.generateMoveId(state, piece, oneStepPos),
            piece.id,
            fromPos,
            oneStepPos
          );
          moves.push(move);

          // Double push from starting position
          if (rank === startRank) {
            const twoStepRank = rank + 2 * direction;
            const twoStepPos = { coords: [file, twoStepRank] as const };
            const twoStepTarget = getPieceAt(state.board, twoStepPos);
            
            if (!twoStepTarget) {
              const doubleMove = createMove(
                this.generateMoveId(state, piece, twoStepPos),
                piece.id,
                fromPos,
                twoStepPos
              );
              moves.push(doubleMove);
            }
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
        if (captureRank === promotionRank) {
          // Promotion captures
          for (const promoType of [PIECE_TYPES.QUEEN, PIECE_TYPES.ROOK, PIECE_TYPES.BISHOP, PIECE_TYPES.KNIGHT]) {
            const move = createMove(
              this.generateMoveId(state, piece, capturePos),
              piece.id,
              fromPos,
              capturePos,
              targetPiece.id,
              { promotionType: promoType }
            );
            moves.push(move);
          }
        } else {
          const move = createMove(
            this.generateMoveId(state, piece, capturePos),
            piece.id,
            fromPos,
            capturePos,
            targetPiece.id
          );
          moves.push(move);
        }
      }

      // En passant
      const metadata = state.metadata as ChessGameStateMetadata | undefined;
      if (metadata?.enPassantTarget) {
        const epTarget = metadata.enPassantTarget;
        const [epFile, epRank] = epTarget.coords;
        
        if (captureFile === epFile && captureRank === epRank) {
          // Find the captured pawn
          const capturedPawnRank = rank;
          const capturedPawnPos = { coords: [captureFile, capturedPawnRank] as const };
          const capturedPawn = getPieceAt(state.board, capturedPawnPos);
          
          if (capturedPawn && capturedPawn.type === PIECE_TYPES.PAWN && capturedPawn.owner !== piece.owner) {
            const epMove = createMove(
              this.generateMoveId(state, piece, capturePos),
              piece.id,
              fromPos,
              capturePos,
              capturedPawn.id,
              { isEnPassant: true }
            );
            moves.push(epMove);
          }
        }
      }
    }

    return moves;
  }

  /**
   * Generate sliding piece moves (rook, bishop, queen)
   */
  private generateSlidingMoves(
    state: GameState,
    piece: any,
    directions: readonly number[][],
    maxSteps: number
  ): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;
    const [startFile, startRank] = fromPos.coords;

    
    const { createMove, getPieceAt } = await import('@chess-kernel/core');

    for (const [df, dr] of directions) {
      for (let step = 1; step <= maxSteps; step++) {
        const newFile = startFile + df * step;
        const newRank = startRank + dr * step;

        if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) break;

        const toPos = { coords: [newFile, newRank] as const };
        const targetPiece = getPieceAt(state.board, toPos);

        if (!targetPiece) {
          // Empty square - can move here
          const move = createMove(
            this.generateMoveId(state, piece, toPos),
            piece.id,
            fromPos,
            toPos
          );
          moves.push(move);
        } else if (targetPiece.owner !== piece.owner) {
          // Enemy piece - can capture
          const move = createMove(
            this.generateMoveId(state, piece, toPos),
            piece.id,
            fromPos,
            toPos,
            targetPiece.id
          );
          moves.push(move);
          break; // Can't go further after capture
        } else {
          // Friendly piece - blocked
          break;
        }
      }
    }

    return moves;
  }

  /**
   * Generate castling moves for king
   */
  private generateCastlingMoves(state: GameState, piece: any): Move[] {
    const moves: Move[] = [];
    const fromPos = piece.position!;
    const [file, rank] = fromPos.coords;
    const isWhite = piece.owner === state.players[0];
    
    const metadata = state.metadata as ChessGameStateMetadata | undefined;
    if (!metadata?.castlingRights) return moves;

    
    const { createMove, getPieceAt } = await import('@chess-kernel/core');

    // Kingside castling
    const kingsideRight = isWhite ? 'K' : 'k';
    if (metadata.castlingRights.has(kingsideRight)) {
      // Check if path is clear and not attacked
      const pathClear = !getPieceAt(state.board, { coords: [5, rank] as const }) &&
                       !getPieceAt(state.board, { coords: [6, rank] as const });
      
      if (pathClear) {
        const toPos = { coords: [6, rank] as const };
        const move = createMove(
          this.generateMoveId(state, piece, toPos),
          piece.id,
          fromPos,
          toPos,
          undefined,
          { isCastling: true, castlingRookId: isWhite ? 'w-rook-7' : 'b-rook-7' }
        );
        moves.push(move);
      }
    }

    // Queenside castling
    const queensideRight = isWhite ? 'Q' : 'q';
    if (metadata.castlingRights.has(queensideRight)) {
      const pathClear = !getPieceAt(state.board, { coords: [1, rank] as const }) &&
                       !getPieceAt(state.board, { coords: [2, rank] as const }) &&
                       !getPieceAt(state.board, { coords: [3, rank] as const });
      
      if (pathClear) {
        const toPos = { coords: [2, rank] as const };
        const move = createMove(
          this.generateMoveId(state, piece, toPos),
          piece.id,
          fromPos,
          toPos,
          undefined,
          { isCastling: true, castlingRookId: isWhite ? 'w-rook-0' : 'b-rook-0' }
        );
        moves.push(move);
      }
    }

    return moves;
  }

  /**
   * Validates if a move is legal
   */
  isValidMove(state: GameState, move: Move): boolean {
    // First check if move is in generated moves
    const allMoves = this.generateMoves(state, state.currentPlayer);
    const moveExists = allMoves.some(m => m.id === move.id);
    
    if (!moveExists) return false;

    // Check if move would leave king in check
    const testState = this.executeMoveWithoutValidation(state, move);
    if (this.isKingInCheck(testState, state.currentPlayer)) {
      return false;
    }

    // Additional validation for castling (path must not be attacked)
    if (move.metadata?.isCastling) {
      if (this.isPathAttacked(state, move.from, move.to, state.currentPlayer)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Executes a validated move
   */
  executeMove(state: GameState, move: Move): GameState {
    
    const { movePieceOnBoard, getPieceAt, serializePosition, deserializePosition } = await import('@chess-kernel/core');
    
    const piece = state.board.pieces.get(move.pieceId);
    if (!piece) throw new Error('Piece not found');

    let newBoard = state.board;

    // Handle castling (move rook too)
    if (move.metadata?.isCastling && move.metadata.castlingRookId) {
      const rook = state.board.pieces.get(move.metadata.castlingRookId);
      if (rook && rook.position) {
        const rookToRank = rook.position.coords[1];
        const rookToFile = move.to.coords[0] > move.from.coords[0] ? 5 : 3;
        const rookToPos = { coords: [rookToFile, rookToRank] as const };
        
        const rookMoveResult = movePieceOnBoard(newBoard, rook.id, rookToPos);
        if (rookMoveResult) newBoard = rookMoveResult;
      }
    }

    // Move the piece
    const moveResult = movePieceOnBoard(newBoard, move.pieceId, move.to);
    if (!moveResult) throw new Error('Invalid move');
    newBoard = moveResult;

    // Handle promotion
    let movedPiece = newBoard.pieces.get(move.pieceId)!;
    if (move.metadata?.promotionType && movedPiece.type === PIECE_TYPES.PAWN) {
      
    const { transformPiece } = await import('@chess-kernel/core');
      movedPiece = transformPiece(movedPiece, move.metadata.promotionType);
      
      // Update piece in board
      const newPieces = new Map(newBoard.pieces);
      newPieces.set(movedPiece.id, movedPiece);
      newBoard = Object.freeze({
        ...newBoard,
        pieces: newPieces as ReadonlyMap<string, any>
      });
    }

    // Update metadata
    const newMetadata = this.updateMetadata(state, move, newBoard);

    // Apply move to state
    const capturedPiece = move.capturedPieceId ? state.board.pieces.get(move.capturedPieceId) : undefined;
    let newState = applyMove(state, move, newBoard, capturedPiece, newMetadata);

    // Check for game over
    const nextPlayer = newState.currentPlayer;
    if (this.isKingInCheck(newState, nextPlayer)) {
      if (!this.hasLegalMoves(newState, nextPlayer)) {
        // Checkmate
        const winner = state.currentPlayer;
        newState = finishGame(newState, { winner, reason: 'checkmate' });
      }
    } else {
      if (!this.hasLegalMoves(newState, nextPlayer)) {
        // Stalemate
        newState = finishGame(newState, { draw: true, reason: 'stalemate' });
      }
    }

    return newState;
  }

  /**
   * Execute move without validation (for testing if move leaves king in check)
   */
  private executeMoveWithoutValidation(state: GameState, move: Move): GameState {
    
    const { movePieceOnBoard } = await import('@chess-kernel/core');
    
    const piece = state.board.pieces.get(move.pieceId);
    if (!piece) return state;

    let newBoard = state.board;
    const moveResult = movePieceOnBoard(newBoard, move.pieceId, move.to);
    if (!moveResult) return state;
    newBoard = moveResult;

    const capturedPiece = move.capturedPieceId ? state.board.pieces.get(move.capturedPieceId) : undefined;
    return applyMove(state, move, newBoard, capturedPiece);
  }

  /**
   * Updates game state metadata after a move
   */
  private updateMetadata(state: GameState, move: Move, newBoard: any): ChessGameStateMetadata {
    const metadata = state.metadata as ChessGameStateMetadata | undefined;
    const newCastlingRights = metadata?.castlingRights ? new Set(metadata.castlingRights) : new Set<string>();
    
    const piece = state.board.pieces.get(move.pieceId)!;

    // Update castling rights
    if (piece.type === PIECE_TYPES.KING) {
      const isWhite = piece.owner === state.players[0];
      newCastlingRights.delete(isWhite ? 'K' : 'k');
      newCastlingRights.delete(isWhite ? 'Q' : 'q');
    }
    
    if (piece.type === PIECE_TYPES.ROOK) {
      const [file, rank] = piece.position!.coords;
      if (file === 0 && rank === 0) newCastlingRights.delete('Q');
      if (file === 7 && rank === 0) newCastlingRights.delete('K');
      if (file === 0 && rank === 7) newCastlingRights.delete('q');
      if (file === 7 && rank === 7) newCastlingRights.delete('k');
    }

    // Update en passant target
    let enPassantTarget: Position | undefined;
    if (piece.type === PIECE_TYPES.PAWN) {
      const [fromFile, fromRank] = move.from.coords;
      const [toFile, toRank] = move.to.coords;
      
      if (Math.abs(toRank - fromRank) === 2) {
        // Double pawn push - set en passant target
        const epRank = (fromRank + toRank) / 2;
        enPassantTarget = { coords: [fromFile, epRank] as const };
      }
    }

    return {
      castlingRights: newCastlingRights,
      enPassantTarget
    };
  }

  /**
   * Checks if the game is over
   */
  checkGameOver(state: GameState): GameResult {
    return state.result;
  }

  /**
   * Gets all positions attacked by a player's pieces
   */
  getAttackedPositions(state: GameState, player: PlayerId): Position[] {
    const attackedPositions = new Map<string, Position>();

    for (const [pieceId, piece] of state.board.pieces) {
      if (piece.owner !== player || !piece.position) continue;

      let attackPatterns: number[][];
      
      switch (piece.type) {
        case PIECE_TYPES.PAWN:
          attackPatterns = this.getPawnAttackDirections(piece.owner === state.players[0]);
          this.addAttackPositions(state, piece, attackPatterns, 1, attackedPositions);
          break;
        case PIECE_TYPES.KNIGHT:
          attackPatterns = this.getKnightDirections();
          this.addAttackPositions(state, piece, attackPatterns, 1, attackedPositions);
          break;
        case PIECE_TYPES.BISHOP:
          attackPatterns = this.getBishopDirections();
          this.addAttackPositions(state, piece, attackPatterns, Infinity, attackedPositions);
          break;
        case PIECE_TYPES.ROOK:
          attackPatterns = this.getRookDirections();
          this.addAttackPositions(state, piece, attackPatterns, Infinity, attackedPositions);
          break;
        case PIECE_TYPES.QUEEN:
          attackPatterns = this.getQueenDirections();
          this.addAttackPositions(state, piece, attackPatterns, Infinity, attackedPositions);
          break;
        case PIECE_TYPES.KING:
          attackPatterns = this.getKingDirections();
          this.addAttackPositions(state, piece, attackPatterns, 1, attackedPositions);
          break;
      }
    }

    return Array.from(attackedPositions.values());
  }

  /**
   * Helper to add attack positions for a piece
   */
  private addAttackPositions(
    state: GameState,
    piece: any,
    directions: number[][],
    maxSteps: number,
    positions: Map<string, Position>
  ) {
    const [startFile, startRank] = piece.position!.coords;

    for (const [df, dr] of directions) {
      for (let step = 1; step <= maxSteps; step++) {
        const newFile = startFile + df * step;
        const newRank = startRank + dr * step;

        if (newFile < 0 || newFile > 7 || newRank < 0 || newRank > 7) break;

        const pos = { coords: [newFile, newRank] as const };
        positions.set(`${newFile}:${newRank}`, pos);

        // Stop at first piece for sliding pieces
        if (maxSteps === Infinity) {
          const targetPiece = getPieceAt(state.board, pos);
          if (targetPiece) break;
        }
      }
    }
  }

  /**
   * Gets piece definition by type
   */
  getPieceDefinition(type: string): PieceDefinition | undefined {
    return this.pieceDefinitions.find(pd => pd.type === type);
  }

  // Direction helpers
  private getKingDirections(): number[][] {
    return [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  }

  private getQueenDirections(): number[][] {
    return [...this.getRookDirections(), ...this.getBishopDirections()];
  }

  private getRookDirections(): number[][] {
    return [[0, 1], [0, -1], [1, 0], [-1, 0]];
  }

  private getBishopDirections(): number[][] {
    return [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  }

  private getKnightDirections(): number[][] {
    return [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
  }

  private getPawnAttackDirections(isWhite: boolean): number[][] {
    const direction = isWhite ? 1 : -1;
    return [[-1, direction], [1, direction]];
  }

  /**
   * Checks if a player's king is in check
   */
  private isKingInCheck(state: GameState, player: PlayerId): boolean {
    // Find king
    let kingPosition: Position | undefined;
    
    for (const [pieceId, piece] of state.board.pieces) {
      if (piece.type === PIECE_TYPES.KING && piece.owner === player && piece.position) {
        kingPosition = piece.position;
        break;
      }
    }

    if (!kingPosition) return false;

    // Check if any enemy piece attacks king's position
    const opponent = player === state.players[0] ? state.players[1] : state.players[0];
    const attackedPositions = this.getAttackedPositions(state, opponent);
    
    return attackedPositions.some(pos => 
      pos.coords[0] === kingPosition!.coords[0] && 
      pos.coords[1] === kingPosition!.coords[1]
    );
  }

  /**
   * Checks if a player has any legal moves
   */
  private hasLegalMoves(state: GameState, player: PlayerId): boolean {
    const allMoves = this.generateMoves(state, player);
    return allMoves.some(move => this.isValidMove(state, move));
  }

  /**
   * Checks if path between two positions is attacked
   */
  private isPathAttacked(state: GameState, from: Position, to: Position, player: PlayerId): boolean {
    const [fromFile, fromRank] = from.coords;
    const [toFile, toRank] = to.coords;
    
    const opponent = player === state.players[0] ? state.players[1] : state.players[0];
    const attackedPositions = this.getAttackedPositions(state, opponent);

    // Check all squares along the path
    const df = Math.sign(toFile - fromFile);
    const dr = Math.sign(toRank - fromRank);
    
    let currentFile = fromFile;
    let currentRank = fromRank;
    
    while (currentFile !== toFile || currentRank !== toRank) {
      currentFile += df;
      currentRank += dr;
      
      const isAttacked = attackedPositions.some(pos => 
        pos.coords[0] === currentFile && pos.coords[1] === currentRank
      );
      
      if (isAttacked) return true;
    }
    
    return false;
  }

  /**
   * Generates a unique move ID
   */
  private generateMoveId(state: GameState, piece: any, toPos: Position): string {
    const [toFile, toRank] = toPos.coords;
    const fileChars = 'abcdefgh';
    return `${piece.id}-${fileChars[toFile]}${toRank + 1}`;
  }
}

// Export singleton instance
export const standardChessRuleSet = new StandardChessRuleSet();
