import { Position, Coordinates } from '@chess-kernel/core';

/**
 * Генерация ходов для Слона
 * Скольжение по диагоналям
 */
export function generateBishopMoves(
  position: Position,
  from: Coordinates,
  color: 'white' | 'black'
): Coordinates[] {
  const moves: Coordinates[] = [];

  // 4 диагональных направления
  const directions = [
    { file: 1, rank: 1 },   // вправо-вниз
    { file: 1, rank: -1 },  // вправо-вверх
    { file: -1, rank: 1 },  // влево-вниз
    { file: -1, rank: -1 }, // влево-вверх
  ];

  for (const dir of directions) {
    let currentFile = from.file + dir.file;
    let currentRank = from.rank + dir.rank;

    while (currentFile >= 0 && currentFile < 8 && currentRank >= 0 && currentRank < 8) {
      const target: Coordinates = { file: currentFile, rank: currentRank };
      const targetPiece = position.getPiece(target);

      if (!targetPiece) {
        // Пустая клетка - можно ходить
        moves.push(target);
      } else {
        // Есть фигура
        if (targetPiece.color !== color) {
          // Фигура противника - можно бить и останавливаемся
          moves.push(target);
        }
        // Своя фигура или чужая - блокируем путь
        break;
      }

      currentFile += dir.file;
      currentRank += dir.rank;
    }
  }

  return moves;
}
