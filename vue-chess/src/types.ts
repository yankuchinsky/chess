import { AbstractPiece, type TColor } from "chess-engine";
import type { VNode } from 'vue';

type VuePiece = AbstractPiece<VNode>;

interface VueCell {
  id: number;
  color: TColor;
  cellRef: any;
  piece?: AbstractPiece<VNode>;
  path?: boolean;
}

export type { VueCell, VuePiece };