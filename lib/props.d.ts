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
  left: {
    type: Number,
    default: 0,
  },
  top: {
    type: Number,
    default: 0,
  },
  rotate: {
    type: Number,
    default: 0,
  },
  showCoords: {
    type: Boolean,
    default: true,
  },
} as const

export type TProps = ExtractPropTypes<typeof Props>
