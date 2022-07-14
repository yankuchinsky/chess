import { pieces, SIZE } from "./index";

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

export const calculateDiagonalAvailableCells = (coordinates: [number, number]) => {
  const leftRange = getLeftDiagonalRange(coordinates).filter(c => !!c);
  const rightRange = getRightDiagonalRange(coordinates).filter(c => !!c);

  const tlBlockerCoords = new Position(coordinates).horizontalShift(-1).verticalShift(1).getPostition()!;
  const trBlockerCoords = new Position(coordinates).horizontalShift(1).verticalShift(1).getPostition()!;
  const blBlockerCoords = new Position(coordinates).horizontalShift(-1).verticalShift(-1).getPostition()!;
  const brBlockerCoords = new Position(coordinates).horizontalShift(1).verticalShift(-1).getPostition()!;


  const tlBlocker = tlBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(tlBlockerCoords));
  const trBlocker = trBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(trBlockerCoords));
  const blBlocker = blBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(blBlockerCoords));
  const brBlocker = brBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(brBlockerCoords));

  const idxLeft = leftRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
  const idxRight = rightRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);

  const tlRange = leftRange.slice(idxLeft, leftRange.length);
  const brRange = leftRange.slice(0, idxLeft);
  const blRange = rightRange.slice(0, idxRight);
  const trRange = rightRange.slice(idxRight, rightRange.length);

  const newCoordinates: [number, number][] = [];

  if (!tlBlocker) {
    tlRange.forEach(c => {
      newCoordinates.push(c);
    });
  }

  if (!trBlocker) {
    trRange.forEach(c => {
      newCoordinates.push(c);
    });
  }

  if (!blBlocker) {
    blRange.forEach(c => {
      newCoordinates.push(c);
    });
  }

  if (!brBlocker) {
    brRange.forEach(c => {
      newCoordinates.push(c);
    });
  }

  return newCoordinates;
}

export const calculateVerticalAvailableCells = (coordinates: [number, number]) => {
  const piecePosition = getPositionByCoordinates(coordinates);
  const piece = pieces.getPieceByPosition(piecePosition);

  if (!piece) {
    return [];
  }

  const pieceColor = piece?.getColor();
  const tBlockerCoords = new Position(coordinates).verticalShift(1).getPostition()!;
  const lBlockerCoords = new Position(coordinates).horizontalShift(-1).getPostition()!;
  const rBlockerCoords = new Position(coordinates).horizontalShift(1).getPostition()!;
  const bBlockerCoords = new Position(coordinates).verticalShift(-1).getPostition()!;

  const tBlocker = tBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(tBlockerCoords));
  const lBlocker = lBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(lBlockerCoords));
  const rBlocker = rBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(rBlockerCoords));
  const bBlocker = bBlockerCoords && pieces.getPieceByPosition(getPositionByCoordinates(bBlockerCoords));

  const horizontalRange = getHorizontalRange(coordinates);
  const verticalRange = getVerticalRange(coordinates);

  const idxHorizontal = horizontalRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);
  const idxVertical = verticalRange.findIndex(c => c[0] === coordinates[0] && c[1] === coordinates[1]);

  const rRange = horizontalRange.slice(idxHorizontal + 1, horizontalRange.length);
  const tRange = verticalRange.slice(idxVertical + 1, verticalRange.length);
  const lRange = horizontalRange.slice(0, idxHorizontal).reverse();
  const bRange = verticalRange.slice(0, idxVertical).reverse();
  const newCoordinates: [number, number][] = [];

  const filterPath = (range: [number, number][], arrayForResults: [number, number][]) => {
    for (let i = 0; i < range.length; i++) {
      const c = range[i];
      const position = getPositionByCoordinates(c);
      const blockerPositionPiece = pieces.getPieceByPosition(position);

      if (!blockerPositionPiece) {
        arrayForResults.push(c);
      } else if(blockerPositionPiece.getColor() !== pieceColor) {
        arrayForResults.push(c);
        break;
      } else {
        break;
      }
    }
  }

  filterPath(tRange, newCoordinates);
  filterPath(lRange, newCoordinates);
  filterPath(rRange, newCoordinates);
  filterPath(bRange, newCoordinates);

  return newCoordinates;
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
