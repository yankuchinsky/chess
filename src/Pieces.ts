import Piece from './pieces/Piece';
import PieceFactory from './pieces/PieceFactory';

export class Pieces {
  private blackPieces: Piece[] = [];
  private whitePieces: Piece[] = [];

  private get piecesArray() {
    return [...this.whitePieces, ...this.blackPieces];
  }

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

  setupPiecesByJSON(json: JSON, board) {
    for (let id of Object.keys(json)) {
      const cell = board.getCellById(+id)!;
      const piece = PieceFactory.createPiece(+id, json[id], cell.cellRef);
      if (piece.getColor() === 'w') {
        this.whitePieces.push(piece);
      } else {
        this.blackPieces.push(piece);
      }
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

  move(currCell: number, cellToMoveId: number, cell: HTMLDivElement, onCompleteMove: Function) {
    const piece = this.getPieceByPosition(currCell);
    
    if (piece && piece.getAvailableCells().indexOf(cellToMoveId) !== -1) {
      const pieceColor = piece?.getColor();
      const pieceToCapture = this.getPieceByPosition(cellToMoveId);
      if (pieceToCapture && pieceColor !== pieceToCapture.getColor()) {
        this.pieceCapture(pieceToCapture);
      }
      piece.move({ cellToMoveId, cell }, onCompleteMove);
    }
  }

  pieceCapture(piece: Piece) {
    const color = piece.getColor() === 'w' ? 'whitePieces' : 'blackPieces';
    piece.remove();
    this[color] = this[color].filter(p => p.getId() !== piece.getId());
  }

  render() {
    this.piecesArray.forEach(piece => {
      piece.render();
    });
  }
}

export default Pieces;