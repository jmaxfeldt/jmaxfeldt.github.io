// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.style.left = "25px";
canvas.style.position = "relative";

const scoreText = document.getElementById("score-text");
const speedText = document.getElementById("speed-text");
const snakeLengthText = document.getElementById("snake-length-text");

const gameStates = Object.freeze({ "pregame": 1, "running": 2, "gameover": 3, "paused": 4, "menu": 5 });
let isMenuOpen = false;
let gameInstance = null;

function startGame(startWMenuOpen) {
    closePopups();
    gameInstance = new Game(new Date().getTime(), 150, 4);
    // gameInstance.initGame(document.getElementById("board-size-select").value.split(" "), 25, document.querySelector('input[name="bg-select"]:checked').value);
    gameInstance.initGame(document.getElementById("numCellsX-input").value, document.getElementById("numCellsY-input").value, document.getElementById("cellsize-input").value, document.querySelector('input[name="bg-select"]:checked').value);
    resetUI(1000 / gameInstance.gameSpeed);
    updateCanvasContainer(gameInstance.board.width, gameInstance.board.height);
    if (startWMenuOpen) {
        prevGameState = gameStates.pregame;
        gameInstance.gameState = gameStates.menu;
    }
    else {
        gameInstance.gameState = gameStates.pregame;
    }
}

function closePopups() {
    document.getElementById("startgame-popup").style.display = "none";
    document.getElementById("gameover-popup").style.display = "none";
    document.getElementById("paused-text").style.display = "none";
}

function updateCanvasContainer(newWidth, newHeight) {
    document.getElementById("canvas-container").style.minWidth = newWidth + 50 + "px";
    //document.getElementById("canvas-container").style.minHeight = newHeight + 25 + "px";
}

function resetUI(speed) {
    scoreText.innerHTML = "Score: 0";
    speedText.innerHTML = "Speed: " + speed.toFixed(2).toString();
    snakeLengthText.innerHTML = "Length: 0";
}

function random(min, max) {
    const num = Math.floor(Math.random() * (max - min)) + min;
    return num;
}

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

Vector2.prototype.equals = function (v2) {
    if (this.x === v2.x && this.y === v2.y) {
        return true;
    }
    return false;
}

Vector2.prototype.addTo = function (v2) {
    this.x += v2.x;
    this.y += v2.y;
}

Vector2.prototype.assignValueOf = function (v2) {
    this.x = v2.x;
    this.y = v2.y;
}

function GameBoard(cellsX, cellsY, cellSize) {
    this.cellsRep = [];
    this.backgroundImage;
    this.playerSnake;
    this.food;

    this.cellSize = Number(cellSize); //25;
    this.cellsX = Number(cellsX);
    this.cellsY = Number(cellsY);
    this.numCells = this.cellsX * this.cellsY;

    this.width = canvas.width = cellsX * cellSize;
    this.height = canvas.height = cellsY * cellSize;
    
    this.startPos = new Vector2(Math.ceil((this.cellsX - 1) / 2), Math.ceil((this.cellsY - 1) / 2));

    this.initBoard();
}

GameBoard.prototype.initBoard = function () {
    this.cellsRep.length = 0;
    for (let i = 0; i < this.numCells; i++) {
        this.cellsRep.push(true);
    }
}

GameBoard.prototype.onGameUpdate = function () {
    this.cellsRep[this.playerSnake.segments[0].pos.y * this.cellsX + this.playerSnake.segments[0].pos.x] = false;
    if (!this.playerSnake.lastTailPos.equals(this.playerSnake.segments[this.playerSnake.segments.length - 1].pos)){
        this.cellsRep[this.playerSnake.lastTailPos.y * this.cellsX + this.playerSnake.lastTailPos.x] = true;
    }
    this.draw();
}

