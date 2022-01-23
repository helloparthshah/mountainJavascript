class Grid {
  constructor(n) {
    this.rows = n;
    this.size = width / this.rows;
    this.cols = floor(height / this.size);

    this.start = createVector(floor(this.rows / 4), floor(this.cols / 2));
    this.end = createVector(floor((3 * this.rows) / 4), floor(this.cols / 2));

    this.isFinding = false;
    this.noiseFactor = 100
    this.off = 0.02
    this.nodes = [];
    let yoff = 0
    for (let i = 0; i < this.rows; i++) {
      let xoff = 0
      this.nodes[i] = [];
      for (let j = 0; j < this.cols; j++) {
        this.nodes[i][j] = new Node(
          i,
          j,
          this.size,
          Infinity,
          dist(i, j, this.end.x, this.end.y),
          noise(xoff, yoff) * this.noiseFactor,
          this.noiseFactor
        );
        xoff += this.off;
      }
      yoff += this.off;
    }

    this.nodes[this.start.x][this.start.y].isStart = true;
    this.nodes[this.end.x][this.end.y].isEnd = true;

    this.X = [0, 1, 0, -1, 1, 1, -1, -1];
    this.Y = [-1, 0, 1, 0, -1, 1, 1, -1];
  }

  updateDist = function () {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.nodes[i][j].h = 0;
        this.nodes[i][j].g = Infinity;
        this.nodes[i][j].f = Infinity;
      }
    }
  };

  display = function () {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.nodes[i][j].display();
      }
    }
  };

  getMode = function (x, y) {
    if (x < width && y < height && x > 0 && y > 0)
      return !(this.nodes[floor((x / width) * this.rows)][
        floor((y / height) * this.cols)
      ].isWall || this.nodes[floor((x / width) * this.rows)][
        floor((y / height) * this.cols)
      ].isWeight);
  };

  isStartEnd = function (x, y) {
    if (x < width && y < height && x > 0 && y > 0)
      return this.nodes[floor((x / width) * this.rows)][
          floor((y / height) * this.cols)
        ].isStart ?
        1 :
        this.nodes[floor((x / width) * this.rows)][
          floor((y / height) * this.cols)
        ].isEnd ?
        -1 :
        0;
  };

  moveNode = function (x, y, n) {
    if (
      x < width &&
      y < height &&
      x > 0 &&
      y > 0
    ) {
      if (n == 1) {
        this.nodes[this.start.x][this.start.y].isStart = false;
        this.start = createVector(
          floor((x / width) * this.rows),
          floor((y / height) * this.cols)
        );
        this.nodes[this.start.x][this.start.y].isStart = true;
        this.updateDist();
        // visualize(0);
      } else if (n == -1) {
        this.nodes[this.end.x][this.end.y].isEnd = false;
        this.end = createVector(
          floor((x / width) * this.rows),
          floor((y / height) * this.cols)
        );
        this.nodes[this.end.x][this.end.y].isEnd = true;
        this.updateDist();
        // visualize(0);
      }
    }
  };

  reset = function () {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.nodes[i][j].parent = null;
        this.nodes[i][j].isVisited = false;
        this.nodes[i][j].isPath = false;
        this.nodes[i][j].isWeight = false;
        this.nodes[i][j].isWall = false;
        this.nodes[i][j].g = Infinity;
        this.nodes[i][j].f = Infinity;
      }
    }
  };

  clr = function () {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.nodes[i][j].parent = null;
        this.nodes[i][j].isVisited = false;
        this.nodes[i][j].isPath = false;
      }
    }
  };

  getCost = function (n0, n1, type = 'exp') {
    if (type == 'exp')
      return pow(2, n1.height - n0.height)
    else
      return n1.height / (n0.height + 1)
  }

  showPath = async function (delay) {
    var n = this.nodes[this.end.x][this.end.y];
    let cost = 0;
    while (n && n.parent) {
      cost += this.getCost(n.parent, n);
      n.setPath(true);
      n = n.parent;
      if (delay > 0) await sleep(5);
    }
    let nVisited = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.nodes[i][j].g = Infinity;
        nVisited += this.nodes[i][j].isVisited ? 1 : 0;
      }
    }
    document.getElementById("cost").innerHTML = cost.toFixed(3);
    document.getElementById("visited").innerHTML = nVisited;
  };

  dijkstraexp = async function (delay, type = 'exp') {
    var queue = [];
    this.nodes[this.start.x][this.start.y].g = 0;
    queue.push(this.nodes[this.start.x][this.start.y]);

    while (queue.length > 0) {
      queue.sort((a, b) => {
        return a.g > b.g ? 1 : b.g > a.g ? -1 : 0;
      });

      var curNode = queue.shift();

      if (curNode.isVisited) continue;
      curNode.setVisited(true, delay);
      if (curNode === this.nodes[this.end.x][this.end.y]) break;

      for (let k = 0; k < this.X.length; k++) {
        let dx = curNode.x + this.X[k];
        let dy = curNode.y + this.Y[k];
        if (
          dx >= 0 &&
          dx < this.rows &&
          dy >= 0 &&
          dy < this.cols &&
          !this.nodes[dx][dy].isWall
        ) {
          let alt = curNode.g + this.getCost(curNode, this.nodes[dx][dy], type);
          if (alt < this.nodes[dx][dy].g) {
            this.nodes[dx][dy].g = alt;
            this.nodes[dx][dy].parent = curNode;
          }
          queue.push(this.nodes[dx][dy]);
        }
      }
      if (delay > 0) await sleep(delay);
    }
    await this.showPath(delay);
  };

  heuristic = function (current, goal) {
    let d = dist(current.x, current.y, goal.x, goal.y);
    let h = goal.height - current.height;
    return d
  }

  astarexp = async function (delay, type = 'exp') {
    var queue = [];
    this.nodes[this.start.x][this.start.y].g = 0;
    queue.push(this.nodes[this.start.x][this.start.y]);

    while (queue.length > 0) {
      queue.sort((a, b) => {
        return a.f > b.f ? 1 : b.f > a.f ? -1 : 0;
      });

      var curNode = queue.shift();

      if (curNode.isVisited) continue;
      curNode.setVisited(true, delay);
      if (curNode === this.nodes[this.end.x][this.end.y]) break;

      for (let k = 0; k < this.X.length; k++) {
        let dx = curNode.x + this.X[k];
        let dy = curNode.y + this.Y[k];
        if (
          dx >= 0 &&
          dx < this.rows &&
          dy >= 0 &&
          dy < this.cols &&
          !this.nodes[dx][dy].isWall
        ) {
          let alt = curNode.g + this.getCost(curNode, this.nodes[dx][dy], type);
          if (alt < this.nodes[dx][dy].g) {
            this.nodes[dx][dy].g = alt;
            try {
              this.nodes[dx][dy].f = alt + this.heuristic(this.nodes[dx][dy], this.nodes[this.end.x][this.end.y]);
            } catch (error) {
              alert(error);
              return
            }
            this.nodes[dx][dy].parent = curNode;
          }
          queue.push(this.nodes[dx][dy]);
        }
      }
      if (delay > 0) await sleep(delay);
    }
    await this.showPath(delay);
  }
}

class Node {
  constructor(x, y, size, g, h, height, noiseFactor) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.s = size;
    this.g = g;
    this.h = h;
    this.f = g + h;
    this.cost = 1;
    this.height = height;
    this.noiseFactor = noiseFactor;

    this.parent;
    this.isStart = false;
    this.isEnd = false;
    this.isPath = false;
    this.isVisited = false;
  }

  setVisited = async function (isVisited, delay) {
    if (this.isVisited != isVisited) {
      this.isVisited = isVisited;
    }
  };

  setPath = async function (isPath, delay) {
    if (this.isPath != isPath) {
      this.isPath = isPath;
    }
  };

  display = function () {
    rectMode(CENTER);
    let c = this.height / this.noiseFactor;
    noStroke();
    if (this.isStart) fill(0, 255, 0);
    else if (this.isEnd) fill(255, 0, 0);
    else if (this.isPath) fill(31, 119, 180);
    else if (this.isVisited) fill(247 * c, 102 * c, 174 * c);
    else fill(c * 255);
    // stroke(175, 216, 248);
    square(
      this.x * this.size + this.size / 2,
      this.y * this.size + this.size / 2,
      this.s
    );
  };
}