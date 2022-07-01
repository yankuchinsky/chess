import Piece from './Piece';

class Bishop extends Piece {
  override availableCellsToMove: number[] = []; 

  calculateAvailableCels(postion: number[]) {
    const [x, y] = postion;
  };
};

export default Bishop;