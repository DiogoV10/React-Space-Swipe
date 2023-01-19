import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class TriangleSprite {
  constructor(x, y, gridSize, cellSize, triangleSize, color) {
      this.x = x;
      this.y = y;
      this.gridSize = gridSize;
      this.cellSize = cellSize;
      this.triangleSize = triangleSize;
      this.color = color;
  }

  draw(context) {
    context.strokeStyle = this.color;
    context.beginPath();
    context.moveTo(
        this.x * this.cellSize + this.cellSize / 2,
        this.y * this.cellSize + this.cellSize / 2 - this.triangleSize / 2
    );
    context.lineTo(
        this.x * this.cellSize + this.cellSize / 2 - this.triangleSize / 2,
        this.y * this.cellSize + this.cellSize / 2 + this.triangleSize / 2
    );
    context.lineTo(
        this.x * this.cellSize + this.cellSize / 2 + this.triangleSize / 2,
        this.y * this.cellSize + this.cellSize / 2 + this.triangleSize / 2
    );
    context.lineTo(
      this.x * this.cellSize + this.cellSize / 2,
      this.y * this.cellSize + this.cellSize / 2 - this.triangleSize / 2
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
    constructor(x, y, gridSize, cellSize, squareSize, color) {
      this.x = x;
      this.y = y;
      this.gridSize = gridSize;
      this.cellSize = cellSize;
      this.squareSize = squareSize;
      this.color = color;
    }
  
    draw(context) {
      context.strokeStyle = this.color;
      context.beginPath();
      context.strokeRect(
        this.x * this.cellSize + (this.cellSize - this.squareSize) / 2,
        this.y * this.cellSize + (this.cellSize - this.squareSize) / 2,
        this.squareSize,
        this.squareSize
      );
      context.stroke()
      context.closePath();
    }
  }
  
const squareSprites = [];

function drawsquareSprites(context) {
    squareSprites.forEach(function(sprite) {
        sprite.draw(context);
    });
}
  

class StarSprite {
  constructor(x, y, gridSize, cellSize, starSize, color) {
      this.x = x;
      this.y = y;
      this.gridSize = gridSize;
      this.cellSize = cellSize;
      this.starSize = starSize;
      this.color = color;
      this.angle = Math.PI / 5;
      this.ratio = 5 / 2;
      this.innerRadius = this.starSize / this.ratio;
  }

  draw(context) {
    context.strokeStyle = this.color;
    //Draw the star
    context.beginPath();
    context.moveTo(
      this.x * this.cellSize + this.cellSize / 2 + this.starSize * Math.cos(0 * 72 * Math.PI / 180 + Math.PI / 2),
      this.y * this.cellSize + this.cellSize / 2 + this.starSize * Math.sin(0 * 72 * Math.PI / 180 + Math.PI / 2)
    );
    for (let i = 0; i <= 4; i++) {
        context.lineTo(
            this.x * this.cellSize + this.cellSize / 2 + this.starSize * Math.cos(i * 72 * Math.PI / 180 + Math.PI / 2),
            this.y * this.cellSize + this.cellSize / 2 + this.starSize * Math.sin(i * 72 * Math.PI / 180 + Math.PI / 2)
        );
        context.lineTo(
            this.x * this.cellSize + this.cellSize / 2 + this.starSize / 2 * Math.cos(i * 72 * Math.PI / 180 + Math.PI / 2 + 36 * Math.PI / 180),
            this.y * this.cellSize + this.cellSize / 2 + this.starSize / 2 * Math.sin(i * 72 * Math.PI / 180 + Math.PI / 2 + 36 * Math.PI / 180)
        );
    }
    context.closePath();
    context.stroke();
    // Draw the pentagon
    context.beginPath();
    context.save();
    context.translate(
      this.x * this.cellSize + this.cellSize / 2,
      this.y * this.cellSize + this.cellSize / 2
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


class CircleSprite {
    constructor(x, y, gridSize, cellSize, circleSize, color) {
      this.x = x;
      this.y = y;
      this.gridSize = gridSize;
      this.cellSize = cellSize;
      this.circleSize = circleSize
      this.color = color;
    }
  
    draw(context) {
      context.strokeStyle = this.color;
      context.beginPath();
      context.arc(
        this.x * this.cellSize + this.cellSize / 2,
        this.y * this.cellSize + this.cellSize / 2,
        this.circleSize / 2,
        0,
        2 * Math.PI
      );
      context.stroke();
      context.closePath();
    }
  }
  

class CanvasWrapper extends React.Component {
    componentDidMount() {
      const canvas = document.getElementById("myCanvas");
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#ffffff";
      const gridSize = 10;
      const cellSize = canvas.width / gridSize;

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
      
      const circleSprite = new CircleSprite(3, 4, gridSize, cellSize, cellSize/2 * 1.5, "blue");
      circleSprite.draw(ctx);

      const starSprite = new StarSprite(1, 2, gridSize, cellSize, cellSize/3, "yellow");
      starSprite.draw(ctx);

      const color = "green"
      squareSprites.push(new SquareSprite(4, 4, gridSize, cellSize, cellSize/2 * 1.5, color));
      squareSprites.push(new SquareSprite(5, 6, gridSize, cellSize, cellSize/2 * 1.5, color));
      drawsquareSprites(ctx);

      const colorT = "red"
      triangleSprites.push(new TriangleSprite(6, 4, gridSize, cellSize, cellSize/3, colorT));
      triangleSprites.push(new TriangleSprite(1, 6, gridSize, cellSize, cellSize/3, colorT));
      drawTriangleSprites(ctx);
     
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