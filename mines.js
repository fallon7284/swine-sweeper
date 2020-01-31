class GridNode {
  constructor(x, y, isPig = false) {
    this.x = x;
    this.y = y;
    this.isPig = isPig;
    this.neighbors = [];
    this.visible = false;
  }
  getValue() {
    return this.isPig
      ? "pig"
      : this.neighbors.reduce((accum, cell) => {
          let val = cell.isPig ? 1 : 0;
          return accum + val;
        }, 0);
  }
}

class Game {
  constructor(size = 10, difficulty = 10) {
    this.grid = [];
    this.size = size;
    this.difficulty = difficulty;
    this.status = "continue";
    this.table = null;
    this.playAgain = document.getElementById("play-again");
    this.header = document.getElementsByClassName("header")[0];
    this.difficultySelector = null;
    this.sizeSelector = null;
    this.loseAudio = new Audio("lose.mp3");
    this.winAudio = new Audio("win.mp3");
  }
  insert(newNode) {
    for (let i = 0; i < this.grid.length; i++) {
      const currentNode = this.grid[i];
      const { x, y } = currentNode;
      if (Math.abs(x - newNode.x) <= 1 && Math.abs(y - newNode.y) <= 1) {
        newNode.neighbors.push(currentNode);
        currentNode.neighbors.push(newNode);
      }
    }
    this.grid.push(newNode);
  }
  initialize() {
    this.header.innerText = "Swine Sweeper";
    this.playAgain.innerText = "";
    let tableDiv = document.getElementById("table-div");
    while (tableDiv.hasChildNodes()) {
      tableDiv.removeChild(tableDiv.firstChild);
    }
    let table = document.createElement("table");
    tableDiv.appendChild(table);
    this.table = document.getElementsByTagName("table")[0];
    this.table.addEventListener("click", this.click.bind(this));
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        let isPig = Math.floor(Math.random() * 100) < this.difficulty;
        this.insert(new GridNode(x, y, isPig));
      }
    }
    this.drawTable(this.status);
  }
  click(evt, x, y, cache = {}) {
    if (!cache[`x${x}y${y}`]) {
      cache[`x${x}y${y}`] = true;
      if (!evt || evt.target.localName === "td") {
        if (evt) {
          x = evt.target.x;
          y = evt.target.y;
        }
        let idx = x + y * this.size;
        let clickedNode = this.grid[idx];
        if (evt && evt.shiftKey) {
          clickedNode.flagged = !clickedNode.flagged;
          let win = true;
          for (let i = 0; i < this.grid.length; i++) {
            let { flagged, isPig } = this.grid[i];
            if ((flagged && !isPig) || (isPig && !flagged)) {
              win = false;
            }
          }
          if (win) {
            this.status = "win";
            this.winAudio.play();
          }
        } else {
          if (!clickedNode.flagged) {
            clickedNode.visible = true;
            if (clickedNode.getValue() === 0) {
              for (let i = 0; i < clickedNode.neighbors.length; i++) {
                let neighbor = clickedNode.neighbors[i];
                neighbor.visible = true;
                if (neighbor.getValue() === 0) {
                  this.click(null, neighbor.x, neighbor.y, cache);
                }
              }
            }
            if (clickedNode.isPig) {
              this.status = "lose";
              this.loseAudio.play();
            }
          }
        }
      }
    }
    this.drawTable(this.status);
  }
  itsOver() {
    this.grid.forEach(el => {
      el.visible = true;
    });
    this.header.innerText = `YOU ${this.status.toUpperCase()}`;
    this.drawTable("continue");
    this.playAgain.innerText = "Play Again?";
  }
  drawTable(status) {
    if (status === "continue") {
      this.table.removeEventListener("click", this.click);
      while (this.table.hasChildNodes()) {
        this.table.removeChild(this.table.firstChild);
      }
      let currentRow;
      for (let i = 0; i < this.grid.length; i++) {
        if (i % this.size === 0) {
          let tr = document.createElement("tr");
          this.table.appendChild(tr);
          let rows = document.getElementsByTagName("tr");
          currentRow = rows[rows.length - 1];
        }
        let td = document.createElement("td");
        td.x = this.grid[i].x;
        td.y = this.grid[i].y;
        if (this.grid[i].flagged) {
          td.classList.add("flagged");
        }
        if (this.grid[i].visible) {
          td.classList.add("visible");
          if (this.grid[i].isPig) {
            td.innerHTML = '<img src="./pig.png"/>';
          } else if (this.grid[i].getValue() > 0) {
            td.classList.add(
              ["blue", "green", "red", "brown"][this.grid[i].getValue() - 1]
            );
            const value = this.grid[i].getValue();
            td.innerText = value === 0 ? "" : value;
          }
        }
        currentRow.appendChild(td);
      }
    } else {
      this.itsOver();
    }
  }
}

let size;
let difficulty;
let board;

const sizeChange = evt => {
  size = evt.target.value;
  startGame(null, size, difficulty);
};

const difficultyChange = evt => {
  difficulty = evt.target.value;
  startGame(null, size, difficulty);
};

difficultySelector = document.getElementById("difficulty-select");
sizeSelector = document.getElementById("size-select");
difficultySelector.addEventListener("change", difficultyChange);
sizeSelector.addEventListener("change", sizeChange);

const startGame = (e, s, d) => {
  board = new Game(s || sizeSelector.value, d || difficultySelector.value);
  console.log(board);
  board.initialize();
  console.log(board.grid[0]);
};

const playAgain = document.getElementById("play-again");
playAgain.addEventListener("click", startGame);

startGame();
