import { PlayerId, PieceType } from '../core/types';
import { Piece } from '../core/piece';
import { Position } from '../core/types';
import { Board, Topology } from '../topology/board';
import { Move, GameState, GameStateMetadata, GameResult } from '../state/game-state';

/**
 * Definition of a piece type
 * Engine doesn't interpret this - ruleset uses it to determine behavior
 */
export interface PieceDefinition {
  readonly type: PieceType;
  readonly name: string;
  readonly value?: number; // Optional point value for AI evaluation
  readonly metadata?: Record<string, unknown>; // Ruleset-specific data
}

/**
 * Movement pattern for a piece
 * Defines how a piece can move, not whether it's legal
 */
export interface MovementPattern {
  readonly id: string;
  readonly directions: readonly DirectionSpec[];
  readonly maxSteps?: number; // Infinity for sliding pieces
  readonly isSliding: boolean;
  readonly canCapture: boolean;
  readonly canMoveEmpty: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Direction specification with optional constraints
 */
export interface DirectionSpec {
  readonly delta: readonly number[];
  readonly minSteps?: number;
  readonly maxSteps?: number;
  readonly conditions?: MovementCondition[];
}

/**
 * Condition that must be met for movement in a direction
 */
export interface MovementCondition {
  readonly type: string;
  readonly params?: Record<string, unknown>;
}

/**
 * Abstract ruleset interface
 * This is where game-specific logic lives
 */
export interface RuleSet {
  /**
   * Unique identifier for this ruleset
   */
  readonly id: string;
  
  /**
   * Human-readable name
   */
  readonly name: string;
  
  /**
   * Required topology for this ruleset (optional)
   */
  readonly requiredTopology?: string;
  
  /**
   * Piece definitions used in this game
   */
  readonly pieceDefinitions: readonly PieceDefinition[];
  
  /**
   * Initial setup - creates the starting board and state
   */
  setupGame(
    gameId: string,
    players: readonly PlayerId[],
    topology: Topology
  ): GameState;
  
  /**
   * Generates all pseudo-legal moves for a player
   * "Pseudo-legal" means moves that follow piece movement rules
   * but may leave king in check (check validation is separate)
   */
  generateMoves(state: GameState, player: PlayerId): readonly Move[];
  
  /**
   * Validates if a specific move is legal in the current state
   * Must check:
   * - Piece movement rules
   * - Board boundaries
   * - Special rules (castling, en passant, etc.)
   * - Check validation
   */
  isValidMove(state: GameState, move: Move): boolean;
  
  /**
   * Executes a validated move and returns new game state
   * Assumes move was already validated by isValidMove
   */
  executeMove(state: GameState, move: Move): GameState;
  
  /**
   * Checks if the game is over and determines the result
   */
  checkGameOver(state: GameState): GameResult;
  
  /**
   * Gets all positions attacked by a player's pieces
   * Used for check detection and move validation
   */
  getAttackedPositions(state: GameState, player: PlayerId): readonly Position[];
  
  /**
   * Creates a piece definition from type string
   */
  getPieceDefinition(type: PieceType): PieceDefinition | undefined;
}
