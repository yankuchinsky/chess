# Chess Kernel - Abstract Game Engine Core

A topology-agnostic game engine core designed for chess variants and other board games. The kernel knows nothing about specific game rules, player relationships, or board dimensions - all of that is defined by pluggable rulesets and topologies.

## Key Features

- **Topology Agnostic**: Supports rectangular boards (8×8, 10×8), hexagonal boards, and custom irregular boards
- **Ruleset Separation**: Core engine doesn't know game rules - implement `RuleSet` interface for each game variant
- **Immutable State**: All game state is immutable with structural sharing for efficient history
- **Player Agnostic**: Engine doesn't know how many players or their relationships
- **Extensible**: Easy to add new piece types, movement patterns, and special rules

## Architecture

```
┌─────────────────────────────────────────┐
│           Your Application              │
│         (Renderer, UI, AI)              │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│            RuleSet Plugin               │
│   (Chess, Crazyhouse, HexChess, etc.)   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│           Chess Kernel Core             │
│  ┌─────────────────────────────────┐    │
│  │  Topology (Rect/Hex/Custom)     │    │
│  │  Board & Position System        │    │
│  │  Piece Management               │    │
│  │  Game State (Immutable)         │    │
│  │  Move Representation            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Installation

```bash
npm install @chess-kernel/core
```

## Quick Start

### Creating a Board with Different Topologies

```typescript
import { 
  RectangularTopology, 
  HexagonalTopology, 
  createBoard,
  createPiece,
  createPosition
} from '@chess-kernel/core';

// Standard 8x8 chess board
const chessTopology = new RectangularTopology(8, 8);
const chessBoard = createBoard(chessTopology);

// Hexagonal board (radius 3 = 37 cells)
const hexTopology = new HexagonalTopology(3);
const hexBoard = createBoard(hexTopology);

// Custom 10x8 board for Capablanca Chess
const capablancaTopology = new RectangularTopology(10, 8);
```

### Working with Pieces

```typescript
import { createPiece, placePieceOnBoard, createPosition } from '@chess-kernel/core';

// Create pieces (engine doesn't know what they do)
const whiteKing = createPiece('w-king', 'king', 'white');
const blackPawn = createPiece('b-pawn-1', 'pawn', 'black');

// Place pieces on the board
const position = createPosition(4, 0); // e1 in chess notation
const boardWithKing = placePieceOnBoard(board, whiteKing, position);
```

### Implementing a Ruleset

```typescript
import { RuleSet, GameState, Move, PlayerId, Topology } from '@chess-kernel/core';

class ChessRuleSet implements RuleSet {
  readonly id = 'standard-chess';
  readonly name = 'Standard Chess';
  readonly pieceDefinitions = [/* ... */];
  
  setupGame(gameId: string, players: readonly PlayerId[], topology: Topology): GameState {
    // Setup initial position
  }
  
  generateMoves(state: GameState, player: PlayerId): readonly Move[] {
    // Generate all pseudo-legal moves
  }
  
  isValidMove(state: GameState, move: Move): boolean {
    // Validate move including check detection
  }
  
  executeMove(state: GameState, move: Move): GameState {
    // Apply move and return new state
  }
  
  checkGameOver(state: GameState): GameResult {
    // Check for checkmate, stalemate, draws
  }
  
  getAttackedPositions(state: GameState, player: PlayerId): readonly Position[] {
    // Get all squares attacked by player's pieces
  }
  
  getPieceDefinition(type: string): PieceDefinition | undefined {
    // Return piece definition
  }
}
```

### Crazyhouse Variant Example

```typescript
class CrazyhouseRuleSet extends ChessRuleSet {
  readonly id = 'crazyhouse';
  readonly name = 'Crazyhouse';
  
  executeMove(state: GameState, move: Move): GameState {
    // Standard move execution
    let newState = super.executeMove(state, move);
    
    // If capture, add piece to capturer's hand
    if (move.capturedPieceId) {
      const capturedPiece = getCapturedPiece(state, move);
      // Add to player's hand in metadata
    }
    
    return newState;
  }
  
  // Add drop moves to generated moves
  generateMoves(state: GameState, player: PlayerId): readonly Move[] {
    const normalMoves = super.generateMoves(state, player);
    const dropMoves = this.generateDropMoves(state, player);
    return [...normalMoves, ...dropMoves];
  }
}
```

## Core Concepts

### Position & Coordinates

Positions are topology-agnostic coordinate tuples:

```typescript
// Square board: [file, rank]
const e4 = createPosition(4, 3); // 0-indexed

// Hex board: axial coordinates [q, r]
const hexCenter = createPosition(0, 0);

// Custom board: any coordinate system
const custom = createPosition('A', 5, 'zone-1');
```

### Immutability

All state is immutable. Operations return new instances:

```typescript
const newState = applyMove(oldState, move, newBoard);
// oldState is unchanged
```

### Metadata System

Rulesets can store custom data in `GameStateMetadata`:

```typescript
interface GameStateMetadata {
  castlingRights?: ReadonlySet<string>;
  enPassantTarget?: Position;
  playerHands?: Map<PlayerId, readonly Piece[]>; // Crazyhouse
  [key: string]: unknown;
}
```

## Supported Topologies

### RectangularTopology
Standard square boards for chess, checkers, shogi, etc.

```typescript
const board8x8 = new RectangularTopology(8, 8);
const board10x8 = new RectangularTopology(10, 8); // Capablanca Chess
```

### HexagonalTopology
Hex grids using axial coordinates.

```typescript
const hexSmall = new HexagonalTopology(2); // 19 cells
const hexMedium = new HexagonalTopology(3); // 37 cells
const hexLarge = new HexagonalTopology(4); // 61 cells
```

### CustomTopology
Irregular boards with explicit position lists.

```typescript
const custom = new CustomTopology(
  positions, // Array of valid positions
  neighbors, // Map of position -> neighbors
  'my-map',
  'Custom Game Map'
);
```

## API Reference

See TypeScript definitions in `dist/index.d.ts` for complete API.

## License

MIT
