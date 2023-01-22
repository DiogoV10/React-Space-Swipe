import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

let Decimal = require("decimal.js");


let canvas = document.getElementById("myCanvas");
let ctx = null;

let restart = document.getElementById('restartButton')

let gridSize = 10;
let cellSize = null;

let direction = "none"
let isMoving = false
let threshold = 10; // minimum distance to move before registering as a move

let initialXTouch;
let initialYTouch;

let initialXMouse;
let initialYMouse;

let score = 0;
let currentscore = 0;


let buttonClickSound = new sound("buttonClick.wav")
buttonClickSound.volume(0.1)
let collectingSound = new sound("ball_collect.wav")
collectingSound.volume(0.1)
let collectingSound2 = new sound("ball_collect2.wav")
collectingSound2.volume(0.1)
let bgMusic = new sound("bgMusic.wav")
bgMusic.volume(0.1)
bgMusic.loop()

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
  this.volume = function(vol){
      this.sound.volume = vol;
  }
  this.loop = function(){
      this.sound.loop = true;
  }
}



var fileText
    
const file = 'levels.txt'

function readFile(file){
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function ()
  {
      let filePromise = new Promise(function(myResolve, myReject){
          let fP = 0

          if(rawFile.readyState === 4)
          {
              if(rawFile.status === 200 || rawFile.status == 0)
              {
                  fP = 1
                  fileText = rawFile.responseText;
              }
          }

          if(fP == 1){
              myResolve('Levels loaded...')
          }else{
              myReject('Waiting for Levels File...')
          }
      })

      filePromise.then(
          function(value) {console.log(value);},
          function(error) {console.log(error);}
      )
  }
  rawFile.send(null);
}

readFile(file)

let levels = []
let levelNumber = 1
let levelsCount = 0

function changeLevel(){
  levels.length = 0

  let myArray = fileText.split("{")
  levelsCount = myArray.length - 1
  if(levelNumber > levelsCount){
    levelNumber = 1
    changeLevel()
  }else{
    let text = myArray[levelNumber]
    let myArray2 = text.split("}")
    let text2 = myArray2[0]
    let myArray3 = text2.split("\r\n")

    for(let i = 1; i <= 10; i++){

      let text3 = myArray3[i]
      let myArray4 = text3.split(";")

      for(let j = 0; j < 10; j++){
          levels.push(myArray4[j])
      }
    }
  }
}

changeLevel()



class TriangleSprite {
  constructor(x, y, triangleSize, color, movement) {
      this.x = x * cellSize + cellSize / 2;
      this.y = y * cellSize + cellSize / 2;
      this.triangleSize = triangleSize;
      this.color = color;
      this.hide = false;
      this.movement = movement;
      this.speed = 1
  }

  draw(context) {
    context.lineWidth = 2;
    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(
        this.x,
        this.y - this.triangleSize / 2
    );
    context.lineTo(
        this.x - this.triangleSize / 2,
        this.y + this.triangleSize / 2
    );
    context.lineTo(
        this.x + this.triangleSize / 2,
        this.y + this.triangleSize / 2
    );
    context.lineTo(
      this.x,
      this.y - this.triangleSize / 2
    );
    context.stroke();
    context.closePath();
  }

  update() {
    if (!this.hide){
      this.draw(ctx)

      this.move()
  
      this.grid()
  
      this.collision()
    }
  }

  move() {
    if (this.movement == 'Right'){
      this.x += this.speed
    }
    if (this.movement == 'Left'){
      this.x -= this.speed
    }
    if (this.movement == 'Up'){
      this.y -= this.speed
    }
    if (this.movement == 'Down'){
      this.y += this.speed
    }
  }

