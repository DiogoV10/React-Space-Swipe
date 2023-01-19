import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class SquareSprite {
    constructor(x, y, gridSize, cellSize, squareSize) {
      this.x = x;
      this.y = y;
      this.gridSize = gridSize;
      this.cellSize = cellSize;
      this.squareSize = squareSize;
    }
  
    draw(context) {
      context.fillRect(
        this.x * this.cellSize + this.cellSize / 2,
        this.y * this.cellSize + this.cellSize / 2,
        this.squareSize,
        this.squareSize
      );
    }
  }
  
  const sprites = [];
  
  function drawSprites(context) {
      sprites.forEach(function(sprite) {
          sprite.draw(context);
      });
  }
  

class CircleSprite {
    constructor(x, y, gridSize, cellSize) {
      this.x = x;
      this.y = y;
      this.gridSize = gridSize;
      this.cellSize = cellSize;
    }
  
    draw(context) {
      context.beginPath();
      context.arc(
        this.x * this.cellSize + this.cellSize / 2,
        this.y * this.cellSize + this.cellSize / 2,
        this.cellSize / 2,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }
  

class CanvasWrapper extends React.Component {
    componentDidMount() {
      const canvas = document.getElementById("myCanvas");
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#ffffff";
      const gridSize = 10;
      const cellSize = canvas.width / gridSize;

      
      const circleSprite = new CircleSprite(3, 4, gridSize, cellSize);
      circleSprite.draw(ctx);

      sprites.push(new SquareSprite(3, 4, gridSize, cellSize, 10));
      sprites.push(new SquareSprite(5, 6, gridSize, cellSize, 10));
      drawSprites(ctx);

      
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