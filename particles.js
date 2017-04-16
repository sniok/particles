var dt2 = 100.0 / (60.0 * 60.0);
var mouse = {
  isDown: false,
  x: 0,
  y: 0
};
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var PARTICLES_COUNT = 200e3;
var particles = populate(PARTICLES_COUNT);
var frameTime = 0;
var now = 0;

/**
 * Main loop
 */
loop();

function loop() {
  update(particles, mouse);
  draw(particles, ctx);
  frameTime = ~~(1000 / (Date.now() - now));
  now = Date.now();

  requestAnimationFrame(function () {
    loop();
  });
}

/**
 *  Particle structure
 * 
 *  x, y, velX, velY, homeX, homeY, damping
 *  0  1  2     3     4      5      6
 */
function populate(amount) {
  var X7 = amount * 7; // 7 floats per particle
  var a = new Float64Array(PARTICLES_COUNT * 7); // reserve some space
  var i = 0;
  while (i < X7) {
    var x = 256 + Math.sin(i) * (1 / amount) * i * 20;
    var y = 256 + Math.cos(i) * (1 / amount) * i * 20;
    a[i++] = x; // Position X
    a[i++] = y; // Position Y
    a[i++] = Math.random() * 2 - 1; // Velocity X
    a[i++] = Math.random() * 2 - 1; // Velocity Y
    a[i++] = x; // Home position X
    a[i++] = y; // Home position Y
    a[i++] = 1 - (Math.random() + 0.1) / 100; // Damping
  }
  return a;
}

function draw(a, ctx) {
  var data = new ImageData(512, 512); // this way is slightly faster than .createImageData
  var pixData = data.data; // deataching data increases performance
  var totalPixels = 1048576; // 512 * 512 * 4
  for (var i = 0; i < PARTICLES_COUNT; ++i) {
    var ind = ~~a[i * 7] * 4 + ~~a[i * 7 + 1] * 2048; // getting pixel index from x and y
    if (~ind & totalPixels && ~a[i * 7] & 512 && ~a[i * 7 + 1] & 512) {
      // Red
      pixData[ind] = a[i * 7 + 4] / 512 * 255;
      // Green
      pixData[ind + 1] = a[i * 7 + 5] / 512 * 205;
      // Blue
      pixData[ind + 2] = 200;
      // Alpha
      pixData[ind + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
}

function update(A, mouse) {
  for (var i = 0; i < PARTICLES_COUNT; ++i) {
    var x = i * 7;

    if (mouse.isDown) {
      var dx = A[x] - mouse.x;
      var dy = A[x + 1] - mouse.y;
      var d = Math.sqrt(dx * dx + dy * dy);

      A[x + 2] = A[x + 2] - 15 * dx / (d * d + 5);
      A[x + 3] = A[x + 3] - 15 * dy / (d * d + 5);
    }

    // slow down
    A[x + 2] = A[x + 2] * A[x + 6];
    A[x + 3] = A[x + 3] * A[x + 6];

    // update position
    A[x] = A[x] + A[x + 2] + (A[x + 4] - A[x]) * dt2;
    A[x + 1] = A[x + 1] + A[x + 3] + (A[x + 5] - A[x + 1]) * dt2;
  }
}

/**
 * Mouse
 */

function pointerDown(e) {
  var rect = c.getBoundingClientRect();
  var x = e.clientX || e.targetTouches[0].clientX;
  var y = e.clientY || e.targetTouches[0].clientY;
  mouse.x = (x - rect.left) / 1.2;
  mouse.y = (y - rect.top) / 1.2;
  mouse.isDown = true;
}

function pointerMove(e) {
  var rect = c.getBoundingClientRect();
  mouse.x = (e.clientX - rect.left) / 1.2;
  mouse.y = (e.clientY - rect.top) / 1.2;
}

function pointerUp(e) {
  mouse.isDown = false;
}

c.addEventListener("mousedown", pointerDown, false);
c.addEventListener("mousemove", pointerMove, false);
c.addEventListener("mouseup", pointerUp, false);
c.addEventListener("touchstart", pointerDown, false);
c.addEventListener("touchend", pointerUp, false);
c.addEventListener("touchcancel", pointerUp, false);

/**
 * UI
 */
function settings() {
  newParticles = parseInt(document.getElementById("count").value);
  PARTICLES_COUNT = newParticles;
  particles = populate(newParticles);
}

var fpsCounter = document.getElementById("fps");
setInterval(
  () => {
    fpsCounter.innerHTML = frameTime + " fps";
    if (frameTime < 30) {
      fpsCounter.style.color = "red";
    } else if (frameTime < 50) {
      fpsCounter.style.color = "yellow";
    } else {
      fpsCounter.style.color = "lightgreen";
    }
  },
  500
);