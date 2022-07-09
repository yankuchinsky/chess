import { globalGameState, SIZE } from "./index";

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

export const verticalShift = (currPos: [number, number], val: number): [number, number] | null => {
  const newPos = currPos[1] + val;
  if (newPos < SIZE && newPos >= 0) {
    return [currPos[0], newPos];
  }

  return null;
}

export const horizontalShift = (currPos: [number, number], val: number): [number, number] | null => {
  const newPos = currPos[0] + val;
  if (newPos < SIZE && newPos >= 0) { 
    return [newPos, currPos[1]];
  }

  return null;
}

export const getPositionByCoordinates = (currPos: [number, number]) => {
  const [x, y] = currPos;
  return y * SIZE + x;
}

export const getCoordinatesByPosition = (pos: number): [number, number] => {
  const y = Math.floor(pos / SIZE);
  const x = pos % SIZE;
  return [x, y];
}

export const getVerticalRange = (currPos: [number, number]) => {
  const res: [number, number][] = [];

  for(let i = 0; i < SIZE; i++) {
    res.push([currPos[0], i]);
  }

  return res
}

export const getHorizontalRange = (currPos: [number, number]) => {
  const res: [number, number][] = [];

  for(let i = 0; i < SIZE; i++) {
    res.push([i, currPos[1]]);
  }

  return res
}

export const getRightDiagonalRange = (currPos: [number, number]) => {
  const res: [number, number][] = [];
  const verticalShift = Math.floor(getPositionByCoordinates(currPos) / SIZE);
  const startCoords = [currPos[0] - verticalShift, currPos[1] - verticalShift]

  for(let i = 0; i < SIZE; i++) {
    const x = startCoords[0] + i;
    const y = startCoords[1] + i;

    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
      res.push([startCoords[0] + i, startCoords[1] + i]);
    }
  }

  return res
}

export const getLeftDiagonalRange = (currPos: [number, number]) => {
  const res: [number, number][] = [];
  const verticalShift = Math.floor(getPositionByCoordinates(currPos) / SIZE);
  const startCoords = [currPos[0] - verticalShift, currPos[1] + verticalShift]

  for(let i = 0; i < SIZE; i++) {
    const x = startCoords[0] - i;
    const y = startCoords[1] + i;

    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
      res.push([startCoords[0] - i, startCoords[1] + i]);
    }
  }

  return res
}

export class Position {
  private position: [number, number];
  hasShiftError = false;

  horizontalShift(val: number) {
    const shift = horizontalShift(this.position, val);
    if (shift) {
      this.position = shift
    } else {
      this.hasShiftError = true;
    }

    return this;
  };
  verticalShift(val: number) {
    const shift = verticalShift(this.position, val);

    if (shift) {
      this.position = shift
    } else {
      this.hasShiftError = true;
    }

    return this;
  };

  getPostition() {
    return this.hasShiftError ? null : this.position;
  }

  constructor(val: [number, number]) {
    this.position = val;
  }
}

export const horizontalMove = (position: number, cells = 1) => {
  const board = globalGameState.getBoard();
  const pos = position + cells;
  const files = board.getFiles();
  const file = files.find(f => ~f.indexOf(position));
  if (file?.indexOf(pos) !== -1) {
    return pos;
  } else {
    return null;
  }
}

export const absVerticalShift = (a: number, b: number) => {
  // const a1 = files.find((file) => ~file.indexOf(a));
  // const b1 = files.find((file) => ~file.indexOf(b));

  // const i1 = a1!.indexOf(a);
  // const i2 = b1!.indexOf(b);

  // return Math.abs(i1 - i2);
};

export const isPathBlocked = (path: number[]) => {
  const board = globalGameState.getBoard();
  const boardMap = board.getFlatBoard();
  
  for (let cell of path) {
    if (boardMap[cell].piece) {
      return true;
    }
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
