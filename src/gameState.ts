import { SIZE } from "./field";

interface IGameState {
  boardMap: TCell[];
  isWhiteMove: boolean;
  whiteCapturedPieces: string[];
  blackCapturedPieces: string[];
}

export const state: IGameState = {
  boardMap: [],
  isWhiteMove: true,
  whiteCapturedPieces: [],
  blackCapturedPieces: [],
};

export const initBoard = () => {
  state.boardMap = Array.from(new Array(SIZE * SIZE), () => 0);
  console.log(state.boardMap);
};

export const changeTheTurn = () => {
  state.isWhiteMove = !state.isWhiteMove;
  console.log("current move is", state.isWhiteMove ? "white" : "black");
};
