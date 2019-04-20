const WIDTH = 700
const HEIGHT = 800
const PANEL_WTH = 250
const GAME_WTH = WIDTH - PANEL_WTH

const GAME_COLOR = "rgba(60, 125, 120, 1)"
const PANEL_COLOR = "rgba(0, 125, 120, 1)"

const CELL_R = 50
const ROWS = HEIGHT / CELL_R
const COLS = GAME_WTH / CELL_R

const btnW = 150
const btnH = 50
const btnX = WIDTH / 2 - btnW / 2
const btnY = HEIGHT / 2 - btnH / 2 + 55

let currentPiece
let savedPiece
let nextPieces = []
let clearing = false
let clearCount = 0
let linesToClear = []
let droppedBlocks = []
let score = 0
let level = 1
let waves = 40
let gameOver = false

const restartGame = () => {
  currentPiece = undefined
  savedPiece = undefined
  nextPieces = []
  clearing = false
  clearCount = 0
  linesToClear = []
  droppedBlocks = []
  score = 0
  level = 1
  waves = 40
  gameOver = false

  setup()
  loop()
}

const drawGame = () => {
  fill(PANEL_COLOR)
  rect(0, 0, PANEL_WTH, HEIGHT)

  fill(GAME_COLOR)
  rect(PANEL_WTH, 0, WIDTH, HEIGHT)
}

const drawGrid = () => {
  for (let i = 0; i < COLS; i += 1) {
    for (let j = 0; j < ROWS; j += 1) {
      stroke("black")
      noFill()
      rect(i * CELL_R + PANEL_WTH, j * CELL_R, CELL_R, CELL_R)
    }
  }
}

const drawSavedBlock = () => {
  noFill()
  stroke("black")
  const margin = 20
  rect(margin, margin, PANEL_WTH - margin * 2, 200)
}

const drawDroppedBlocks = () => {
  for (let i = 0; i < droppedBlocks.length; i += 1) {
    for (let j = 0; j < droppedBlocks[i].length; j += 1) {
      const current = droppedBlocks[i][j]
      if (current) {
        fill(current.color)
        stroke("black")
        rect(j * CELL_R + PANEL_WTH, i * CELL_R, CELL_R, CELL_R)
      }
    }
  }
}

const drawNextPieces = () => {
  nextPieces.forEach((piece, index) => {
    piece.drawPreview(index)
  })
}

const printInfo = () => {
  const scoreText = `Score: ${score}`
  const levelText = `Level: ${level}`
  const wavesText = `Waves: ${waves}`
  textAlign("center")
  textSize(20)
  fill("white")
  noStroke()
  text(scoreText, PANEL_WTH / 2, HEIGHT - 95)
  text(levelText, PANEL_WTH / 2, HEIGHT - 65)
  text(wavesText, PANEL_WTH / 2, HEIGHT - 35)
}

const drawGameOver = () => {
  fill("rgba(0, 0, 0, 0.7)")
  rect(0, 0, WIDTH, HEIGHT)

  const rectW = 250
  const rectH = 200
  const x = WIDTH / 2 - rectW / 2
  const y = HEIGHT / 2 - rectH / 2
  fill("rgb(10, 10, 10)")
  rect(x, y, rectW, rectH)

  fill("white")
  noStroke()
  textSize(30)
  text("Game Over", WIDTH / 2, HEIGHT / 2 - 50)

  const scoreText = `Score: ${score}`
  textSize(25)
  text(scoreText, WIDTH / 2, HEIGHT / 2 - 5)

  fill("rgb(30, 30, 30)")
  rect(btnX, btnY, btnW, btnH)

  fill("rgb(200, 200, 200)")
  text("Play again", WIDTH / 2, HEIGHT / 2 + 63)
}

const swapSavedPiece = () => {
  if (!savedPiece) {
    savedPiece = new Piece(currentPiece.index)
    currentPiece = nextPieces[0]
    nextPieces = nextPieces.slice(1)
    nextPieces.push(new Piece())
  } else {
    const tmpIdx = savedPiece.index
    savedPiece = new Piece(currentPiece.index)
    currentPiece = new Piece(tmpIdx)
  }
}

const getLinesToClear = () => {
  const lines = []
  for (let i = 0; i < droppedBlocks.length; i += 1) {
    let shouldAdd = true
    for (let j = 0; j < droppedBlocks[i].length; j += 1) {
      if (!droppedBlocks[i][j]) {
        shouldAdd = false
        break
      }
    }

    if (shouldAdd) {
      lines.push(i)
    }
  }

  return lines
}

