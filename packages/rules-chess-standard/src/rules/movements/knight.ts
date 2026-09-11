import { Position, Coordinates } from '@chess-kernel/core';

/**
 * Генерация ходов для Коня
 * 8 возможных L-образных ходов
 */
export function generateKnightMoves(
  position: Position,
  from: Coordinates,
  color: 'white' | 'black'
): Coordinates[] {
  const moves: Coordinates[] = [];
  
  // Все возможные L-образные ходы коня
  const offsets = [
    { file: 2, rank: 1 },
    { file: 2, rank: -1 },
    { file: -2, rank: 1 },
    { file: -2, rank: -1 },
    { file: 1, rank: 2 },
    { file: 1, rank: -2 },
    { file: -1, rank: 2 },
    { file: -1, rank: -2 },
  ];

  for (const offset of offsets) {
    const targetFile = from.file + offset.file;
    const targetRank = from.rank + offset.rank;

    if (targetFile >= 0 && targetFile < 8 && targetRank >= 0 && targetRank < 8) {
      const target: Coordinates = { file: targetFile, rank: targetRank };
      const targetPiece = position.getPiece(target);

      // Можно ходить на пустую клетку или бить фигуру противника
      if (!targetPiece || targetPiece.color !== color) {
        moves.push(target);
      }
    }
  }

  return moves;
}
