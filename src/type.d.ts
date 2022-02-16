declare module "*.png" {
  const value: any;
  export = value;
}

type TCell = {
  piece: number | string;
  cellRef: HTMLElement;
};
