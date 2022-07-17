import Piece from './Piece';
import {getCoordinatesByPosition, getPositionByCoordinates, calculateDiagonalAvailableCells } from '../helpers'

class Bishop extends Piece {

  calculateAvailableCels() {
    const curr = this.getCurrentPosition();
    const coordinates = getCoordinatesByPosition(curr);
    const newCoordinates = calculateDiagonalAvailableCells(coordinates);
    const filteredCoordinates = <[number, number][]>newCoordinates;
    const positions = filteredCoordinates.map(c => getPositionByCoordinates(c));

    this.availableCellsToMove = positions
  };
};

export default Bishop;