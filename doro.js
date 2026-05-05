document.documentElement.innerHTML = `
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="icon" href="data:,">
<title>Dorobuwu</title>
<style>
:root {
  font-size: 16px;
  background-color: #112;
}
body {
  background: transparent;
  margin: 0;
}
#drbAlchemy, #drbSparks {
  position: absolute;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: -1;
}
#drbSpriteStrip {
  display: none;
}

#drbTheme, #drbTheme2 {
  position: absolute;
  bottom: 0;
  right: 0;
  opacity: 0.5;
  z-index: 1000;
  color-scheme: dark;
  height: 1.5rem;
}

#drbPortrait {
  position: absolute;
  left: calc(50vw - 128px);
  top: calc(50vh - 128px);
}
#drbPortrait[silly]:hover {
  animation: shake 0.25s;
  animation-iteration-count: infinite;
  content: url("https://mistakenot4892.github.io/dorobouveryextremelygood1000hourportraitbestANGERY.png");
  filter:
    drop-shadow(0 0 8px black)
    drop-shadow(0 0 12px dodgerblue);
}
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  25% { transform: translate(-3px, 0px) rotate(1deg); }
  50% { transform: translate(1px, -1px) rotate(1deg); }
  75% { transform: translate(-3px, 1px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
</style>
</head>
<body>
<canvas id="drbSparks"></canvas>
<canvas id="drbAlchemy"></canvas>
<img id="drbSpriteStrip" src="https://mistakenot4892.github.io/dorosprite.png">
<img id="drbPortrait" src="https://mistakenot4892.github.io/dorobouveryextremelygood1000hourportraitbest.png">
<audio id="drbTheme" controls loop src="https://mistakenot4892.github.io/home_piano.ogg"></audio>
<audio id="drbTheme2" controls loop src="https://mistakenot4892.github.io/home_drop.ogg"></audio>
</body>
`

const enableSilly = true
const enableAutoplay = true
const spriteSize = 48 // pixels size of the (square) sprites on the strip
const initialVolume = 0.2 // we can't define this in html, so ...
const spinRate = 0.0005 // radians/frame

const { PI, min, max, sin, cos, round, random, abs, sign, floor } = Math
const clamp = (val, minVal, maxVal) => max(minVal, min(val, maxVal))
const TWO_PI = PI * 2
const PI_BY_TWO = PI / 2
const ctxAlchemy = drbAlchemy.getContext('2d')
const ctxSparks = drbSparks.getContext('2d')
const sprites = []

let //mutable module-globals? heresy...
  canvasWidth,
  canvasHeight,
  canvasCenterX,
  canvasCenterY,
  spriteCenterX, // offset by half spritePixelSize
  spriteCenterY,
  spriteCount, // determined by spritesheet.naturalWidth / spriteSize
  radiansPerSprite, // determined by spriteCount
  radius, // the scalar (0..1) size of the alchemy circle
  rotation = 0, // the current rotation, in -PI .. +PI
  isSilly,
  sillyScale = 0,
  sparks = []

if (enableSilly)
  drbPortrait.toggleAttribute('silly', true)

drbTheme2.style.display = 'none'
drbTheme.volume = initialVolume
if (enableAutoplay) {
  drbTheme.addEventListener('canplaythrough', () => {
    drbTheme.play()
  }, {once: true})
}

addEventListener('resize', event => {
  canvasWidth = window.innerWidth
  canvasHeight = window.innerHeight
  canvasCenterX = canvasWidth * 0.5
  spriteCenterX = canvasCenterX - spriteSize * 0.5
  canvasCenterY = canvasHeight * 0.5
  spriteCenterY = canvasCenterY - spriteSize * 0.5
  radius = min(canvasWidth, canvasHeight) * 0.4
  drbAlchemy.width = canvasWidth
  drbAlchemy.height = canvasHeight
  drbSparks.width = canvasWidth
  drbSparks.height = canvasHeight
  ctxAlchemy.clearRect(0, 0, canvasWidth, canvasHeight)
  ctxSparks.clearRect(0, 0, canvasWidth, canvasHeight)
})
dispatchEvent(new Event('resize'))


