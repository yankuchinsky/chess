import ChessEngine from "../ChessEngine";
import Pieces, { BasePiecesStore } from './PiecesStore/BasePiecesStore';

type TColor = 'w' | 'b';

abstract class AbstractPiece<T> {
  private color: TColor;
  private id: number;
  private type: string;
  private pieceType: string;
  private currentPosition: number;
  protected availableCellsToMove: number[] = [];
  protected pieces: Pieces<T>;
  protected globalGameState: ChessEngine<T>;
  protected cellsToCapture: number[] = [];

  constructor(id: number, type: string) {
    this.type = type;
    this.pieceType = type.split('')[1];
    this.id = id;
    this.currentPosition = id;
    this.color = <TColor>type.split("")[0];
  };

  getCellsToCapture() {
    return this.cellsToCapture;
  }

  setPiecesRef(pieces: Pieces<T>) {
    this.pieces = pieces;
  }

  setGameState(gameState: ChessEngine<T>) {
    this.globalGameState = gameState;
  }

  abstract calculateAvailableCels();
  
  calculateCellsToCapture() {}

  getId() {
    return this.id;
  }

  setId(id: number) {
    this.id = id;
  }

  getColor() {
    return this.color;
  }

  getType() {
    return this.type;
  }

  getPiecetype() {
    return this.pieceType;
  }

  getCurrentPosition() {
    return this.currentPosition;
  }

  setCurrentPosition(position: number) {
    this.currentPosition = position;
  }

  clearAvailableCells() {
    this.availableCellsToMove = [];
  }

  getAvailableCells() {
    return this.availableCellsToMove;
  }

  connectState(piecesStore: BasePiecesStore<T>) {
    this.pieces = piecesStore;
    this.globalGameState = piecesStore.getChessEngine();
  }

  move({ cellToMoveId }: { cellToMoveId: number }, callback?: Function) {
    this.setCurrentPosition(cellToMoveId);

    if (callback) {
      callback();
    }
  }
}

export default AbstractPiece;