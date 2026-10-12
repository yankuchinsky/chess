class Range {
  private array: number[];
  private color: 'w' | 'b';

  constructor(color: 'w' | 'b', range: number[]) {
    this.color = color;
    this.array = range;
  }

  getCells() {
    return this.array;
  }

  isKingInRange() {
    //
  }
}

export default Range;