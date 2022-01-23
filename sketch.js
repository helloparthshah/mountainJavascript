// For it to run you need a local server (check: https://github.com/processing/p5.js/wiki/Local-server)
p5.disableFriendlyErrors = true;

var grid;

var mode = true;

var move = 0;

var h, w;

var prevSearch = false;

function preload() {
  e = document.getElementById("canvas");
  h = e.clientHeight;
  w = e.clientWidth;
  // noiseSeed(0);
}

function setup() {
  // put setup code here
  canvas = createCanvas(w, h);
  canvas.parent("canvas");

  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  grid = new Grid(200);

  pixelDensity(1);
  document.getElementById("heu").innerHTML = grid.heuristic.toString();
}

function reset() {
  if (!grid.isFinding) {
    grid.reset();
  }
}


function visualize(i) {
  if (!grid.isFinding) {
    grid.isFinding = true;
    grid.clr();
    eval(`var heuristic=${document.getElementById("heu").value}`);
    console.log(heuristic);
    grid.heuristic = heuristic;
    var startTime = performance.now()
    if (i == 0)
      grid.dijkstraexp(0).then(() => {
        grid.isFinding = false;
      });
    else if (i == 1)
      grid.astarexp(0).then(() => {
        grid.isFinding = false;
      });

    var endTime = performance.now()
    document.getElementById("time").innerHTML = ((endTime - startTime) / 1000).toFixed(3) + 's';
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mousePressed() {
  move = grid.isStartEnd(mouseX, mouseY);
}

function mouseDragged() {
  if (move != 0)
    grid.moveNode(mouseX, mouseY, move);
}

function draw() {
  clear();
  grid.display();
}