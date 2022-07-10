import Piece from './pieces/Piece';
import PieceFactory from './PieceFactory';
import Board from './Board';

export class Pieces {
  piecesArray: Piece[] = [];

  addPiece(piece: Piece) {
    this.piecesArray.push(piece);
  }

  getPieces() {
    return this.piecesArray;
  }

  setupPiecesByJSON(json: JSON, board: Board) {
    for (let id of Object.keys(json)) {
      const cell = board.getCellById(+id)!;
      const piece = PieceFactory.createPiece(+id, json[id], cell.cellRef);
      this.piecesArray.push(piece);
    }

    this.render();
  }

  render() {
    this.piecesArray.forEach(piece => {
      piece.render();
    });
  }
}

export default Pieces;