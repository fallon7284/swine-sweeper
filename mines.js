class SweeperGame {
  constructor(size, difficulty) {
    this.size = size;
    this.difficulty = difficulty;
    this.status = "continue";
    this.board = [];
    this.pigObject = {};
  }
  setStatus(status) {
    this.status = status;
  }
  getStatus() {
    return this.status;
  }
  calculateNeighborPigs = (x, y, pigs, size) => {
    const neighbors = this.generateValidNeighborsList(x, y, size);
    let sum = 0;
    for (let i = 0; i < neighbors.length; i++) {
      const { x, y } = neighbors[i];
      if (pigs[`x${x}y${y}`]) {
        sum++;
      }
    }
    return sum;
  };
  generateValidNeighborsList = (x, y) => {
    let neighbors = [
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 }
    ];
    return neighbors
      .map(item => {
        item.x += x;
        item.y += y;
        return item;
      })
      .filter(item => {
        return (
          item.x >= 0 && item.y >= 0 && item.x < this.size && item.y < this.size
        );
      });
  };
  setupClickListener(evt, game) {
    if (evt.target.localName === "td") {
      const { x, y } = event.target.coords;
      if (evt.shiftKey) {
        game.flagPig(x, y);
      } else {
        game.updateBoard(x, y);
      }
      game.drawBoard();
    }
  }
  endGame() {
    document.removeEventListener("click", this.setupClickListener);
  }
  changeBoard(size, difficulty) {
    this.endGame();
    this.setStatus("continue");
    const title = document.getElementsByClassName("header")[0];
    title.classList.remove("winner", "loser");
    title.innerText = "Swine Sweeper";
    this.size = size;
    this.difficulty = difficulty;
    this.pigObject = {};
    this.board = [];
    this.initializeGame();
  }
  initializeGame() {
    document.addEventListener("click", evt =>
      this.setupClickListener(evt, this)
    );
    const createBoardArray = () => {
      const generatePigCoords = () => {
        let numberOfPigs = Math.floor(this.size * this.size * this.difficulty);
        const createCoordVal = () => {
          return Math.floor(Math.random() * this.size);
        };
        const crossCheckPig = (x, y) => {
          if (this.pigObject[`x${x}y${y}`]) {
            return false;
          } else {
            this.pigObject[`x${x}y${y}`] = true;
            return true;
          }
        };
        for (let i = 0; i < numberOfPigs; i++) {
          let validPigCoord = false;
          let x;
          let y;
          while (!validPigCoord) {
            x = createCoordVal();
            y = createCoordVal();
            if (crossCheckPig(x, y)) {
              validPigCoord = true;
            }
          }
        }
      };
      generatePigCoords();
      for (let y = 0; y < this.size; y++) {
        let row = [];
        for (let x = 0; x < this.size; x++) {
          if (this.pigObject[`x${x}y${y}`]) {
            row.push({ value: "pig", hidden: true, x, y, flagged: false });
          } else {
            row.push({
              value: this.calculateNeighborPigs(
                x,
                y,
                this.pigObject,
                this.size
              ),
              hidden: true,
              flagged: false,
              x,
              y
            });
          }
        }
        this.board.push(row);
      }
    };
    createBoardArray();
    this.drawBoard();
  }
  loseGame() {
    const title = document.getElementsByClassName("header")[0];
    title.innerText = "YOU LOSE! CLICK TO TRY AGAIN";
    title.classList.add("loser");
    console.log(this.size, this.difficulty);
    title.addEventListener("click", () => {
      this.changeBoard(this.size, this.difficulty);
    });
  }
  winGame() {
    this.setStatus("win");
    const title = document.getElementsByClassName("header")[0];
    title.innerText = "YOU WIN! CLICK TO PLAY AGAIN";
    title.classList.add("winner");
    title.addEventListener("click", () => {
      this.changeBoard(this.size, this.difficulty);
    });
  }
  updateBoard = (x, y, cache = {}) => {
    this.board[y][x].hidden = false;
    if (this.board[y][x].value === "pig") {
      this.setStatus("lose");
      this.loseGame();
      this.drawBoard();
      const title = document.getElementsByClassName("header")[0];
      title.addEventListener("click", () => {
        this.changeBoard(this.size, this.difficulty);
      });
    }
    if (this.board[y][x].value === 0) {
      const neighbors = this.generateValidNeighborsList(x, y);
      for (let i = 0; i < neighbors.length; i++) {
        let currentX = neighbors[i].x;
        let currentY = neighbors[i].y;
        let currentBoardObject = this.board[currentY][currentX];
        currentBoardObject.hidden = false;
        if (
          currentBoardObject.value === 0 &&
          !cache[`x${currentX}y${currentY}`]
        ) {
          cache[`x${currentX}y${currentY}`] = true;
          this.updateBoard(currentBoardObject.x, currentBoardObject.y, cache);
        }
      }
    }
  };
  flagPig = (x, y) => {
    const isFlagged = this.board[y][x].flagged;
    this.board[y][x].flagged = !isFlagged;
  };
  drawBoard() {
    const classColor = ["blue", "green", "red", "brown"];
    if (this.getStatus() === "continue") {
      let youWin = true;
      for (let i = 0; i < this.board.length; i++) {
        for (let j = 0; j < this.board[i].length; j++) {
          const currentCell = this.board[i][j];
          if (
            (currentCell.hidden === true && currentCell.value !== "pig") ||
            (currentCell.flagged === true && currentCell.value !== "pig") ||
            (currentCell.value === "pig" && !currentCell.flagged)
          ) {
            youWin = false;
          }
        }
      }
      if (youWin) {
        this.winGame();
        this.drawBoard();
      }
    } else {
      for (let i = 0; i < this.board.length; i++) {
        for (let j = 0; j < this.board[i].length; j++) {
          this.board[i][j].hidden = false;
          this.board[i][j].flagged = false;
        }
      }
    }
    while (board.hasChildNodes()) {
      board.removeChild(board.firstChild);
    }
    for (let i = 0; i < this.board.length; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < this.board.length; j++) {
        let td = document.createElement("td");
        let { value, x, y, hidden, flagged } = this.board[i][j];
        if (value === 0) value = "";
        td.coords = { x, y };
        if (flagged) {
          td.classList.add("flagged");
        }
        if (!hidden && !flagged) {
          td.className = "visible";
          if (value === "pig") {
            td.innerHTML = '<img src="./pig.png"/>';
          } else td.innerText = value;
          td.classList.add(classColor[value - 1]);
        }
        tr.appendChild(td);
      }
      board.appendChild(tr);
    }
  }
}

const handleSettingsChange = evt => {
  while (board.hasChildNodes()) {
    board.removeChild(board.firstChild);
  }
  newGame.endGame();
  newGame.changeBoard(sizeSelector.value, difficultySelector.value);
};
const board = document.getElementsByTagName("table")[0];
const difficultySelector = document.getElementById("difficulty-select");
const sizeSelector = document.getElementById("size-select");
difficultySelector.addEventListener("change", handleSettingsChange);
sizeSelector.addEventListener("change", handleSettingsChange);

const newGame = new SweeperGame(sizeSelector.value, difficultySelector.value);
console.log(newGame);
newGame.initializeGame();
