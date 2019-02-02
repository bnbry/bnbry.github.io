// Color Palette for shapes
const PALETTE = {
  black: '#353535',
  blue: '#1865B5',
  teal: '#71CCC4',
  red: '#FA4336',
  yellow: '#FEFA65',
  pink: '#E29AC0',
};

// Base Config values for shapes an grid
const DEFAULT_CONFIG = {
  gridSize: 200,
  squareConfig: {
    accentChance: 0.15,
    fillStyle: PALETTE.red,
    lineWidth: 6,
    strokeStyle: PALETTE.black,
    width: 50,
  },
  circleConfig: {
    accentChance: 0.1,
    fillStyle: PALETTE.blue,
    lineWidth: 6,
    strokeStyle: PALETTE.black,
    radius: 30,
  },
  slatsConfig: {
    accentChance: 0.25,
    fillStyle: PALETTE.teal,
    lineWidth: 6,
    strokeStyle: PALETTE.black,
    length: 75,
  },
  squizzleConfig: {
    accentChance: 0.1,
    fillStyle: PALETTE.pink,
    lineWidth: 6,
    strokeStyle: PALETTE.black,
    shift: 30,
  },
  triangleConfig: {
    accentChance: 0.125,
    fillStyle: PALETTE.yellow,
    lineWidth: 6,
    strokeStyle: PALETTE.black,
    baseWidth: 60,
  }
};

// Identity matrix resets canvas manipulation
const RESET_MATRIX = [1, 0, 0, 1, 0, 0]

class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
  }

  adjust (adjustX, adjustY) {
    return new Point(this.x + adjustX, this.y + adjustY)
  }

  tessellate (defaultNoise = 8) {
    return new Point(this.x + this.noise(defaultNoise), this.y + this.noise(defaultNoise))
  }

  noise (defaultNoise) {
    const sign = Math.random() > 0.5 ? -1 : 1

    return sign * Math.ceil(Math.random() * 2 * defaultNoise + (defaultNoise / 2))
  }
}

class Grid {
  constructor (pixelWidth, pixelHeight, config) {
    this.width = pixelWidth
    this.height = pixelHeight
    this.config = config
    this.gridSize = this.config.gridSize
  }

  get columns () {
    return Math.floor(this.width / this.gridSize) + 1
  }

  get rows () {
    return Math.floor(this.height / this.gridSize) + 1
  }

  generatePoints () {
    let points = [];

    for(let i = 0; i <= this.columns; i++) {
      for(let j = 0; j <= this.rows; j++) {
        points.push(...this.constructPoints(i, j))
      }
    }

    return points
  }

  previewGrid (ctx) {
    this.generatePoints().forEach(point => {
      ctx.fillStyle = PALETTE.pink
      ctx.beginPath()
      ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  constructPoints (column, row) {
    const baseX = this.gridSize * column
    const baseY = this.gridSize * row
    const altX = baseX - this.gridSize / 2
    const altY = baseY - this.gridSize / 2

    return [new Point(baseX, baseY).tessellate(), new Point(altX, altY).tessellate()]
  }
}

class Square {
  constructor (app, gridPoint) {
    this.app = app
    this.ctx = this.app.ctx
    this.config = this.app.config.squareConfig
    this.gridPoint = gridPoint

    this.accented = Math.random() < this.config.accentChance
    this.rotation = Math.random() * (2 * Math.PI)
    this.fillOrigin = this.recenterOrigin()
    this.strokeOrigin = this.fillOrigin.tessellate()
  }

  stroke () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.strokeStyle = this.config.strokeStyle
    this.ctx.lineWidth = this.config.lineWidth
    this.accented ? this.strokeAccent() : this.strokeOutline()

    this.app.restoreContext()

    return this
  }

  fill () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.fillStyle = this.app.randomColor()
    this.ctx.fillRect(this.fillOrigin.x, this.fillOrigin.y, this.config.width, this.config.width)

    this.app.restoreContext()

    return this
  }

  strokeOutline () {
    this.ctx.strokeRect(this.strokeOrigin.x, this.strokeOrigin.y, this.config.width, this.config.width)
  }

  strokeAccent () {
    const steps = 4
    const step = this.config.width / steps;

    const leftSide = this.strokeOrigin.x
    const rightSide = this.strokeOrigin.x + this.config.width

    const depthZero  = this.strokeOrigin.y
    const depthOne   = this.strokeOrigin.y + 1 * step
    const depthTwo   = this.strokeOrigin.y + 2 * step
    const depthThree = this.strokeOrigin.y + 3 * step
    const depthFour  = this.strokeOrigin.y + 4 * step

    this.ctx.beginPath()
    this.ctx.moveTo(leftSide - this.config.lineWidth / 2,  depthZero)
    this.ctx.lineTo(rightSide, depthZero)

    this.ctx.lineTo(rightSide, depthOne)
    this.ctx.lineTo(leftSide,  depthOne)

    this.ctx.lineTo(leftSide,  depthTwo)
    this.ctx.lineTo(rightSide, depthTwo)

    this.ctx.lineTo(rightSide, depthThree)
    this.ctx.lineTo(leftSide,  depthThree)

    this.ctx.lineTo(leftSide,  depthFour)
    this.ctx.lineTo(rightSide + this.config.lineWidth / 2, depthFour)

    this.ctx.stroke()
  }

  recenterOrigin () {
    const shift = this.config.width / 2
    return  new Point(-shift, -shift)
  }
}

class Circle {
  constructor(app, gridPoint) {
    this.app = app
    this.ctx = this.app.ctx
    this.config = this.app.config.circleConfig
    this.gridPoint = gridPoint

    this.accented = Math.random() < this.config.accentChance
    this.rotation = 0 //Math.random() * Math.PI
    this.fillOrigin = this.recenterOrigin()
    this.strokeOrigin = this.fillOrigin.tessellate()
  }

