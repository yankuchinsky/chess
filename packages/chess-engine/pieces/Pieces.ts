import Piece from './RenderablePiece';
import Board from '../Board';
import PieceFactory from './PieceFactory';
import PieceRenderer from '../renderers/PieceRenderer';
import ChessEngine from '../ChessEngine';
import Rook from './Rook';
import RenderablePiece from './RenderablePiece';

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

  getPiecesWithoutKing(color: 'w' | 'b') {
    if (color === 'w') {
      return this.whitePieces;
    }
    else return this.blackPieces;
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

  getPieceByPosition(position: number): Piece<T> | undefined {
    const foundPiece = this.piecesArray.find(piece => {
      return piece?.getCurrentPosition() === position;
    })

    return foundPiece;
  };

  preCalculation() {
    // 
  }

  calculation() {
    
  }

  calcPath(isWhite: boolean = true) {
    if (isWhite) {
      this.whitePieces.forEach(piece => piece.calculateAvailableCels());
      this.whitePieces.forEach(piece => piece.calculateCellsToCapture());
    } else {
      this.blackPieces.forEach(piece => piece.calculateAvailableCels());
      this.blackPieces.forEach(piece => piece.calculateCellsToCapture());
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

  setupPiecesByJSON(json: JSON, board: Board<T>, gameState: ChessEngine<T>) {
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

    this.setPiecesRenderer(gameState);
    this.render();
  }

  getAllPiecesByColor(color: 'w' | 'b'): Piece<T>[] {
    return this.piecesArray.filter(piece => piece.getColor() === color);
  }

  getAllAvailablesCellsByColor(color: 'w' | 'b') {
    return this.getAllPiecesByColor(color).reduce((res: number[], curr) => {
      return [...res, ...curr.getAvailableCells()];
    }, []);
  }

  getAllRangesByColor(color: 'w' | 'b'): number[][] {
    return this.getAllPiecesByColor(color).reduce((res: number[][], curr) => {
      if (curr.getPiecetype() !== 'r') {
        return [...res];
      }

      const piece = <Rook<T>>(<unknown>curr.getPiece());
      return [...res, ...piece.getRanges()];
    }, []).filter(range => range.length);
  }

  getAllAttackingCellsByColor(color: 'w' | 'b') {
    return this.getAllPiecesByColor(color).reduce((res: number[], curr) => {
      return [...res, ...curr.getCellsToCapture()];
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

  setPiecesRenderer(gameState: ChessEngine<T>) {
    this.piecesArray.forEach(piece => {
      piece.setRenderer(this.pieceRenderer.returnNewRenderer());
      piece.setPiecesRef(this);
      piece.setGameState(gameState);
      piece.init();
    });
  }

  calculateDefenders() {
    //
  }

  render() {
    this.piecesArray.forEach(piece => piece.render());
  }
}

export default Pieces;