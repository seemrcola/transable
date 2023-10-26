import type { Direction, Corner } from '../core/types';

export type Orientation = Direction
export type RatioOrientation = Corner

export const orientation: Orientation[] = ['lt', 'rt', 'rb', 'lb', 't', 'r', 'b', 'l']
export const ratioOrientation: RatioOrientation[] = ['lt', 'rb', 'rt', 'lb']


