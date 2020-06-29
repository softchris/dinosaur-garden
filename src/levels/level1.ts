// how do we store it?
export const level = {
  target: { x: 0, y: 0 },
  boxes: [
  {
    x: 0,
    y: 0,
    gates: {
      top: false,
      left: true,
      right: true,
      bottom: true
    }
  },
  {
    x: 0,
    y: 1,
    gates: {
      top: false,
      left: true,
      right: true,
      bottom: false
    }
  },
  {
    x: 0,
    y: 2,
    gates: {
      top: false, 
      left: true,
      right: true,
      bottom: false
    }
  }
]
}
