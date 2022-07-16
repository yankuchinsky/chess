import Piece from './pieces/Piece';
import PieceFactory from './PieceFactory';
import Board from './Board';
export class Pieces {
  private piecesArray: Piece[] = [];

  constructor(private readonly board: Board, private readonly gameState) {}

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

  getAllPiecesByColor(color: TColor) {
    return this.piecesArray.filter(piece => piece.getColor() === color);
  }

  getAllAvailablesCellsByColor(color: TColor) {
    return this.getAllPiecesByColor(color).reduce((res: number[], curr) => {
      return [...res, ...curr.getAvailableCells()];
    }, []);
  }

  move(currCell: number, cellToMoveId: number) {
    const piece = this.getPieceByPosition(currCell);
    const pieceType = piece?.getType();
    const pieceId = piece?.getId();
    const onCompleteMove = () => {
      this.gameState.addMove(`${pieceType}_${pieceId}_${currCell}_${cellToMoveId}`)
    }
    
    if (piece && piece.getAvailableCells().indexOf(cellToMoveId) !== -1) {
      const pieceColor = piece?.getColor();
      const pieceToCapture = this.getPieceByPosition(cellToMoveId);
      if (pieceToCapture && pieceColor !== pieceToCapture.getColor()) {
        this.pieceCapture(pieceToCapture);
      }
      const cell = this.board.getCellById(cellToMoveId)!.cellRef;
      piece.move({ cellToMoveId, cell }, onCompleteMove);
      this.gameState.changeTheTurn();
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