  grid() {
    let hasSquare = false
    //check for collision with edges of grid
    if (this.x + this.triangleSize / 2 > gridSize * cellSize && this.movement == 'Right') {
      hasSquare = squareInGridSquare(0 + cellSize, this.y)
      if (hasSquare){
        this.x = gridSize * cellSize - cellSize / 2
        this.movement = 'Left'
      }else{
        this.x = 0
      }
    }else if (this.x - this.triangleSize / 2 < 0 && this.movement == 'Left'){
      hasSquare = squareInGridSquare(gridSize * cellSize, this.y)
      if (hasSquare){
        this.x = 0 + cellSize / 2
        this.movement = 'Right'
      }else{
        this.x = gridSize * cellSize
      }
    }
    if (this.y + this.triangleSize / 2 > gridSize * cellSize && this.movement == 'Down'){
      hasSquare = squareInGridSquare(this.x, 0 + cellSize)
      if (hasSquare){
        this.y = gridSize * cellSize - cellSize / 2
        this.movement = 'Up'
      }else{
        this.y = 0
      }
    }else if (this.y - this.triangleSize / 2 < 0 && this.movement == 'Up') {
      hasSquare = squareInGridSquare(this.x, gridSize * cellSize)
      if (hasSquare){
        this.y = 0 + cellSize / 2
        this.movement = 'Down'
      }else{
        this.y = gridSize * cellSize
      }
    }
  }

  collision() {
    let hasSquare = false
    if (this.movement == 'Right'){
      hasSquare = squareInGridSquare(this.x + this.triangleSize/2, this.y)
      if (hasSquare){
        this.movement = 'Left'
      }
    }
    if (this.movement == 'Left'){
      hasSquare = squareInGridSquare(this.x, this.y)
      if (hasSquare){
        this.movement = 'Right'
      }
    }
    if (this.movement == 'Up'){
      hasSquare = squareInGridSquare(this.x, this.y)
      if (hasSquare){
        this.movement = 'Down'
      }
    }
    if (this.movement == 'Down'){
      hasSquare = squareInGridSquare(this.x, this.y + this.triangleSize/2)
      if (hasSquare){
        this.movement = 'Up'
      }
      
    }
  }
}

const triangleSprites = [];

function updateTriangleSprites() {
  triangleSprites.forEach(function(triangleSprite) {
      triangleSprite.update();
  });
}



class SquareSprite {
    constructor(x, y, squareSize, color) {
      this.x = x * cellSize + (cellSize - squareSize) / 2;
      this.y = y * cellSize + (cellSize - squareSize) / 2;
      this.squareSize = squareSize;
      this.color = color;
    }
  
    draw(context) {
      context.lineWidth = 4;
      context.strokeStyle = this.color;
      context.beginPath();
      context.strokeRect(
        this.x,
        this.y,
        this.squareSize,
        this.squareSize
      );
      context.stroke()
      context.closePath();
    }
}
  
const squareSprites = [];

function drawSquareSprites(context) {
    squareSprites.forEach(function(sprite) {
        sprite.draw(context);
    });
}
  


class StarSprite {
  constructor(x, y, starSize, color) {
      this.x = x * cellSize + cellSize / 2;
      this.y = y * cellSize + cellSize / 2;
      this.starSize = starSize;
      this.initialStarSize = starSize;
      this.isTotalSize = false
      this.growthSpeed = 0.1
      this.color = color;
      this.hide = true;
  }

