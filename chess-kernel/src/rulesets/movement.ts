import { Position, PlayerId, createPosition } from '../core/types';
import { Piece } from '../core/piece';
import { Board, getPieceAt } from '../topology/board';
import { MovementPattern } from '../core/ruleset';

/**
 * Direction remapping hook.
 *
 * The generic generator knows nothing about piece semantics; a ruleset can
 * supply its own mapper to translate an abstract direction delta into board
 * deltas for a given owner (e.g. "forward"/"backward" for pawns on a
 * rectangular board). Without a mapper, deltas are used as-is — which is the
 * natural behavior for symmetric pieces and non-rectangular topologies.
 */
export type DirectionMapper = (
  delta: readonly number[],
  owner: PlayerId
) => readonly number[];

/**
 * Identity mapper: directions are absolute board deltas.
 */
export const identityDirectionMapper: DirectionMapper = (delta) => delta;

/**
 * Generic movement-pattern generator.
 *
 * Topology-agnostic in the coordinate sense: it applies numeric deltas to
 * positions and delegates boundary/occupancy checks to the board's topology.
 * Any ruleset can reuse it to turn `MovementPattern` declarations into
 * concrete (from, to) pairs.
 */

export interface MovementContext {
  board: Board;
  piece: Piece;
  /**
   * Optional override of the piece used for generation. Used by attack maps:
   * a pawn attacks diagonally even though it moves forward, so probing its
   * attacked squares requires pretending it is a different (symmetric) piece.
   */
  pieceOverride?: Piece;
  /** Extra blocked positions supplied by the ruleset (e.g. castling path). */
  extraBlocked?: readonly Position[];
  /** Ruleset-provided remapping of abstract direction deltas (see above). */
  mapDirection?: DirectionMapper;
}

/**
 * Adds a numeric delta to a position. Positions with non-numeric coordinates
 * cannot be translated; such positions yield no target.
 */
export function translatePosition(position: Position, delta: readonly number[]): Position | null {
  if (position.coords.length !== delta.length) return null;
  const coords: number[] = [];
  for (let i = 0; i < position.coords.length; i++) {
    const c = position.coords[i];
    if (typeof c !== 'number') return null;
    coords.push(c + delta[i]);
  }
  return createPosition(...coords);
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.coords.length === b.coords.length && a.coords.every((c, i) => c === b.coords[i]);
}

function isBlockedExtra(ctx: MovementContext, target: Position): boolean {
  return ctx.extraBlocked?.some(p => positionsEqual(p, target)) ?? false;
}

/**
 * Generates all pseudo-legal destinations for one movement pattern of one piece.
 * Respects sliding semantics, step bounds and occupancy:
 * - `canMoveEmpty` allows landing on empty cells;
 * - `canCapture` allows landing on enemy-occupied cells;
 * - lines stop at the first occupied cell.
 */
export function generatePatternTargets(ctx: MovementContext, pattern: MovementPattern): Position[] {
  const results: Position[] = [];
  const piece = ctx.pieceOverride ?? ctx.piece;

  for (const spec of pattern.directions) {
    const minSteps = spec.minSteps ?? 1;
    const maxSteps = spec.maxSteps ?? (pattern.isSliding ? Number.MAX_SAFE_INTEGER : 1);
    const delta = ctx.mapDirection
      ? ctx.mapDirection(spec.delta, piece.owner)
      : spec.delta;

    let current: Position | null = piece.position ?? null;
    if (!current) continue;

    for (let step = 1; step <= maxSteps; step++) {
      current = translatePosition(current, delta);
      if (!current) break;
      if (!ctx.board.topology.isValidPosition(current)) break;

      const occupant = getPieceAt(ctx.board, current);
      if (isBlockedExtra(ctx, current)) break;

      if (occupant) {
        const isEnemy = occupant.owner !== piece.owner;
        if (step >= minSteps && isEnemy && pattern.canCapture) {
          results.push(current);
        }
        break; // occupied cell stops any sliding / stepping line
      }

      if (step >= minSteps && pattern.canMoveEmpty) {
        results.push(current);
      }
    }
  }

  return results;
}

/**
 * Convenience: generate targets for every pattern a piece has.
 * Returns destination -> pattern-id mapping so the ruleset can tag moves.
 */
export function generateAllTargets(
  ctx: MovementContext,
  patterns: readonly MovementPattern[]
): { position: Position; patternId: string }[] {
  const out: { position: Position; patternId: string }[] = [];
  for (const pattern of patterns) {
    for (const position of generatePatternTargets(ctx, pattern)) {
      out.push({ position, patternId: pattern.id });
    }
  }
  return out;
}