const getEmptyLine = () => {
  const toReturn = []

  for (let i = 0; i < COLS; i += 1) {
    toReturn.push(null)
  }

  return toReturn
}

const getScore = nbLines => {
  switch (nbLines) {
    case 1:
      return 40 * level
    case 2:
      return 100 * level
    case 3:
      return 300 * level
    case 4:
      return 1200 * level
    default:
      return 0
  }
}

const updateWaves = nbLines => {
  waves -= nbLines

  if (waves <= 0) {
    level += 1
    waves = 1
  }
}

const clearLines = async () => {
  const lines = getLinesToClear()
  const nbLines = lines.length
  score += getScore(nbLines)
  updateWaves(nbLines)
  linesToClear = lines

  if (nbLines !== 0) {
    clearing = true
  }

  if (clearing) {
    setTimeout(() => {
      let current = []
      for (let i = droppedBlocks.length - 1; i >= 0; i -= 1) {
        if (!lines.includes(i)) {
          current = [droppedBlocks[i], ...current]
        }
      }

      for (let i = 0; i < lines.length; i += 1) {
        current = [getEmptyLine(), ...current]
      }

      droppedBlocks = current

      clearing = false
      linesToClear = []
      clearCount = 0
    }, 300)
  }
}

const blinkLinesToClear = () => {
  for (let i = 0; i < linesToClear.length; i += 1) {
    const idx = linesToClear[i]
    for (let j = 0; j < droppedBlocks[idx].length; j += 1) {
      const current = droppedBlocks[idx][j]
      if (current) {
        if (clearCount % 2 === 0) {
          fill(current.color)
        } else {
          fill("white")
        }
        stroke("black")
        rect(j * CELL_R + PANEL_WTH, idx * CELL_R, CELL_R, CELL_R)
      }
    }
  }

  clearCount += 1
}

function keyPressed(e) {
  switch (e.key) {
    case "ArrowUp": {
      currentPiece.rotate()
      break
    }
    case "ArrowLeft": {
      currentPiece.enableLeft()
      break
    }
    case "ArrowRight": {
      currentPiece.enableRight()
      break
    }
    case "ArrowDown": {
      currentPiece.goFaster()
      break
    }
    case " ": {
      currentPiece.drop()
      break
    }
    case "c": {
      swapSavedPiece()
      break
    }
    default:
      break
  }
}

function keyReleased(e) {
  switch (e.key) {
    case "ArrowDown": {
      currentPiece.goSlower()
      break
    }
    case "ArrowLeft": {
      currentPiece.disableLeft()
      break
    }
    case "ArrowRight": {
      currentPiece.disableRight()
      break
    }
    default:
      break
  }
}

function mousePressed(e) {
  if (gameOver) {
    const { layerX, layerY } = e

    if (
      layerX >= btnX &&
      layerX <= btnX + btnW &&
      layerY >= btnH &&
      layerY <= btnH + btnY
    ) {
      restartGame()
    }
  }
}

const updatePieces = () => {
  const color = currentPiece.combination.color
  const centerX = currentPiece.centerX
  const centerY = currentPiece.centerY
  currentPiece.combination.indices.forEach(([x, y]) => {
    try {
      droppedBlocks[y + centerY][x + centerX] = { color }
    } catch (err) {
      gameOver = true
    }
  })
  currentPiece = nextPieces[0]
  nextPieces = nextPieces.slice(1)
  nextPieces.push(new Piece())
}

function setup() {
  createCanvas(WIDTH, HEIGHT)

  for (let i = 0; i < ROWS; i += 1) {
    droppedBlocks[i] = []
    for (let j = 0; j < COLS; j += 1) {
      droppedBlocks[i][j] = null
    }
  }

  currentPiece = new Piece()
  for (let i = 0; i < 5; i += 1) {
    nextPieces[i] = new Piece()
  }

  drawGame()
  drawGrid()
  drawSavedBlock()
  currentPiece.draw()
}

function draw() {
  drawGame()
  drawGrid()
  drawSavedBlock()
  printInfo()

  if (!clearing) {
    const shouldUpdate = currentPiece.update()
    if (shouldUpdate) {
      updatePieces()
    }
    clearLines()
  }
  drawNextPieces()
  drawDroppedBlocks()
  currentPiece.draw()

  if (clearing) {
    blinkLinesToClear()
  }

  if (savedPiece) {
    savedPiece.drawAsSaved()
  }
  if (gameOver) {
    drawGameOver()
    noLoop()
  }
}
