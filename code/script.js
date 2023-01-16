// Get a reference to the canvas element
var canvas = document.getElementById('myCanvas');

// Get the width and height of the canvas
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;

// Get a reference to the drawing context
var ctx = canvas.getContext('2d');

// Set the line width
ctx.lineWidth = 1;

// Set the stroke style
ctx.strokeStyle = 'white';

// Calculate the number of rows and columns in the grid
var numRows = 10;
var numCols = 10;

// Calculate the size of each square in the grid
var squareWidth = canvasWidth / numCols;
var squareHeight = canvasHeight / numRows;

// Array to store the collidable squares
var collidableSquares = [];

// Generate a random number of collidable squares between 5 and 10
var numCollidableSquares = Math.floor(Math.random() * 6) + 5;

for (var i = 0; i < numCollidableSquares; i++) {
    // Generate random row and column indices for the collidable square
    var row = Math.floor(Math.random() * numRows);
    var col = Math.floor(Math.random() * numCols);

    // Add the collidable square to the array
    collidableSquares.push({ row: row, col: col });
}

// Draw the grid
drawGrid();

// Initial position of the circle
var initialCircleRow;
var initialCircleCol;

// Generate random row and column indices for the initial position of the circle
do {
    initialCircleRow = Math.floor(Math.random() * numRows);
    initialCircleCol = Math.floor(Math.random() * numCols);

    // Check if the current grid square is a collidable square
    var collidableSquaresInCurrentSquare = collidableSquares.filter(function (square) {
        return square.row === initialCircleRow && square.col === initialCircleCol;
    });

    // Set isCollidable to true if there is at least one collidable square in the current grid square, otherwise set it to false
    var isCollidable = collidableSquaresInCurrentSquare.length > 0;
} while (isCollidable);

// Set the circle's initial position to the randomly generated position
var circleRow = initialCircleRow;
var circleCol = initialCircleCol;

// Draw the circle at the initial position
drawCircle(circleRow, circleCol);


function drawGrid() {
    // Draw the grid
    for (var i = 0; i < numRows; i++) {
        for (var j = 0; j < numCols; j++) {
            // Check if the current grid square is a collidable square
            var collidableSquaresInCurrentSquare = collidableSquares.filter(function (square) {
                return square.row === i && square.col === j;
            });
    
            // Set isCollidable to true if there is at least one collidable square in the current grid square, otherwise set it to false
            var isCollidable = collidableSquaresInCurrentSquare.length > 0;
    
            // Set the stroke style to red if the square is collidable, otherwise set it to black
            ctx.strokeStyle = isCollidable ? "red" : "black";
    
            // Draw the grid square
            ctx.strokeRect(j * squareWidth, i * squareHeight, squareWidth, squareHeight);
        }
    }
}


function drawCircle(row, col) {
    // Set the fill style
    ctx.fillStyle = "red"; /* Set the fill color to red */
  
    // Calculate the x and y coordinates of the top left corner of the grid square
    var x = col * squareWidth;
    var y = row * squareHeight;
  
    // Calculate the maximum radius that will fit inside the grid square
    var maxRadius = Math.min(squareWidth, squareHeight) / 2;
  
    // Set the radius to the maximum allowed radius
    var radius = maxRadius;
  
    // Check if the current grid square is a collidable square
    var collidableSquaresInCurrentSquare = collidableSquares.filter(function (square) {
        return square.row === row && square.col === col;
    });
  
    // If there are no collidable squares in the current grid square, reset the canvas by clearing the drawing surface and redrawing the grid, then draw the circle at its new position
    if (collidableSquaresInCurrentSquare.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
    }
  
    // Draw the circle
    ctx.beginPath();
    ctx.arc(x + squareWidth / 2, y + squareHeight / 2, radius, 0, 2 * Math.PI);
    ctx.fill();
}



// Number of small circles to generate
var numSmallCircles = 5;

// Array to store the small circles
var initialSmallCircles = [];

// Array to store the small circles
var smallCircles = [];

// Generate the small circles
for (var i = 0; i < numSmallCircles; i++) {
    // Generate a random row and column index for the small circle
    var smallCircleRow = Math.floor(Math.random() * numRows);
    var smallCircleCol = Math.floor(Math.random() * numCols);

    // Check if the small circle overlaps with a collidable square or the red circle
    var collidableOverlap = collidableSquares.some(function (square) {
        return square.row === smallCircleRow && square.col === smallCircleCol;
    });
    var circleOverlap = (smallCircleRow === circleRow && smallCircleCol === circleCol);

    // If the small circle does not overlap with a collidable square or the red circle, add it to the array
    if (!collidableOverlap && !circleOverlap) {
        initialSmallCircles.push({row: smallCircleRow, col: smallCircleCol});
    }

    smallCircles = initialSmallCircles;
}


