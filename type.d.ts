declare module "*.png" {
  const value: any;
  export = value;
}

declare module "*.json" {
  const value: any;
  export = value;
}

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