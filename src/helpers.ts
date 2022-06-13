import { SIZE } from "./index";

export enum PieceType {
  WP = "wp",
  WN = "wn",
  WB = "wb",
  WK = "wk",
  WQ = "wq",
  WR = "wr",
  BP = "bp",
  BN = "bn",
  BB = "bb",
  BK = "bk",
  BQ = "bq",
  BR = "br",
}

export const upMove = (position: number, color: TColor, cells = 1) => {
  if (color === 'w') {
    return position + SIZE * cells;
  }

  return position - SIZE * cells;
}

export const checkIsDifferentFiles = (a: number, b: number): boolean => {
  if (Math.ceil(a / SIZE) === Math.ceil(b / SIZE)) {
    return false;
  }

  if (Math.floor(a / SIZE) === Math.floor(b / SIZE)) {
    return false;
  }

  return true;
};

export const absVerticalShift = (a: number, b: number) => {
  // const a1 = files.find((file) => ~file.indexOf(a));
  // const b1 = files.find((file) => ~file.indexOf(b));

  // const i1 = a1!.indexOf(a);
  // const i2 = b1!.indexOf(b);

  // return Math.abs(i1 - i2);
};

export const isPathBlocked = (path: number[]) => {
  for (let cell of path) {
    // if (state.boardMap[cell].piece) {
    //   return true;
    // }
  }

  return false;
};

// export const isOnFirstFile = (a: number) => !!~files[0].indexOf(a);

// export const isOnLastFile = (a: number) => !!~files[7].indexOf(a);

export const isCellCanBeAttacked = (curr: number, next: number) => {
  // if (!state.boardMap[next].piece) {
  //   return false;
  // }

  // const currentColor = state.boardMap[curr].piece.toString().split("")[0];
  // const movePieceColor = state.boardMap[next].piece.toString().split("")[0];

  // if (currentColor !== movePieceColor) {
  //   return true;
  // }

  // return false;
};

export const isVacantCell = (curr: number, prev: number) => {
  // if (!state.boardMap[curr].piece) {
  //   return true;
  // }

  // const currentColor = state.boardMap[prev].piece.toString().split("")[0];
  // const movePieceColor = state.boardMap[curr].piece.toString().split("")[0];

  // if (currentColor !== movePieceColor) {
  //   return true;
  // }

  // return false;
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
  // if (!canMoveToLastCell(curr, prev)) {
  //   return false;
  // }

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

  // if (!canMoveToLastCell(curr, prev)) {
  //   return false;
  // }

  return true;
};

export const canMoveToLastCell = (curr: number, prev: number) => {
  // const moveCell = state.boardMap[curr].piece;
  // const prevCell = state.boardMap[prev].piece;

  // if (!moveCell) {
  //   return true;
  // }

  // const pieceColor = moveCell.toString().split("")[0];
  // const currentColor = prevCell.toString().split("")[0];

  // if (pieceColor !== currentColor) {
  //   deletePiece(curr);
  //   return true;
  // }

  // return false;
};

export const checkIsCastlingMode = (curr: number, prev: number) => {
  if (checkIsDifferentFiles(curr, prev)) {
    return false;
  }

  if (Math.abs(curr - prev) > 1) {
    return true;
  }

  return false;
};

export const castling = (curr: number, prev: number, color: "w" | "b") => {
  let newPos = curr > prev ? prev + 2 : prev - 3;

  if (color === "b") {
    newPos = curr < prev ? prev - 2 : prev + 3;
  }

  if (!hasHorizontalObstacles(prev, newPos)) {
    let rookPos = curr > prev ? 7 : 0;
    let newRookPos = curr > prev ? SIZE - 3 : SIZE - 6;

    if (color === "b") {
      rookPos = curr < prev ? 56 : 63;
      newRookPos = curr < prev ? 58 : 61;
      newPos = curr < prev ? prev - 2 : prev + 3;
    }

    moveToCell(prev, newPos);
    moveToCell(rookPos, newRookPos);
  }
};

export const moveToCell = (curr: number, to: number) => {
  const currentCell = document.querySelector(`#cell_${curr}`);
  if (!currentCell) {
    return;
  }

  const currentPiece = currentCell.querySelector(".piece");
  if (!currentPiece) {
    return;
  }

  const cellToMove = document.querySelector(`#cell_${to}`);
  cellToMove?.appendChild(currentPiece);

};