  fill () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.fillStyle = this.app.randomColor()
    this.ctx.lineWidth = this.config.lineWidth
    this.ctx.beginPath()
    this.ctx.arc(this.fillOrigin.x, this.fillOrigin.y, this.config.radius, 0, 2 * Math.PI)
    this.ctx.fill()

    this.app.restoreContext()

    return this
  }

  stroke () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.strokeStyle = this.config.strokeStyle
    this.ctx.lineWidth = this.config.lineWidth
    this.accented ? this.strokeAccent() : this.strokeOutline()

    this.app.restoreContext()

    return this
  }

  strokeAccent () {
    this.strokeOutline()

    this.ctx.beginPath()
    this.ctx.arc(this.strokeOrigin.x, this.strokeOrigin.y, this.config.radius / 1.5, 0, 2 * Math.PI)
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.arc(this.strokeOrigin.x, this.strokeOrigin.y, this.config.radius / 3, 0, 2 * Math.PI)
    this.ctx.stroke()
  }

  strokeOutline () {
    this.ctx.beginPath()
    this.ctx.arc(this.strokeOrigin.x, this.strokeOrigin.y, this.config.radius, 0, 2 * Math.PI)
    this.ctx.stroke()
  }

  recenterOrigin () {
    return new Point(0, 0)
  }
}

class Triangle {
  constructor(app, gridPoint) {
    this.app = app
    this.ctx = this.app.ctx
    this.config = this.app.config.triangleConfig
    this.gridPoint = gridPoint

    this.accented = Math.random() < this.config.accentChance
    this.rotation = Math.random() * Math.PI
    this.fillOrigin = this.recenterOrigin()
    this.strokeOrigin = this.fillOrigin.tessellate()
  }

  fill () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.fillStyle = this.app.randomColor()
    this.ctx.lineWidth = this.config.lineWidth
    this.ctx.beginPath()
    this.ctx.moveTo(this.fillOrigin.x, this.fillOrigin.y)
    this.ctx.lineTo(this.fillOrigin.x + this.config.baseWidth, this.fillOrigin.y)
    this.ctx.lineTo(this.fillOrigin.x + this.config.baseWidth / 2, this.fillOrigin.y - this.config.baseWidth)
    this.ctx.fill()

    this.app.restoreContext()

    return this
  }

  stroke () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.strokeStyle = this.config.strokeStyle
    this.ctx.lineWidth = this.config.lineWidth
    this.accented ? this.strokeAccent() : this.strokeOutline()

    this.app.restoreContext()

    return this
  }

  strokeAccent () {
    this.ctx.beginPath()
    this.ctx.moveTo(this.strokeOrigin.x, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x + this.config.baseWidth, this.strokeOrigin.y)
    this.ctx.moveTo(this.strokeOrigin.x + (this.config.baseWidth * 1/8), this.strokeOrigin.y - (this.config.baseWidth * 1/4))
    this.ctx.lineTo(this.strokeOrigin.x + (this.config.baseWidth * 7/8), this.strokeOrigin.y - (this.config.baseWidth * 1/4))
    this.ctx.moveTo(this.strokeOrigin.x + (this.config.baseWidth * 1/4), this.strokeOrigin.y - (this.config.baseWidth * 1/2))
    this.ctx.lineTo(this.strokeOrigin.x + (this.config.baseWidth * 3/4), this.strokeOrigin.y - (this.config.baseWidth * 1/2))
    this.ctx.moveTo(this.strokeOrigin.x + (this.config.baseWidth * 3/8), this.strokeOrigin.y - (this.config.baseWidth * 3/4))
    this.ctx.lineTo(this.strokeOrigin.x + (this.config.baseWidth * 5/8), this.strokeOrigin.y - (this.config.baseWidth * 3/4))
    this.ctx.moveTo(this.strokeOrigin.x + (this.config.baseWidth * 15/32), this.strokeOrigin.y - (this.config.baseWidth * 15/16))
    this.ctx.closePath()
    this.ctx.stroke()
  }

  strokeOutline () {
    this.ctx.beginPath()
    this.ctx.moveTo(this.strokeOrigin.x, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x + this.config.baseWidth, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x + this.config.baseWidth / 2, this.strokeOrigin.y - this.config.baseWidth)
    this.ctx.closePath()
    this.ctx.stroke()
  }

  recenterOrigin () {
    const shift = this.config.baseWidth / 2
    return new Point(-shift, shift)
  }
}