GameBoard.prototype.draw = function () {
    ctx.putImageData(this.backgroundImage, 0, 0);

    ctx.beginPath();
    ctx.arc(this.food.position.x * this.cellSize + this.cellSize / 2, this.food.position.y * this.cellSize + this.cellSize / 2, this.cellSize / 2 - 5, 0, 360);
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fill();

    for (let i = 0; i < this.playerSnake.segments.length; i++) {
        ctx.beginPath();
        ctx.rect(this.playerSnake.segments[i].pos.x * this.cellSize + 2, this.playerSnake.segments[i].pos.y * this.cellSize + 2, this.cellSize - 4, this.cellSize - 4); //<--Add a size field to drawable objects?
        ctx.fillStyle = this.playerSnake.segments[i].currentColor;
        ctx.fill();
    }

    // for (let i = 0; i < this.cellsRep.length; i++) {
    //     ctx.beginPath();
    //     ctx.arc((i - (Math.floor(i / this.cellsX) * this.cellsX)) * this.cellSize + this.cellSize / 2, Math.floor(i / this.cellsX) * this.cellSize + this.cellSize / 2, 2, 0, 360);
    //     //ctx.strokeText(i.toString(), (i - (Math.floor(i / this.cellsX) * this.cellsX)) * this.cellSize + this.cellSize / 2 - 15/2, Math.floor(i / this.cellsX) * this.cellSize + this.cellSize / 2 + 15/2 );
    //     if (this.cellsRep[i]) {
    //         ctx.fillStyle = "rgb(0, 255, 0)";
    //     }
    //     else {
    //         ctx.fillStyle = "rgb(255, 0 , 0)";
    //     }
    //     ctx.fill();
    // }
}

GameBoard.prototype.setPlayer = function (player) {
    this.playerSnake = player;
}

GameBoard.prototype.setFood = function (food) {
    this.food = food;
    this.food.position = this.getNewFoodPos();
}

GameBoard.prototype.setBGImage = function (bgType) {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'; //creates the black background
    ctx.fillRect(0, 0, this.width, this.height);

    if (bgType === "grid") {
        for (let i = 0; i < this.cellsX + 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.cellSize, 0);
            ctx.lineTo(i * this.cellSize, this.height);
            ctx.moveTo(0, i * this.cellSize)
            ctx.lineTo(this.width, i * this.cellSize)
            ctx.lineWidth = 1;
            ctx.strokeStyle = "rgb(75, 75, 75)";
            ctx.stroke();
        }
    }
    else if (bgType === "checkered") {
        for (let i = 0; i < this.cellsY; i++) {
            for (let j = 0; j < this.cellsX; j++) {
                ctx.beginPath();
                ctx.rect(j * this.cellSize, i * this.cellSize, this.cellSize, this.cellSize);
                if ((i + j) % 2 != 0) {
                    ctx.fillStyle = "rgb(25,25,25)";
                }
                else {
                    ctx.fillStyle = "rgb(0,0,0)";
                }
                ctx.fill();
            }
        }
    }
    this.backgroundImage = ctx.getImageData(0, 0, this.width, this.height);
    this.draw();
}

GameBoard.prototype.getNewFoodPos = function () {
    //iterative can take thousands of loops to find an open cell when only a few remain.  Faster than recursion
    let randNum;
    while (true) {
        randNum = random(0, this.numCells);
        if (this.cellsRep[randNum]) {
            return new Vector2(randNum - (Math.floor(randNum / this.cellsX) * this.cellsX), Math.floor(randNum / this.cellsX));
        }
        console.log("Selecting another food location.  First one was taken");
    }
}

function Game(startTime, initialGameSpeed, initialSnakeLength) {
    this.gameState = gameStates.pregame;
    this.boundLoop = this.gameLoop.bind(this);
    this.startTime = startTime;
    this.gameSpeed = initialGameSpeed;
    this.speedUpStep = .02;
    this.maxSpeed = 30;
    this.score = 0;
    this.cellsPerSecond = 1000 / initialGameSpeed;
    this.initialSnakeLength = initialSnakeLength;
    this.allowPanicInput = true;
    this.nextUpdate = startTime;
    this.inputQueue = [];

    this.board;
    this.playerSnake;
    this.food;
}

