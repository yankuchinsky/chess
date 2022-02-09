import { SIZE } from "./field";
import { state } from "./gameState";

export const checkIsDifferentFiles = (a: number, b: number): boolean => {
  const a1 = a % SIZE;
  const b1 = b % SIZE;

  if (Math.ceil(a / SIZE) === Math.ceil(b / SIZE)) {
    return false;
  }

  if (Math.floor(a / SIZE) === Math.floor(b / SIZE)) {
    return false;
  }

  return true;
};

export const isPathBlocked = (path: number[]) => {
  for (let cell of path) {
    if (state.boardMap[cell]) {
      return true;
    }
  }

  return false;
};

export const isVacantCell = (curr: number, prev: number) => {
  if (!state.boardMap[curr]) {
    return true;
  }

  const currentColor = state.boardMap[prev].toString().split("")[0];
  const movePieceColor = state.boardMap[curr].toString().split("")[0];

  if (currentColor !== movePieceColor) {
    return true;
  }

  return false;
};

export const deletePiece = (id: number) => {
  const element = document.querySelector(`#cell_${id}`);
  const child = element?.querySelector(".piece");

  if (child) {
    element?.removeChild(child);
  }
};

const calcPath = (
  accFn: (idx: number) => number,
  decFn: (idx: number) => number,
  cellsToMove: number,
  isAccending: boolean
) => {
  return [
    ...Array.from(Array(cellsToMove), (_, idx) => {
      if (isAccending) {
        return accFn(idx);
      }

      return decFn(idx);
    }),
  ];
};

export const hasDiagonalObstacles = (curr: number, prev: number) => {
  const validDivider = Math.abs(curr - prev) % 7 === 0 ? 7 : 9;

  const cellsToMove = Math.abs(curr - prev) / validDivider - 1;
  const isAccending = +curr > +prev;

  const accFn = (idx: number) => +prev + validDivider * (idx + 1);
  const decFn = (idx: number) => +prev - validDivider * (idx + 1);
  const path = calcPath(accFn, decFn, cellsToMove, isAccending);

  if (isPathBlocked(path)) {
    return true;
  }

  return false;
};

export const hasVerticalObstacles = (curr: number, prev: number) => {
  const cellsToMove = Math.abs(curr - prev) / SIZE - 1;
  const isAccending = +curr > +prev;

  const accFn = (idx: number) => +prev + SIZE * (idx + 1);
  const decFn = (idx: number) => +prev - SIZE * (idx + 1);
  const path = calcPath(accFn, decFn, cellsToMove, isAccending);

  if (isPathBlocked(path)) {
    return true;
  }

  return false;
};

export const hasHorizontalObstacles = (curr: number, prev: number) => {
  const cellsToMove = Math.abs(curr - prev) - 1;
  const isAccending = +curr > +prev;

  const accFn = (idx: number) => prev + idx + 1;
  const decFn = (idx: number) => prev - idx - 1;
  const path = calcPath(accFn, decFn, cellsToMove, isAccending);

  if (path.length <= 1) {
    return false;
  }

  if (isPathBlocked(path)) {
    return true;
  }

  return false;
};

export const rookMoveCheck = (curr: number, prev: number) => {
  if (
    !(!checkIsDifferentFiles(curr, prev) || Math.abs(curr - prev) % SIZE === 0)
  ) {
    return false;
  }

  if (Math.abs(curr - prev) < 8) {
    if (hasHorizontalObstacles(curr, prev)) {
      return false;
    }
  } else {
    if (hasVerticalObstacles(curr, prev)) {
      return false;
    }
  }
  if (!canMoveToLastCell(curr, prev)) {
    return false;
  }

  return true;
};

export const bishopMoveCheck = (curr: number, prev: number) => {
  const diff = Math.abs(curr - prev);

  if (!(diff % 7 === 0 || diff % 9 == 0)) {
    return false;
  }

  if (hasDiagonalObstacles(curr, prev)) {
    return false;
  }

  if (!canMoveToLastCell(curr, prev)) {
    return false;
  }

  return true;
};

export const canMoveToLastCell = (curr: number, prev: number) => {
  const moveCell = state.boardMap[curr];
  const prevCell = state.boardMap[prev];
  console.log(curr, prev);
  if (!moveCell) {
    return true;
  }

  const pieceColor = moveCell.toString().split("")[0];
  const currentColor = prevCell.toString().split("")[0];

  if (pieceColor !== currentColor) {
    deletePiece(curr);
    return true;
  }

  return false;
};
