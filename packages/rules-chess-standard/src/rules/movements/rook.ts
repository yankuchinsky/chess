import { Position, Coordinates } from '@chess-kernel/core';

/**
 * Генерация ходов для Ладьи
 * Скольжение по вертикалям и горизонталям
 */
export function generateRookMoves(
  position: Position,
  from: Coordinates,
  color: 'white' | 'black'
): Coordinates[] {
  const moves: Coordinates[] = [];

  // 4 направления: вверх, вниз, влево, вправо
  const directions = [
    { file: 0, rank: 1 },   // вниз
    { file: 0, rank: -1 },  // вверх
    { file: 1, rank: 0 },   // вправо
    { file: -1, rank: 0 },  // влево
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
