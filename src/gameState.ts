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

export const changeTheTurn = () => {
  state.isWhiteMove = !state.isWhiteMove;
  console.log("current move is", state.isWhiteMove ? "white" : "black");
};

export const setPiece = (position: number, piece: string | 0) => {
  state.boardMap[position].piece = piece;
};

export const changePiecePosition = (prev: number, curr: number) => {
  const prevCell = state.boardMap[prev];
  const piece = prevCell.cellRef.children[0];
  const currCell = state.boardMap[curr];

  const pieceId = piece.id.split("_")[0];

  setPiece(curr, pieceId);
  setPiece(prev, 0);

  currCell.cellRef.appendChild(piece);
};