Game.prototype.initGame = function (boardCellsX, boardCellsY, cellSize, bgType) {
    console.log("initGame called");
    this.board = new GameBoard(boardCellsX,  boardCellsY, cellSize);
    this.playerSnake = new Snake(0, -1, 'rgb(0,255,255)', this.initialSnakeLength, this.board.startPos);
    this.board.setPlayer(this.playerSnake);
    this.food = new food();
    this.board.setFood(this.food);
    this.board.setBGImage(bgType);
    this.board.draw();
}

Game.prototype.gameLoop = function () {
    let curTime = new Date().getTime();

    if (curTime >= this.nextUpdate) {
        this.playerSnake.update(this.inputQueue);
        this.board.onGameUpdate();
        this.detectCollisions();
        //this.board.draw();
        this.nextUpdate = curTime + this.gameSpeed;
    }

    if (this.gameState === gameStates.running) {
        requestAnimationFrame(this.boundLoop);
    }
}

Game.prototype.addInput = function (input) {
    if (this.inputQueue.length === 0 && this.playerSnake.direction.x != -input.x) {
        if ((input.x != this.playerSnake.direction.x && input.y != this.playerSnake.direction.y)) { //doesn't allow inputs that match the current direction
            this.inputQueue.push(input);
        }
    }
    else if (this.allowPanicInput && (this.inputQueue.length === 1 && this.inputQueue[0].x != -input.x)) {
        if ((input.x != this.inputQueue[0].x && input.y != this.inputQueue[0].y)) {
            this.inputQueue.push(input);
        }
    }
}

Game.prototype.detectCollisions = function () {
    if (this.playerSnake.segments[0].pos.x < 0 || this.playerSnake.segments[0].pos.x >= this.board.cellsX || this.playerSnake.segments[0].pos.y < 0 || this.playerSnake.segments[0].pos.y >= this.board.cellsY) {
        openGameoverPopup("(You hit the wall)");
    }
    for (let i = 1; i < this.playerSnake.segments.length; i++) {
        if (this.playerSnake.segments[0].pos.equals(this.playerSnake.segments[i].pos)) {
            openGameoverPopup("(You ate yourself)");
        }
    }
    if (this.playerSnake.segments[0].pos.equals(this.food.position)) {
        this.onFoodEaten();
    }
}

Game.prototype.onFoodEaten = function () {
    this.food.position = this.board.getNewFoodPos();
    this.score++;
    this.speedUp(this.speedUpStep);
    this.playerSnake.segmentQueue += 5;
    scoreText.innerText = "Score: " + this.score.toString(); //<-- Is there another way to do this?
}

Game.prototype.speedUp = function (speedStep) {
    this.gameSpeed -= this.gameSpeed * speedStep;
    this.cellsPerSecond = 1000 / this.gameSpeed;
    speedText.innerText = "Speed: " + this.cellsPerSecond.toFixed(2).toString();
}

function Snake(xDir, yDir, color, initialLength, startPos) {
    this.segmentQueue = initialLength;
    this.segments = [];
    this.lastTailPos = new Vector2(startPos.x, startPos.y);
    this.direction = new Vector2(xDir, yDir);
    this.color = color;

    this.segments.push(new SnakeSegment(startPos, 'rgb(0,255,255)', 'rgb(0,255,255)'));
}

Snake.prototype.update = function (input) {
    this.lastTailPos.assignValueOf(this.segments[this.segments.length - 1].pos);
  
    if (input.length != 0) {
        this.direction = input[0];
        input.shift();
    }

    for (let i = this.segments.length - 1; i >= 0; i--) {
        if (i === 0) {
            this.segments[i].pos.addTo(this.direction);
            break;
        }
        this.segments[i].pos.assignValueOf(this.segments[i - 1].pos);
    }

    if (this.segmentQueue > 0) {
        this.segments.push(new SnakeSegment(this.lastTailPos, 'rgb(0,255,255)', 'rgb(0,255,255)'));
        snakeLengthText.innerText = "Length: " + this.segments.length;//<-- NO  updating something that this  class should have no knowledge of
        this.segmentQueue--;
    }
}