drbSpriteStrip.addEventListener('load', async () => {
  const count = Math.floor(drbSpriteStrip.naturalWidth / spriteSize)
  const promises = []
  for (let i = 0; i < count; ++i)
    promises[i] = createImageBitmap(drbSpriteStrip, spriteSize * i, 0, spriteSize, spriteSize)
  sprites.push(... await Promise.all(promises))
  spriteCount = sprites.length
  radiansPerSprite = TWO_PI / spriteCount
})

const drawAlchemyCircle = (cx, cy, radius, strokeStyle, strokeWidth) => {
  ctxAlchemy.strokeStyle = strokeStyle
  ctxAlchemy.lineWidth = strokeWidth
  ctxAlchemy.beginPath()
  ctxAlchemy.ellipse(cx, cy, radius, radius, 0, 0, TWO_PI, false)
  ctxAlchemy.stroke()
}

requestAnimationFrame(function frame() {
  requestAnimationFrame(frame)
  if (!sprites.length)
    return
  ctxAlchemy.clearRect(0, 0, canvasWidth, canvasHeight)
  drawAlchemyCircle(canvasCenterX, canvasCenterY, radius + 12, `rgb(192 192 192 / 0.25)`, 8)
  drawAlchemyCircle(canvasCenterX, canvasCenterY, radius - 2, `rgb(128 128 128 / 0.25)`, 4)
  const sparkIndex = floor(random() * spriteCount)
  for (let i = 0; i < spriteCount; ++i) {
    if ((rotation += radiansPerSprite) > PI)
      rotation -= TWO_PI
    const dx = cos(rotation) * radius
    const dy = sin(rotation) * radius
    ctxAlchemy.drawImage(sprites[i], spriteCenterX + dx, spriteCenterY + dy)
    if (!enableSilly || i !== sparkIndex || sillyScale < 0.25)
      continue
    sparks.push({
      x: canvasCenterX + dx,
      y: canvasCenterY + dy,
      rotation: rotation + (PI / 2) * sillyScale,
      speed: sillyScale,
      hue: round(200 + random() * 30),
      lifespan: 300
    })
  }
  rotation += spinRate + sillyScale * 0.04
  if (rotation > PI)
    rotation -= TWO_PI
  if (!enableSilly)
    return
  ctxSparks.fillStyle = '#11112220'
  ctxSparks.fillRect(0, 0, canvasWidth, canvasHeight)
  let newSparks = []
  for (const spark of sparks) {
    if (--spark.lifespan < 1)
      continue
    ctxSparks.fillStyle = `hsl(${spark.hue} 90 60 / ${min(spark.lifespan * 0.5, 100)}%)`
    ctxSparks.beginPath()
    ctxSparks.arc(spark.x, spark.y, 2, 0, TWO_PI)
    ctxSparks.fill()
    spark.x += cos(spark.rotation) * spark.speed * 6
    spark.y += sin(spark.rotation) * spark.speed * 6
    if (spark.x > canvasWidth * 1.2 || spark.x < -canvasWidth * 0.2)
      continue
    if (spark.y > canvasHeight * 1.2 || spark.y < -canvasHeight * 0.2)
      continue
    spark.rotation += 0.03 * spark.speed
    newSparks.push(spark)
  }
  sparks.length = 0
  sparks = newSparks
  if (!isSilly)
    sillyScale *= 0.95
  else if ((sillyScale += 0.005) > 1)
    sillyScale = 1
})

if (enableSilly) {
  drbPortrait.addEventListener('mouseenter', () => {
    drbTheme2.style.display = 'inherit'
    drbTheme.style.display = 'none'
    drbTheme2.volume = drbTheme.volume
    drbTheme.pause()
    drbTheme2.play()
    document.title = 'DorobOwO'
    isSilly = true
  })
  drbPortrait.addEventListener('mouseleave', () => {
    drbTheme.style.display = 'inherit'
    drbTheme2.style.display = 'none'
    drbTheme.volume = drbTheme2.volume
    drbTheme2.pause()
    drbTheme.play()
    document.title = 'Dorobuwu'
    isSilly = false
  })
}
