import { Position, Coordinates } from '@chess-kernel/core';
import { generateBishopMoves } from './bishop';
import { generateRookMoves } from './rook';

/**
 * Генерация ходов для Ферзя
 * Комбинация ходов Слона и Ладьи
 */
export function generateQueenMoves(
  position: Position,
  from: Coordinates,
  color: 'white' | 'black'
): Coordinates[] {
  // Ферзь = Слон + Ладья
  const bishopMoves = generateBishopMoves(position, from, color);
  const rookMoves = generateRookMoves(position, from, color);

  return [...bishopMoves, ...rookMoves];
}
