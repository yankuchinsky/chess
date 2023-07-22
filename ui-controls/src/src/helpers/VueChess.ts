import { ChessEngine } from 'chess-engine'
import type { VNode } from 'vue';

class VueChessEngine extends ChessEngine<VNode> {}

export default VueChessEngine;