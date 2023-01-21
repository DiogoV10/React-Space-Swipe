import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


let canvas = document.getElementById("myCanvas");
let ctx = null;

let gridSize = 10;
let cellSize = null;

let direction = "none"
let isMoving = false
let threshold = 10; // minimum distance to move before registering as a move

let initialXTouch;
let initialYTouch;

let initialXMouse;
let initialYMouse;


var fileText
    
const file = './levels.txt'

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

function changeLevel(levelNumber){
  levels.length = 0

  let myArray = fileText.split("{")

  levelsCount = myArray.length - 1

  if(levelNumber > levelsCount){
    levelNumber = 1
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

changeLevel(levelNumber)



class TriangleSprite {
  constructor(x, y, triangleSize, color) {
      this.x = x * cellSize + cellSize / 2;
      this.y = y * cellSize + cellSize / 2;
      this.triangleSize = triangleSize;
      this.color = color;
  }

  draw(context) {
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
}

const triangleSprites = [];

function drawTriangleSprites(context) {
    triangleSprites.forEach(function(triangleSprite) {
        triangleSprite.draw(context);
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
      this.color = color;
  }

  draw(context) {
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
}

let starSprite = null


function findSquare(x, y) {
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
      this.speed = 1;
    }
  
    draw(context) {
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

    updateDraw(context){
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
      if (isMoving)
        this.move()
      
      this.grid()
    }

    grid() {
      let hasSquare = false
      //check for collision with edges of grid
      if (this.x + this.circleSize / 2 > gridSize * cellSize && direction == 'Right') {
        hasSquare = findSquare(0 + cellSize, this.y)
        if (hasSquare){
          this.x = gridSize * cellSize - cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.x = 0
        }
      }else if (this.x - this.circleSize / 2 < 0 && direction == 'Left'){
        hasSquare = findSquare(gridSize * cellSize, this.y)
        if (hasSquare){
          this.x = 0 + cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.x = gridSize * cellSize
        }
      }
      if (this.y + this.circleSize / 2 > gridSize * cellSize && direction == 'Down'){
        hasSquare = findSquare(this.x, 0 + cellSize)
        if (hasSquare){
          this.y = gridSize * cellSize - cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.y = 0
        }
      }else if (this.y - this.circleSize / 2 < 0 && direction == 'Up') {
        hasSquare = findSquare(this.x, gridSize * cellSize)
        if (hasSquare){
          this.y = 0 + cellSize / 2
          isMoving = false
          direction = 'none'
        }else{
          this.y = gridSize * cellSize
        }
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

class CanvasWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidMount() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#ffffff";
    cellSize = canvas.width / gridSize;

    for (let i = 0; i <= gridSize; i++) {
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i <= gridSize; i++) {
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }
    
    circleSprite = new CircleSprite(3, 4, cellSize/2 * 1.5, "blue");
    circleSprite.draw(ctx);

    starSprite = new StarSprite(1, 2, cellSize/3, "yellow");
    starSprite.draw(ctx);

    const colorT = "red"
    triangleSprites.push(new TriangleSprite(6, 4, cellSize/3, colorT));
    triangleSprites.push(new TriangleSprite(1, 6, cellSize/3, colorT));
    drawTriangleSprites(ctx);

    const color = "green"
    squareSprites.push(new SquareSprite(4, 4, cellSize/2 * 1.5, color));
    squareSprites.push(new SquareSprite(5, 6, cellSize/2 * 1.5, color));
    squareSprites.push(new SquareSprite(3, 0, cellSize/2 * 1.5, color));
    drawSquareSprites(ctx);
    
  }

  render() {
    return (
      <div id="container">
        <canvas id="myCanvas" width="700" height="700"></canvas>
        <button id="restartButton">Restart</button>
      </div>
    );
  }
}


ReactDOM.render(<CanvasWrapper />, document.getElementById('root'));
  

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


    const gridSize = 10;
    const cellSize = canvas.width / gridSize;

    ctx.strokeStyle = "#ffffff";

    for (let i = 0; i <= gridSize; i++) {
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i <= gridSize; i++) {
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    circleSprite.update()
    circleSprite.updateDraw(ctx)

    starSprite.draw(ctx)

    drawTriangleSprites(ctx);

    drawSquareSprites(ctx);

    
},1)