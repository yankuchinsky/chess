import { Position, Coordinates } from '@chess-kernel/core';

/**
 * Генерация ходов для Короля
 * Один шаг в любом направлении (8 возможных)
 */
export function generateKingMoves(
  position: Position,
  from: Coordinates,
  color: 'white' | 'black'
): Coordinates[] {
  const moves: Coordinates[] = [];

  // Все 8 направлений вокруг короля
  const directions = [
    { file: 0, rank: 1 },   // вниз
    { file: 0, rank: -1 },  // вверх
    { file: 1, rank: 0 },   // вправо
    { file: -1, rank: 0 },  // влево
    { file: 1, rank: 1 },   // вправо-вниз
    { file: 1, rank: -1 },  // вправо-вверх
    { file: -1, rank: 1 },  // влево-вниз
    { file: -1, rank: -1 }, // влево-вверх
  ];

  for (const dir of directions) {
    const targetFile = from.file + dir.file;
    const targetRank = from.rank + dir.rank;

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