class Squizzle {
  constructor (app, gridPoint) {
    this.app = app
    this.ctx = this.app.ctx
    this.config = this.app.config.squizzleConfig
    this.gridPoint = gridPoint

    this.accented = Math.random() < this.config.accentChance
    this.rotation = Math.random() * Math.PI
    this.fillOrigin = this.recenterOrigin()
    this.strokeOrigin = this.fillOrigin.tessellate()
  }

  fill () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.strokeStyle = this.app.randomColor()
    this.ctx.lineWidth = this.config.lineWidth

    this.ctx.beginPath()
    this.ctx.moveTo(this.fillOrigin.x, this.fillOrigin.y)
    this.ctx.lineTo(this.fillOrigin.x + 20, this.fillOrigin.y)
    this.ctx.lineTo(this.fillOrigin.x + 20, this.fillOrigin.y + 20)
    this.ctx.lineTo(this.fillOrigin.x + 40, this.fillOrigin.y + 20)
    this.ctx.lineTo(this.fillOrigin.x + 40, this.fillOrigin.y + 40)
    this.ctx.lineTo(this.fillOrigin.x + 60, this.fillOrigin.y + 40)
    this.ctx.lineTo(this.fillOrigin.x + 60, this.fillOrigin.y + 60)
    this.ctx.lineTo(this.fillOrigin.x + 80, this.fillOrigin.y + 60)
    this.ctx.stroke()
    this.ctx.closePath()

    this.app.restoreContext()

    return this
  }

  stroke () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.strokeStyle = this.config.strokeStyle
    this.ctx.lineWidth = this.config.lineWidth
    this.accented ? this.strokeAccent() : this.strokeOutline()

    this.app.restoreContext()

    return this
  }

  strokeAccent () {
    this.ctx.beginPath()
    this.ctx.moveTo(this.strokeOrigin.x, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x + 20, this.strokeOrigin.y)
    this.ctx.moveTo(this.strokeOrigin.x + 20, this.strokeOrigin.y + 20)
    this.ctx.lineTo(this.strokeOrigin.x + 40, this.strokeOrigin.y + 20)
    this.ctx.moveTo(this.strokeOrigin.x + 40, this.strokeOrigin.y + 40)
    this.ctx.lineTo(this.strokeOrigin.x + 60, this.strokeOrigin.y + 40)
    this.ctx.moveTo(this.strokeOrigin.x + 60, this.strokeOrigin.y + 60)
    this.ctx.lineTo(this.strokeOrigin.x + 80, this.strokeOrigin.y + 60)
    this.ctx.stroke()
    this.ctx.closePath()
  }

  strokeOutline () {
    this.ctx.beginPath()
    this.ctx.moveTo(this.strokeOrigin.x, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x + 20, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x + 20, this.strokeOrigin.y + 20)
    this.ctx.lineTo(this.strokeOrigin.x + 40, this.strokeOrigin.y + 20)
    this.ctx.lineTo(this.strokeOrigin.x + 40, this.strokeOrigin.y + 40)
    this.ctx.lineTo(this.strokeOrigin.x + 60, this.strokeOrigin.y + 40)
    this.ctx.lineTo(this.strokeOrigin.x + 60, this.strokeOrigin.y + 60)
    this.ctx.lineTo(this.strokeOrigin.x + 80, this.strokeOrigin.y + 60)
    this.ctx.stroke()
    this.ctx.closePath()
  }

  recenterOrigin () {
    return new Point(-this.config.shift, -this.config.shift)
  }
}

class Slats {
  constructor (app, gridPoint) {
    this.app = app
    this.ctx = this.app.ctx
    this.config = this.app.config.slatsConfig
    this.gridPoint = gridPoint

    this.accented = Math.random() < this.config.accentChance
    this.rotation = Math.random() * Math.PI
    this.fillOrigin = this.recenterOrigin()
    this.strokeOrigin = this.fillOrigin.tessellate()
  }