  draw(context) {
    context.lineWidth = 2;
    context.strokeStyle = this.color;
    //Draw the star
    context.beginPath();
    context.moveTo(
      this.x + this.starSize * Math.cos(0 * 72 * Math.PI / 180 + Math.PI / 2),
      this.y + this.starSize * Math.sin(0 * 72 * Math.PI / 180 + Math.PI / 2)
    );
    for (let i = 0; i <= 4; i++) {
        context.lineTo(
            this.x + this.starSize * Math.cos(i * 72 * Math.PI / 180 + Math.PI / 2),
            this.y + this.starSize * Math.sin(i * 72 * Math.PI / 180 + Math.PI / 2)
        );
        context.lineTo(
            this.x + this.starSize / 2 * Math.cos(i * 72 * Math.PI / 180 + Math.PI / 2 + 36 * Math.PI / 180),
            this.y + this.starSize / 2 * Math.sin(i * 72 * Math.PI / 180 + Math.PI / 2 + 36 * Math.PI / 180)
        );
    }
    context.closePath();
    context.stroke();
    // Draw the pentagon
    context.beginPath();
    context.save();
    context.translate(
      this.x,
      this.y
    );
    context.rotate(55 * Math.PI / 180);
    for (let i = 0; i <= 4; i++) {
      context.lineTo(
          this.starSize / 2 * Math.cos(i * 72 * Math.PI / 180),
          this.starSize / 2 * Math.sin(i * 72 * Math.PI / 180)
      );
    }
    context.closePath();
    context.stroke();
    context.restore();
  }

  update() {
    if (!this.hide){
      this.draw(ctx)

      if (this.starSize == cellSize/2){
        this.isTotalSize = true
      }
      if (this.starSize == this.initialStarSize){
        this.isTotalSize = false
      }
  
      if (this.isTotalSize){
        this.starSize = new Decimal(this.starSize).sub(this.growthSpeed).toNumber()
      }else{
        this.starSize = new Decimal(this.starSize).add(this.growthSpeed).toNumber()
      }
    }
  }
}

let starSprite = null



function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function starInGridSquare(x, y) {
  if (!starSprite.hide){
    if (starSprite.x < x + cellSize / 2 && starSprite.x > x - cellSize / 2){
      if (starSprite.y < y + cellSize / 2 && starSprite.y > y - cellSize / 2){
        return true
      }
    }
  }
  return false
}

function squareInGridSquare(x, y) {
  for (let s of squareSprites){
    if (s.x < x && s.x > x - cellSize){
      if (s.y < y && s.y > y - cellSize){
        return true
      }
    }
  }
  return false
}

class CircleSprite {
    constructor(x, y, circleSize, color) {
      this.x = x * cellSize + cellSize / 2;
      this.y = y * cellSize + cellSize / 2;
      this.circleSize = circleSize
      this.color = color;
      this.speed = 4;
    }
  
    draw(context) {
      context.lineWidth = 2;
      context.strokeStyle = this.color;
      context.beginPath();
      context.arc(
        this.x,
        this.y,
        this.circleSize / 2,
        0,
        2 * Math.PI
      );
      context.stroke();
      context.closePath();
    }

    update() {
      this.draw(ctx)

      if (isMoving)
        this.move()
      
      this.grid()

      this.squareCollision()

      this.triangleCollision()

      this.starCollision()
    }

    grid() {
      let hasSquare = false
      //check for collision with edges of grid
      if (this.x + this.circleSize / 2 > gridSize * cellSize && direction == 'Right') {
        hasSquare = squareInGridSquare(0 + cellSize, this.y)
        if (hasSquare){
          this.x = gridSize * cellSize - cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.x = 0
        }
      }else if (this.x - this.circleSize / 2 < 0 && direction == 'Left'){
        hasSquare = squareInGridSquare(gridSize * cellSize, this.y)
        if (hasSquare){
          this.x = 0 + cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.x = gridSize * cellSize
        }
      }
      if (this.y + this.circleSize / 2 > gridSize * cellSize && direction == 'Down'){
        hasSquare = squareInGridSquare(this.x, 0 + cellSize)
        if (hasSquare){
          this.y = gridSize * cellSize - cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.y = 0
        }
      }else if (this.y - this.circleSize / 2 < 0 && direction == 'Up') {
        hasSquare = squareInGridSquare(this.x, gridSize * cellSize)
        if (hasSquare){
          this.y = 0 + cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.y = gridSize * cellSize
        }
      }
    }

