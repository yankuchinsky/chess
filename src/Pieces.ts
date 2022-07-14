import Piece from './pieces/Piece';
import PieceFactory from './PieceFactory';
import Board from './Board';
import { globalGameState } from './index'
export class Pieces {
  private piecesArray: Piece[] = [];

  constructor(private readonly board: Board) {}

  addPiece(piece: Piece) {
    this.piecesArray.push(piece);
  }

  getPieces() {
    return this.piecesArray;
  }

  getPieceByPosition(position: number) {
    const foundPiece = this.piecesArray.find(piece => {
      return piece?.getCurrentPosition() === position;
    })

    return foundPiece;
  };

  getPieceById(id: number) {
    const foundPiece = this.piecesArray.find(piece => {
      return piece.getId() === id;
    })

    return foundPiece;
  }

  setupPiecesByJSON(json: JSON) {
    for (let id of Object.keys(json)) {
      const cell = this.board.getCellById(+id)!;
      const piece = PieceFactory.createPiece(+id, json[id], cell.cellRef);
      this.piecesArray.push(piece);
    }

    this.render();
  }

  move(currId: number, cellToMoveId: number) {
    const piece = this.getPieceByPosition(currId);
    if (piece && piece.getAvailableCells().indexOf(cellToMoveId) !== -1) {
      const pieceColor = piece?.getColor();
      const pieceToCapture = this.getPieceByPosition(cellToMoveId);
      if (pieceToCapture && pieceColor !== pieceToCapture.getColor()) {
        this.pieceCapture(pieceToCapture);
      }
      const cell = this.board.getCellById(cellToMoveId)!.cellRef;
      piece.move({ cellToMoveId, cell });
      globalGameState.changeTheTurn();
    }
  }

  pieceCapture(piece: Piece) {
    piece.remove();
    this.piecesArray = this.piecesArray.filter(p => p.getId() !== piece.getId());
  }

  render() {
    this.piecesArray.forEach(piece => {
      piece.render();
    });
  }
}

export default Pieces;