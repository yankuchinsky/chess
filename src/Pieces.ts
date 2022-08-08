import Piece from './pieces/Piece';
import PieceFactory from './pieces/PieceFactory';

export class Pieces {
  private blackPieces: Piece[] = [];
  private whitePieces: Piece[] = [];
  private blackKing: Piece;
  private whiteKing: Piece;

  private get piecesArray() {
    const arr = [...this.whitePieces, ...this.blackPieces];

    if (this.whiteKing) {
      arr.push(this.whiteKing);
    }

    if (this.blackKing) {
      arr.push(this.blackKing);
    }

    return arr;
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

  calcPath(isWhite: boolean = true) {
    if (isWhite) {
      this.whitePieces.forEach(piece => piece.calculateAvailableCels());
    } else {
      this.blackPieces.forEach(piece => piece.calculateAvailableCels());
    }
  }

  calcKingPath(isWhite: boolean = true) {
    if (isWhite) {
      this.whiteKing?.calculateAvailableCels();
    } else {
      this.blackKing?.calculateAvailableCels();
    }
  }

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
        if (piece.getPiecetype() === 'k') {
          this.whiteKing = piece;
        } else {
          this.whitePieces.push(piece);
        }
      } else {
        if (piece.getPiecetype() === 'k') {
          this.blackKing = piece;
        } else {
          this.blackPieces.push(piece);
        }
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