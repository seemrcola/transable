import type { ExtractPropTypes } from 'vue'

export const Props = {
  width: {
    type: Number,
    default: 100,
  },
  height: {
    type: Number,
    default: 100,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
} as const

export type TProps = ExtractPropTypes<typeof Props>