// Function to draw the small circles
function drawSmallCircles() {
    // Set the fill style
    ctx.fillStyle = "blue";

    // Draw the small circles
    smallCircles.forEach(function (smallCircle) {
        // Calculate the x and y coordinates of the top left corner of the grid square
        var x = smallCircle.col * squareWidth;
        var y = smallCircle.row * squareHeight;

        // Calculate the maximum radius that will fit inside the grid square
        var maxRadius = Math.min(squareWidth, squareHeight) / 4;

        // Set the radius to the maximum allowed radius
        var radius = maxRadius;

        // Draw the small circle
        ctx.beginPath();
        ctx.arc(x + squareWidth / 2, y + squareHeight / 2, radius, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Draw the small circles
drawSmallCircles();


const intervalTime = 100; // Update the position of the circle every 100 milliseconds

let currentDirection = null;

let isMoving = false; // flag variable to track whether the circle is currently moving or not

// Update the event listener for keydown to check if the circle is colliding with a small circle
document.addEventListener("keydown", (event) => {
    // Get the key code of the pressed key
    var keyCode = event.keyCode;

    // Check if the key is W, A, S, or D
    if ((keyCode === 87 || keyCode === 65 || keyCode === 83 || keyCode === 68) && !isMoving) {
        isMoving = true;
        // Set the current direction based on the pressed key
        if (keyCode === 87) {
            currentDirection = 'up';
        } else if (keyCode === 65) {
            currentDirection = 'left';
        } else if (keyCode === 83) {
            currentDirection = 'down';
        } else if (keyCode === 68) {
            currentDirection = 'right';
        }

        // Continuously update the position of the circle until it collides with a collidable square
        let interval = setInterval(() => {
            // Calculate the new position of the circle based on the current direction
            var newCircleRow = circleRow;
            var newCircleCol = circleCol;
            if (currentDirection === 'up') {
                newCircleRow = (circleRow + numRows - 1) % numRows;
            } else if (currentDirection === 'left') {
                newCircleCol = (circleCol + numCols - 1) % numCols;
            } else if (currentDirection === 'down') {
                newCircleRow = (circleRow + 1) % numRows;
            } else if (currentDirection === 'right') {
                newCircleCol = (circleCol + 1) % numCols;
            }
        
            // Check if the target square is collidable
            var collidableSquaresInTargetSquare = collidableSquares.filter(function (square) {
                return square.row === newCircleRow && square.col === newCircleCol;
            });
            var isCollidable = collidableSquaresInTargetSquare.length > 0;

            // Only update the position of the circle if the target square is not collidable
            if (!isCollidable) {
                // Check if the circle is colliding with a small circle
                var smallCircleInTargetSquare = smallCircles.find(function (smallCircle) {
                    return smallCircle.row === newCircleRow && smallCircle.col === newCircleCol;
                });
                if (smallCircleInTargetSquare) {
                    console.log('yeah')
                    // Remove the small circle from the array
                    smallCircles = smallCircles.filter(function (smallCircle) {
                        return smallCircle.row !== newCircleRow || smallCircle.col !== newCircleCol;
                    });
                }

                // Update the position of the circle
                circleRow = newCircleRow;
                circleCol = newCircleCol;

                // Reset the canvas by clearing the drawing surface and redrawing the grid
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawGrid();

                // Redraw the circle at its new position
                drawCircle(circleRow, circleCol);

                // Redraw the small circles
                drawSmallCircles();
            }else{
                // The circle has collided with a collidable square, so stop the interval
                clearInterval(interval);
                isMoving = false;
            }
        },intervalTime);
    }
});



const restartButton = document.getElementById("restartButton");
restartButton.addEventListener("click", () => {
    // Reset the circle position to the initial position
    circleRow = initialCircleRow;
    circleCol = initialCircleCol;

    // Reset the canvas by clearing the drawing surface and redrawing the grid and circle
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawCircle(circleRow, circleCol);

    // Reset small circles
    smallCircles = initialSmallCircles;
    drawSmallCircles();

    isMoving = false;
    currentDirection = null
});