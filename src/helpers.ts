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
      const coords: [number, number] = [x, y];
      res.push(coords);
    }
  }

  return res.filter(c => c !== currPos);
}

export const getLeftDiagonalRange = (currPos: [number, number]) => {
  const res: [number, number][] = [];
  const verticalShift = Math.floor(getPositionByCoordinates(currPos) / SIZE);
  const startCoords = [currPos[0] + verticalShift, currPos[1] - verticalShift]

  for(let i = 0; i < SIZE; i++) {
    const x = startCoords[0] - i;
    const y = startCoords[1] + i;
    
    if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
      const coords: [number, number] = [x, y];
      res.push(coords);
    }
  }

  return res;
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
