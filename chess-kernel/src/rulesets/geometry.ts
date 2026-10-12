import { Position, PlayerId } from '../core/types';

/**
 * Board-orientation geometry required by a ruleset.
 *
 * This is deliberately NOT part of the core `Topology` interface: the kernel
 * topology only knows about valid positions and adjacency. Rulesets that need
 * directional semantics ("forward", "home rank", promotion line) describe
 * their requirements here, and concrete board implementations opt in by
 * providing this capability. That keeps chess-style orientation logic out of
 * the engine core and makes it injectable/testable per ruleset.
 */

/**
 * Minimal contract a board must satisfy for orientation-aware rulesets.
 * Any object with these methods works — including plain test doubles.
 */
export interface OrientedBoard {
  /** Direction delta from one player's perspective (e.g. pawn push). */
  forwardOf(player: PlayerId): readonly number[];
  /** Rank/file coordinate index that orientation is measured along. */
  rankIndex: number;
  /** Home rank (back rank) where a player's major pieces start. */
  homeRankOf(player: PlayerId): number;
  /** Rank a player starts pawns on. */
  pawnStartRankOf(player: PlayerId): number;
  /** Rank at which pawns promote for a player. */
  promotionRankOf(player: PlayerId): number;
}

/**
 * Narrowing helper: does this board expose orientation data?
 */
export function hasOrientation(board: unknown): board is OrientedBoard {
  const b = board as Partial<OrientedBoard> | undefined;
  return !!b &&
    typeof b.forwardOf === 'function' &&
    typeof b.rankIndex === 'number' &&
    typeof b.homeRankOf === 'function' &&
    typeof b.pawnStartRankOf === 'function' &&
    typeof b.promotionRankOf === 'function';
}

/** Coordinate accessor helpers shared by orientation-aware rulesets. */
export function rankAt(position: Position, rankIndex: number): number {
  const value = position.coords[rankIndex];
  if (typeof value !== 'number') {
    throw new Error(`Position [${position.coords}] has no numeric rank at index ${rankIndex}`);
  }
  return value;
}

export function fileAt(position: Position, rankIndex: number): number {
  // On 2-D oriented boards the file is the axis perpendicular to the rank.
  const fileIndex = rankIndex === 0 ? 1 : 0;
  const value = position.coords[fileIndex];
  if (typeof value !== 'number') {
    throw new Error(`Position [${position.coords}] has no numeric file at index ${fileIndex}`);
  }
  return value;
}

/**
 * Standard two-player rectangular orientation (white "up" the ranks).
 *
 * Lives in the ruleset layer, not the core: hex or custom topologies can
 * supply their own OrientedBoard implementation instead.
 */
export class RectangularOrientation implements OrientedBoard {
  constructor(
    private readonly firstPlayerId: PlayerId,
    private readonly secondPlayerId: PlayerId,
    readonly rankIndex: number = 1
  ) {}

  forwardOf(player: PlayerId): readonly number[] {
    const sign = player === this.firstPlayerId ? 1 : -1;
    const delta: number[] = [];
    for (let i = 0; i <= this.rankIndex; i++) delta.push(0);
    delta[this.rankIndex] = sign;
    return delta;
  }

  homeRankOf(player: PlayerId): number {
    return player === this.firstPlayerId ? 0 : 7;
  }

  pawnStartRankOf(player: PlayerId): number {
    return player === this.firstPlayerId ? 1 : 6;
  }

  promotionRankOf(player: PlayerId): number {
    return player === this.firstPlayerId ? 7 : 0;
  }
}
