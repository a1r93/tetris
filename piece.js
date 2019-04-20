const combinations = [
  /**
   *   x
   * x x x
   */
  {
    indices: [[0, 0], [0, -1], [-1, 0], [1, 0]],
    color: "orange",
    marginX: 10,
    marginY: 20,
    preMarginX: -10,
    preMarginY: 0
  },

  /**
   * x x x x
   */
  {
    indices: [[0, 0], [-1, 0], [1, 0], [2, 0]],
    color: "lightblue",
    marginX: -15,
    marginY: 10,
    preMarginX: -20,
    preMarginY: 0
  },

  /**
   * x x
   *   x x
   */
  {
    indices: [[0, 0], [0, -1], [-1, -1], [1, 0]],
    color: "tomato",
    marginX: 5,
    marginY: 20,
    preMarginX: -10,
    preMarginY: 0
  },

  /**
   *   x x
   * x x
   */
  {
    indices: [[0, 0], [-1, 0], [0, -1], [1, -1]],
    color: "lightgreen",
    marginX: 5,
    marginY: 20,
    preMarginX: -10,
    preMarginY: 0
  },

  /**
   * x x
   * x x
   */
  {
    indices: [[0, 0], [1, 0], [0, 1], [1, 1]],
    color: "yellow",
    marginX: -15,
    marginY: -15,
    preMarginX: -20,
    preMarginY: -15
  },

  /**
   * x
   * x
   * x x
   */
  {
    indices: [[0, 0], [0, -1], [0, 1], [1, 1]],
    color: "purple",
    marginX: -10,
    marginY: 0,
    preMarginX: -20,
    preMarginY: 0
  },

  /**
   *   x
   *   x
   * x x
   */
  {
    indices: [[0, 0], [0, -1], [0, 1], [-1, 1]],
    color: "blue",
    marginX: 25,
    marginY: 0,
    preMarginX: 0,
    preMarginY: 0
  }
]

class Piece {
  constructor(idx) {
    const index =
      idx === undefined ? Math.floor(random(0, combinations.length)) : idx

    this.combination = {
      ...combinations[index],
      indices: [...combinations[index].indices]
    }
    this.index = index
    this.centerX = 4
    this.centerY = 0

    this.currentCount = 0
    this.moveLeftCount = 0
    this.moveRightCount = 0

    this.faster = false
    this.movingLeft = false
    this.movingRight = false
  }

  draw() {
    fill(this.combination.color)
    stroke("black")
    this.combination.indices.forEach(([x, y]) => {
      const rectX = x + this.centerX
      const rectY = y + this.centerY
      rect(rectX * CELL_R + PANEL_WTH, rectY * CELL_R, CELL_R, CELL_R)
    })
  }

  drawPreview(index = 0) {
    const initialY = 300
    const initialX = PANEL_WTH / 2
    const blockSize = 20
    const { preMarginX, preMarginY } = this.combination
    fill(this.combination.color)
    stroke("black")
    this.combination.indices.forEach(([x, y]) => {
      const rectX = x + initialX
      const rectY = y + initialY + index * 4 * blockSize
      rect(
        rectX + x * blockSize + preMarginX,
        rectY + y * blockSize + preMarginY,
        blockSize,
        blockSize
      )
    })
  }

  drawAsSaved() {
    const initialY = 100
    const initialX = 100
    const blockSize = 40
    fill(this.combination.color)
    stroke("black")
    const { marginX, marginY } = this.combination
    this.combination.indices.forEach(([x, y]) => {
      const rectX = x + initialX
      const rectY = y + initialY
      rect(
        rectX + x * blockSize + marginX,
        rectY + y * blockSize + marginY,
        blockSize,
        blockSize
      )
    })
  }

  rotate() {
    const previousIndices = [...this.combination.indices]
    this.combination.indices = this.combination.indices.map(([x, y]) => {
      if (x < 0) {
        if (y === 0) return [y, x]
        if (y < 0) return [-x, y]

        return [x, -y]
      }

      if (x > 0) {
        if (y === 0) return [y, x]
        if (y < 0) return [x, -y]

        return [-x, y]
      }

      if (y !== 0) return [-y, x]

      return [x, y]
    })

    const { minX, maxX } = this.combination.indices.reduce(
      ({ minX, maxX }, [x]) => ({
        minX: Math.min(minX, x),
        maxX: Math.max(maxX, x)
      }),
      { minX: Infinity, maxX: -1000 }
    )
    if (this.centerX - Math.abs(minX) < 0) {
      this.centerX = Math.abs(minX)
    }
    if (this.centerX + Math.abs(maxX) > COLS - 1) {
      this.centerX = COLS - Math.abs(maxX) - 1
    }

    if (this.hasCollisionWithDropped()) {
      this.combination.indices = previousIndices
    }
  }

  goFaster() {
    this.faster = true
  }

  goSlower() {
    this.faster = false
  }

  enableLeft() {
    this.movingLeft = true
    this.moveLeft()
  }

  disableLeft() {
    this.movingLeft = false
    this.moveLeftCount = 0
  }

  enableRight() {
    this.movingRight = true
    this.moveRight()
  }

  disableRight() {
    this.movingRight = false
    this.moveRightCount = 0
  }

  drop() {
    while (!this.update()) {}
    updatePieces()
  }

  hasCollisionWithDropped() {
    for (const currentBlock of this.combination.indices) {
      for (let i = 0; i < droppedBlocks.length; i += 1) {
        for (let j = 0; j < droppedBlocks[i].length; j += 1) {
          const posX = currentBlock[0] + this.centerX
          const posY = currentBlock[1] + this.centerY

          if (droppedBlocks[i][j] && posX === j && posY === i) {
            return true
          }
        }
      }
    }

    return false
  }

  moveLeft() {
    const minX = this.combination.indices.reduce(
      (min, [x]) => Math.min(min, x),
      Infinity
    )
    if (this.centerX - Math.abs(minX) > 0) {
      this.centerX -= 1
      if (this.hasCollisionWithDropped()) {
        this.centerX += 1
      }
    }
  }

  moveRight() {
    const maxX = this.combination.indices.reduce(
      (max, [x]) => Math.max(max, x),
      -1000
    )
    if (this.centerX + Math.abs(maxX) < COLS - 1) {
      this.centerX += 1
      if (this.hasCollisionWithDropped()) {
        this.centerX -= 1
      }
    }
  }

  update() {
    const speed = this.faster ? 5 : 30 - 2.8 * level

    if (this.movingLeft) {
      if (this.moveLeftCount >= 7) {
        this.moveLeft()
        this.moveLeftCount = 0
      } else {
        this.moveLeftCount += 1
      }
    }

    if (this.movingRight) {
      if (this.moveRightCount >= 7) {
        this.moveRight()
        this.moveRightCount = 0
      } else {
        this.moveRightCount += 1
      }
    }

    if (this.currentCount >= speed) {
      this.currentCount = 0
      const maxY = this.combination.indices.reduce(
        (max, [, y]) => Math.max(max, y),
        -1000
      )

      if (this.centerY + Math.abs(maxY) < ROWS - 1) {
        this.centerY += 1
        if (this.hasCollisionWithDropped()) {
          this.centerY -= 1
          return true
        }
        return false
      } else {
        return true
      }
    }
    this.currentCount += 1
    return false
  }
}
