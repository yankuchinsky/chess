import Piece from '../AbstractPiece';
import BasePieceFactory from '../BasePieceFactory';
import Rook from '../Rook';
import AbstractPiece from '../AbstractPiece';
import { ChessEngine } from 'chess-engine';

export class BasePiecesStore<T> {
  protected blackPieces: Piece<T>[] = [];
  protected whitePieces: Piece<T>[] = [];
  protected blackKing: Piece<T>;
  protected whiteKing: Piece<T>;
  private chessEngine: ChessEngine<T>;

  constructor(chessEngine) {
    this.chessEngine = chessEngine;
  }

  protected get piecesArray() {
    const arr = [...this.whitePieces, ...this.blackPieces];

    if (this.whiteKing) {
      arr.push(this.whiteKing);
    }

    if (this.blackKing) {
      arr.push(this.blackKing);
    }

    return arr;
  }

  getPiecesWithoutKing(color: 'w' | 'b') {
    if (color === 'w') {
      return this.whitePieces;
    } else return this.blackPieces;
  }

  getKing(color: 'w' | 'b') {
    if (color === 'w') {
      return this.whiteKing;
    }

    return this.blackKing;
  }

  getPieces() {
    return this.piecesArray;
  }

  getChessEngine() {
    return this.chessEngine;
  }

  getPieceByPosition(position: number): Piece<T> | undefined {
    const foundPiece = this.piecesArray.find((piece) => {
      return piece?.getCurrentPosition() === position;
    });

    return foundPiece;
  }

  preCalculation() {
    //
  }

  calculation() {}

  calcPath(isWhite: boolean = true) {
    if (isWhite) {
      this.whitePieces.forEach((piece) => piece.calculateAvailableCels());
      this.whitePieces.forEach((piece) => piece.calculateCellsToCapture());
    } else {
      this.blackPieces.forEach((piece) => piece.calculateAvailableCels());
      this.blackPieces.forEach((piece) => piece.calculateCellsToCapture());
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
    const foundPiece = this.piecesArray.find((piece) => {
      return piece.getId() === id;
    });

    return foundPiece;
  }

  setupPiecesByJSON(json: JSON) {
    for (let id of Object.keys(json)) {
      const piece = this.createPiece(+id, json[id]);
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
  }

  protected createPiece(boardId, type): AbstractPiece<T> {
    const pieceFactory = new BasePieceFactory<T>(); 
    const piece = pieceFactory.createPiece(boardId, type);
    piece.connectState(this);

    return piece;
  }

  getAllPieces() {
    return [...this.whitePieces, this.whiteKing, ...this.blackPieces, this.blackKing];
  }

  getAllPiecesByColor(color: 'w' | 'b'): Piece<T>[] {
    return this.piecesArray.filter((piece) => piece.getColor() === color);
  }

  getAllAvailablesCellsByColor(color: 'w' | 'b') {
    return this.getAllPiecesByColor(color).reduce((res: number[], curr) => {
      return [...res, ...curr.getAvailableCells()];
    }, []);
  }

  getAllRangesByColor(color: 'w' | 'b'): number[][] {
    return this.getAllPiecesByColor(color)
      .reduce((res: number[][], curr) => {
        if (curr.getPiecetype() !== 'r') {
          return [...res];
        }

        const piece = <Rook<T>>(<unknown>curr);
        return [...res, ...piece.getRanges()];
      }, [])
      .filter((range) => range.length);
  }

  getAllAttackingCellsByColor(color: 'w' | 'b') {
    return this.getAllPiecesByColor(color).reduce((res: number[], curr) => {
      return [...res, ...curr.getCellsToCapture()];
    }, []);
  }

  move(
    currCell: number,
    cellToMoveId: number,
    onCompleteMove: Function
  ) {
    const piece = this.getPieceByPosition(currCell);

    if (piece && piece.getAvailableCells().indexOf(cellToMoveId) !== -1) {
      const pieceColor = piece?.getColor();
      const pieceToCapture = this.getPieceByPosition(cellToMoveId);
      if (pieceToCapture && pieceColor !== pieceToCapture.getColor()) {
        this.pieceCapture(pieceToCapture);
      }
      piece.move({ cellToMoveId }, onCompleteMove);
    }
  }

  pieceCapture(piece: Piece<T>) {
    const color = piece.getColor() === 'w' ? 'whitePieces' : 'blackPieces';
    this[color] = this[color].filter((p) => p.getId() !== piece.getId());
  }
}

export default BasePiecesStore;
