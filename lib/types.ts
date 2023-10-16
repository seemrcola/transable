export type Point = { x: number, y: number }
export type Coordinate = { lt: Point, rt: Point, rb: Point, lb: Point }
export type Orientation = 'lt' | 'rt' | 'rb' | 'lb' | 't' | 'r' | 'b' | 'l'
export type RatioOrientation = 'lt' | 'rb' | 'rt' | 'lb'

export const orientation: Orientation[] = ['lt', 'rt', 'rb', 'lb', 't', 'r', 'b', 'l']
export const ratioOrientation: RatioOrientation[] = ['lt', 'rb', 'rt', 'lb']


