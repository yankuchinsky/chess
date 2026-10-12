import { ChessEngine } from 'chess-engine';
import type { VNode } from 'vue';

class VueChessEngine extends ChessEngine<VNode> {
  showBoardPath(
    cells: number[],
    clearFlag?: boolean,
    isAttack: boolean = false
  ) {
    if (isAttack) {
      this.board.showAttackPath(cells, clearFlag);
    } else {
      this.board.showPath(cells, clearFlag);
    }
  }
}

export default VueChessEngine;
