type TCell = {
  piece: number | string;
  cellRef: HTMLElement;
};

type TPiece = {
  availableCells: number[];
  type: string;
  cellId: number;
};

type TColor = "w" | "b";

type TPieceType = 'p' | 'n' | 'r' | 'b' | 'k' | 'q';

export { TCell, TPiece, TColor, TPieceType };
