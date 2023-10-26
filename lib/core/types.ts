export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeTool {
  staticPoint: MousePoint;
  staticSideY: number;
  staticSideX: number;
  sideOrCorner: 'corner' | 'side';
  direction: Direction;
}

export type MousePoint = { x: number; y: number; }

export type Direction = 'lt' | 'lb' | 'rt' | 'rb' | 't' | 'b' | 'l' | 'r';

export type Corner = 'lt' | 'lb' | 'rt' | 'rb';

export type Side = 't' | 'b' | 'l' | 'r';