    squareCollision() {
      let hasSquare = false
      if (direction == 'Right'){
        hasSquare = squareInGridSquare(this.x + this.circleSize/2, this.y)
        if (hasSquare){
          let pos = Math.floor(this.x / cellSize)
          this.x = pos * cellSize + cellSize / 2;
          isMoving = false
          direction = 'none'
        }
      }
      if (direction == 'Left'){
        hasSquare = squareInGridSquare(this.x - this.circleSize/4, this.y)
        if (hasSquare){
          let pos = Math.floor(this.x / cellSize)
          this.x = pos * cellSize + cellSize / 2;
          isMoving = false
          direction = 'none'
        }
      }
      if (direction == 'Up'){
        hasSquare = squareInGridSquare(this.x, this.y - this.circleSize/4)
        if (hasSquare){
          let pos = Math.floor(this.y / cellSize)
          this.y = pos * cellSize + cellSize / 2;
          isMoving = false
          direction = 'none'
        }
      }
      if (direction == 'Down'){
        hasSquare = squareInGridSquare(this.x, this.y + this.circleSize/2)
        if (hasSquare){
          let pos = Math.floor(this.y / cellSize)
          this.y = pos * cellSize + cellSize / 2;
          isMoving = false
          direction = 'none'
        }
      }
    }

    triangleCollision() {
      for (let t of triangleSprites) {
        if (!t.hide) {
          let dist = distance(this.x, this.y, t.x, t.y);
          let radiusSum = (this.circleSize / 2) + (t.triangleSize / 2);
          if (dist <= radiusSum) {
            t.hide = true;
            currentscore++;
            collectingSound.play()
            collectingSound2.play()
            if (currentscore == triangleSprites.length){
              starSprite.hide = false;
            }
          }
        }
      }
    }

    starCollision() {
      let hasStar = false;
      hasStar = starInGridSquare(this.x, this.y);

      if (hasStar){
        score += currentscore + 2;
        levelNumber++;
        changeLevel();
        loadLevel();
      }
    }

    move() {
      switch(direction) {
        case "Left":
          this.x -= this.speed;
          break;
        case "Right":
          this.x += this.speed;
          break;
        case "Up":
          this.y -= this.speed;
          break;
        case "Down":
          this.y += this.speed;
          break;
      }
    }
}
  
let circleSprite = null



function randomLightColor() {
  const hexValues = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += hexValues[Math.floor(Math.random() * 16)];
  }
  return color;
}

function loadLevel() {
  circleSprite = null;
  starSprite = null;
  squareSprites.length = 0;
  triangleSprites.length = 0;
  currentscore = 0;
  isMoving = false;
  direction = 'none';

  ctx.lineWidth = 1;
  
  for (let i = 0; i < levels.length; i++){
    let number = i;
    let firstDigit = number % 10;
    let secondDigit = Math.floor(number / 10);

    if (levels[i] == '1'){
      const color = randomLightColor()
      squareSprites.push(new SquareSprite(firstDigit, secondDigit, cellSize/2 * 1.5, color));
    }

    if (levels[i] == '2'){
      circleSprite = new CircleSprite(firstDigit, secondDigit, cellSize/2 * 1.5, "blue");
    }

    if (levels[i] == '3'){
      triangleSprites.push(new TriangleSprite(firstDigit, secondDigit, cellSize/3, 'red', 'none'));
    }

    if (levels[i] == '30'){
      triangleSprites.push(new TriangleSprite(firstDigit, secondDigit, cellSize/3, 'red', 'Right'));
    }

    if (levels[i] == '31'){
      triangleSprites.push(new TriangleSprite(firstDigit, secondDigit, cellSize/3, 'red', 'Left'));
    }

    if (levels[i] == '32'){
      triangleSprites.push(new TriangleSprite(firstDigit, secondDigit, cellSize/3, 'red', 'Up'));
    }

    if (levels[i] == '33'){
      triangleSprites.push(new TriangleSprite(firstDigit, secondDigit, cellSize/3, 'red', 'Down'));
    }

    if (levels[i] == '4'){
      starSprite = new StarSprite(firstDigit, secondDigit, Math.floor(cellSize/10), "yellow");
    }
  }


}

class CanvasWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    restart = document.getElementById('restartButton')
    ctx.strokeStyle = "#ffffff";
    cellSize = canvas.width / gridSize;
    
    loadLevel()
  }

  render() {
    return (
      <div id="container">
        <canvas id="myCanvas" width="700" height="700"></canvas>
        <button id="restartButton">Restart</button>
        <p id="score">Score:</p>
      </div>
    );
  }
}


ReactDOM.render(<CanvasWrapper />, document.getElementById('root'));
  


restart.addEventListener('click', function changeMode() {
  buttonClickSound.play()
  loadLevel()
})


document.addEventListener("keydown", (event) => {
  if (!isMoving){
    if (event.key === "w") {
      // player moved up
      direction = "Up"
    } else if (event.key === "a") {
      // player moved left
      direction = "Left"
    } else if (event.key === "s") {
      // player moved down
      direction = "Down"
    } else if (event.key === "d") {
      // player moved right
      direction = "Right"
    }
  }
  
  if(direction != "none")
    isMoving = true
});


document.addEventListener("touchstart", (event) => {
  initialXTouch = event.touches[0].clientX;
  initialYTouch = event.touches[0].clientY;
});

document.addEventListener("touchmove", (event) => {
  if (initialXTouch && initialYTouch && !isMoving) {
    const currentX = event.clientX;
    const currentY = event.clientY;
    const deltaX = currentX - initialXTouch;
    const deltaY = currentY - initialYTouch;

    // check if player has moved more in the x direction than the y direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) {
            // player moved right
            direction = "Right"
        } else if (deltaX < -threshold) {
            // player moved left
            direction = "Left"
        }
    } else {
        if (deltaY > threshold) {
            // player moved down
            direction = "Down"
        } else if (deltaY < -threshold) {
            // player moved up
            direction = "Up"
        }
    }
  }
});

document.addEventListener("touchend", (event) => {
  initialXTouch = null;
  initialYTouch = null;

  if(direction != "none")
    isMoving = true

});


document.addEventListener("mousedown", (event) => {
  initialXMouse = event.clientX;
  initialYMouse = event.clientY;
});

document.addEventListener("mousemove", (event) => {
  if (initialXMouse && initialYMouse && !isMoving) {
    const currentX = event.clientX;
    const currentY = event.clientY;
    const deltaX = currentX - initialXMouse;
    const deltaY = currentY - initialYMouse;

    // check if player has moved more in the x direction than the y direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold) {
            // player moved right
            direction = "Right"
        } else if (deltaX < -threshold) {
            // player moved left
            direction = "Left"
        }
    } else {
        if (deltaY > threshold) {
            // player moved down
            direction = "Down"
        } else if (deltaY < -threshold) {
            // player moved up
            direction = "Up"
        }
    }
  }
});

document.addEventListener("mouseup", (event) => {
  initialXMouse = null;
  initialYMouse = null;
 
  
  if(direction != "none")
    isMoving = true
});

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gridSize = 10;
    cellSize = canvas.width / gridSize;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    bgMusic.play()

    // for (let i = 0; i <= gridSize; i++) {
    //   ctx.moveTo(i * cellSize, 0);
    //   ctx.lineTo(i * cellSize, canvas.height);
    //   ctx.stroke();
    // }

    // for (let i = 0; i <= gridSize; i++) {
    //   ctx.moveTo(0, i * cellSize);
    //   ctx.lineTo(canvas.width, i * cellSize);
    //   ctx.stroke();
    // }

    circleSprite.update()

    starSprite.update()

    updateTriangleSprites();

    drawSquareSprites(ctx);

    document.getElementById("score").innerHTML = "Score: " + score;
}, 1)