function SnakeSegment(position, defaultColor, currentColor) {
    this.pos = new Vector2(position.x, position.y);
    this.defaultColor = defaultColor;
    this.currentColor = currentColor;
}

function food() {
    this.position;
}

let prevGameState;
document.addEventListener("keydown", function (event) {
    if (gameInstance != null) {
        if (event.key === "Escape") {
            if (gameInstance.gameState === gameStates.menu) {
                closeMenu();
                if (prevGameState === gameStates.running) {
                    gameInstance.gameLoop();//this causes the game to advance when closing the menu while other windows are open.  Stop it from doing that
                }
            }
            else {
                openMenu();
            }
        }
        else if (gameInstance.gameState === gameStates.pregame) {
            closeStartGamePopup();
        }
        else if (gameInstance.gameState === gameStates.gameover) {
            if (event.key === "Enter") {
                closeGameoverPopup();
            }
        }
        else if (gameInstance.gameState === gameStates.paused) {
            if (event.key === " " || event.key === "p") {
                document.getElementById("paused-text").style.display = "none";
                gameInstance.gameState = gameStates.running;
                gameInstance.gameLoop();
            }
        }
        else if (gameInstance.gameState === gameStates.running) {
            if (event.key === "ArrowRight" || event.key === "d") {
                gameInstance.addInput(new Vector2(1, 0));
            }
            if (event.key === "ArrowLeft" || event.key === "a") {
                gameInstance.addInput(new Vector2(-1, 0));
            }
            if (event.key === "ArrowUp" || event.key === "w") {
                gameInstance.addInput(new Vector2(0, -1));
            }
            if (event.key === "ArrowDown" || event.key === "s") {
                gameInstance.addInput(new Vector2(0, 1));
            }
            if (event.key === " " || event.key === "p") {
                document.getElementById("paused-text").style.display = "block";
                if (gameInstance.gameState === gameStates.running) {
                    gameInstance.gameState = gameStates.paused;
                }
            }
        }
    }
})

openStartGamePopup(); //<--This is what actually starts the game

document.getElementById("play-again-btn").onclick = function () {
    closeGameoverPopup();
    //openStartGamePopup();
}

// document.getElementById("board-size-select").onchange = function () {
//     console.log("Board size value changed");
//     let decision = confirm("Warning!  Changing the board size will restart the game.  Continue?")
//     if (decision) {
//         openStartGamePopup();
//     }
// }
document.getElementById("cellsize-input").onchange = function(){
    openStartGamePopup();
}
document.getElementById("numCellsX-input").onchange = function(){
    openStartGamePopup();
}
document.getElementById("numCellsY-input").onchange = function(){
    openStartGamePopup();
}


document.getElementById("bg-select-container").onclick = function () {
    let selectValue = document.querySelector('input[name="bg-select"]:checked').value;
    console.log("select container was clicked.");
    console.log("Value of the selected radio button is: " + selectValue);
    gameInstance.board.setBGImage(selectValue);
}

function openStartGamePopup() {
    startGame(isMenuOpen);
    document.getElementById("startgame-popup").style.display = "block";
}

function closeStartGamePopup() {
    document.getElementById("startgame-popup").style.display = "none";
    if (gameInstance != null) {
        console.log("There is a game instance");
        gameInstance.gameState = gameStates.running;
        gameInstance.gameLoop();
    }
}

function openGameoverPopup(message) {
    gameInstance.gameState = gameStates.gameover;
    document.getElementById("gameover-reason").innerText = message;
    document.getElementById("gameover-popup").style.display = "block"
}

function closeGameoverPopup() {
    document.getElementById("gameover-reason").innerText = "";
    document.getElementById("gameover-popup").style.display = "none"
    openStartGamePopup();
}

function openMenu() {
    document.getElementById("menu-popup").style.display = "block"
    isMenuOpen = true;
    prevGameState = gameInstance.gameState;
    gameInstance.gameState = gameStates.menu;
}

function closeMenu() {
    document.getElementById("menu-popup").style.display = "none"
    isMenuOpen = false;
    gameInstance.gameState = prevGameState;
}