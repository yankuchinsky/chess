import { Position, Coordinate, getPieceAt, Board } from '@chess-kernel/core';

/**
 * Helper для создания позиции из координат
 */
function createPos(file: number, rank: number): Position {
  return { coords: [file, rank] as Coordinate };
}

/**
 * Генерация ходов для Пешки
 * - Одиночный ход вперёд
 * - Двойной ход со стартовой позиции
 * - Взятие по диагонали
 */
export function generatePawnMoves(
  board: Board,
  from: Position,
  color: 'white' | 'black'
): Position[] {
  const moves: Position[] = [];
  const [file, rank] = from.coords as [number, number];
  const direction = color === 'white' ? 1 : -1;
  const startRank = color === 'white' ? 1 : 6;

  // Одиночный ход вперёд
  const oneStepRank = rank + direction;
  if (oneStepRank >= 0 && oneStepRank < 8) {
    const oneStep = createPos(file, oneStepRank);
    if (!getPieceAt(board, oneStep)) {
      moves.push(oneStep);

      // Двойной ход со старта
      if (rank === startRank) {
        const twoStepRank = rank + 2 * direction;
        const twoStep = createPos(file, twoStepRank);
        if (!getPieceAt(board, twoStep)) {
          moves.push(twoStep);
        }
      }
    }
  }

  // Взятие по диагонали
  const captureRanks = [rank + direction];
  const captureFiles = [file - 1, file + 1];

  for (const captureFile of captureFiles) {
    for (const captureRank of captureRanks) {
      if (captureFile >= 0 && captureFile < 8 && captureRank >= 0 && captureRank < 8) {
        const target = createPos(captureFile, captureRank);
        const targetPiece = getPieceAt(board, target);
        if (targetPiece && targetPiece.owner !== color) {
          moves.push(target);
        }
      }
    }
  }

  return moves;
}