  fill () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.strokeStyle = this.app.randomColor()
    this.ctx.lineWidth = this.config.lineWidth

    this.ctx.beginPath()
    this.ctx.moveTo(this.fillOrigin.x, this.fillOrigin.y)
    this.ctx.lineTo(this.fillOrigin.x, this.fillOrigin.y + this.config.length)
    this.ctx.moveTo(this.fillOrigin.x + 15, this.fillOrigin.y + 8)
    this.ctx.lineTo(this.fillOrigin.x + 15, this.fillOrigin.y + this.config.length * 3/4 + 8)
    this.ctx.moveTo(this.fillOrigin.x - 15, this.fillOrigin.y + 16)
    this.ctx.lineTo(this.fillOrigin.x - 15, this.fillOrigin.y + this.config.length * 1/2 + 16)
    this.ctx.stroke()
    this.ctx.closePath()

    this.app.restoreContext()

    return this
  }

  stroke () {
    this.app.adjustContext(this.gridPoint, this.rotation)

    this.ctx.strokeStyle = this.config.strokeStyle
    this.ctx.lineWidth = this.config.lineWidth
    this.accented ? this.strokeAccent() : this.strokeOutline()

    this.app.restoreContext()

    return this
  }

  strokeAccent () {
    this.ctx.beginPath()
    this.ctx.moveTo(this.strokeOrigin.x, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x, this.strokeOrigin.y + this.config.length * 1/3)
    this.ctx.moveTo(this.strokeOrigin.x, this.strokeOrigin.y + this.config.length * 2/3)
    this.ctx.lineTo(this.strokeOrigin.x, this.strokeOrigin.y + this.config.length)
    this.ctx.moveTo(this.strokeOrigin.x + 15, this.strokeOrigin.y + 8)
    this.ctx.lineTo(this.strokeOrigin.x + 15, this.strokeOrigin.y + this.config.length * 3/4 + 8)
    this.ctx.moveTo(this.strokeOrigin.x - 15, this.strokeOrigin.y + 16)
    this.ctx.lineTo(this.strokeOrigin.x - 15, this.strokeOrigin.y + this.config.length * 1/2 + 16)
    this.ctx.stroke()
    this.ctx.closePath()
  }

  strokeOutline () {
    this.ctx.beginPath()
    this.ctx.moveTo(this.strokeOrigin.x, this.strokeOrigin.y)
    this.ctx.lineTo(this.strokeOrigin.x, this.strokeOrigin.y + this.config.length)
    this.ctx.moveTo(this.strokeOrigin.x + 15, this.strokeOrigin.y + 8)
    this.ctx.lineTo(this.strokeOrigin.x + 15, this.strokeOrigin.y + this.config.length * 3/4 + 8)
    this.ctx.moveTo(this.strokeOrigin.x - 15, this.strokeOrigin.y + 16)
    this.ctx.lineTo(this.strokeOrigin.x - 15, this.strokeOrigin.y + this.config.length * 1/2 + 16)
    this.ctx.stroke()
    this.ctx.closePath()
  }

  recenterOrigin () {
    return new Point(-this.config.length / 2, -this.config.length / 2)
  }
}

class MemphisApp {
  constructor (canvas, dpr, width, height, config = DEFAULT_CONFIG) {
    this.canvas = canvas
    this.dpr = dpr
    this.width = width
    this.height = height
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.ctx = this.canvas.getContext('2d')
    this.config = config
    this.grid = new Grid(width, height, this.config)
    this.ctx.fillStyle = '#FFFFFF'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.restoreContext()
  }

  generate () {
    this.grid.generatePoints()
      .map(point => this.shapeSelector(this, point))
      .map(shape => shape.fill())
      .map(shape => shape.stroke())
  }

  restoreContext () {
    this.ctx.setTransform(...RESET_MATRIX)
    this.ctx.scale(this.dpr, this.dpr)
  }

  adjustContext ({ x, y }, rotation) {
    this.ctx.translate(x, y)
    this.ctx.rotate(rotation)
  }

  randomColor () {
    const keys = Object.keys(PALETTE).filter(key => key !== 'black')
    const key = keys[Math.floor(Math.random() * keys.length)]
    return PALETTE[key]
  }

  shapeSelector (app, point) {
    let rando = Math.random()
    if (rando >= 0.7 ) {
      return new Square(app, point)
    } else if (rando >= 0.4) {
      return new Circle(app, point)
    } else if (rando >= 0.1) {
      return new Triangle(app, point)
    } else if (rando >= 0.05) {
      return new Squizzle(app, point)
    } else {
      return new Slats(app, point)
    }
  }
}
