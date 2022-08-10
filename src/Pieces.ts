import Piece from './pieces/Piece';
import PieceFactory from './pieces/PieceFactory';
import PieceRenderer from './pieces/PieceRenderer';

export class Pieces<T> {
  private blackPieces: Piece<T>[] = [];
  private whitePieces: Piece<T>[] = [];
  private blackKing: Piece<T>;
  private whiteKing: Piece<T>;
  private pieceFactory: PieceFactory<T>; 
  private pieceRenderer: PieceRenderer<T>;

  constructor(renderer: PieceRenderer<T>) {
    this.pieceFactory = new PieceFactory<T>();
    this.pieceRenderer = renderer;
  }

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
      const piece = this.pieceFactory.createPiece(+id, json[id], cell.cellRef);
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

    this.setPiecesRenderer();
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

  move(currCell: number, cellToMoveId: number, cell: T, onCompleteMove: Function) {
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

  pieceCapture(piece: Piece<T>) {
    const color = piece.getColor() === 'w' ? 'whitePieces' : 'blackPieces';
    piece.remove();
    this[color] = this[color].filter(p => p.getId() !== piece.getId());
  }

  setPiecesRenderer() {
    this.piecesArray.forEach(piece => {
      piece.setRenderer(this.pieceRenderer.returnNewRenderer());
      piece.init();
    });
  }

  render() {
    this.piecesArray.forEach(piece => piece.render());
  }
}

export default Pieces;