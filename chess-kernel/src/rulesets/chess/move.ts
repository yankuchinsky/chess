import { EntityId } from '../../core/types';

/**
 * Chess-specific move metadata.
 *
 * Lives in the ruleset layer, NOT in the kernel: the engine treats move
 * metadata as opaque bag-of-data (`Record<string, unknown>` on `Move`) and
 * never interprets these fields. Only `ChessRuleSet` reads/writes them.
 */
export interface ChessMoveMetadata {
  readonly promotionType?: string;
  readonly isEnPassant?: boolean;
  readonly isCastling?: boolean;
  readonly castlingRookId?: EntityId;
}
