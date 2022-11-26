import { horizontalShift, verticalShift } from './index';

class Position {
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

export default Position;