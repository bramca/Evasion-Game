const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

var timer;
var obstacles = [];
var deltax = 150; // horizontale ruimte tussen obstakels
const deltaxmax = 270; // 240 vorige waarde 
const deltaxmin = 180; // 150 vorige waarde
var vertgap = 140;  // verticale ruimte tussen obstakels
const vertgapmin = 180; // 140 vorige waarde
const vertgapmax = 240; // 200 vorige waarde
var obstaclewidth = 20;
var obstaclecount = 3; // aantal obstakels
var player;
var paused = false;
var gameoverBool = false;
var gravityBool = true; // gebruikt voor gamemode 1
var frameRate = 10;
var colorcounter = 0; // hoe snel obstakels van kleur veranderen
var keyState = [];
var score = 0;
var mousecontrols = false;

document.body.scrollTop = 0;

window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    obstacles.forEach(function (e, i) {
        if (i % 2 === 1 && e.h < canvas.height) {
            e.h += canvas.height - e.h;
        }
        e.draw();
    }, this);
    player.draw();
    writeScore();
    if (paused) {
        pause();
    }
    if (gameoverBool) {
        gameover();
    }
}, true);

window.addEventListener("keydown", function (e) {
    // space en arrow keys
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

window.onload = function () {
    init();
    timer = setInterval(play, frameRate);
}

window.addEventListener("keydown", function (event) {
    keyState[event.keyCode] = true;
    var key = String.fromCharCode(event.keyCode);

    if (!gameoverBool && event.keyCode === 80) {
        paused = !paused;
        pause();
    } else if (gameoverBool && event.keyCode === 82) {
        restart();
    } else if (key === 'F') {
        toggleFullScreen();
    } else if (key === 'M') {
        mousecontrols = !mousecontrols;
    }
});

window.addEventListener("keyup", function (event) {
    keyState[event.keyCode] = false;
});

function updateposition(e) {
    if (mousecontrols) {
        player.x = e.clientX;
        player.y = e.clientY;
    }
}

function play() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].update();
        obstacles[i].draw();
        if (obstacles[i].x < (0 - deltax)) {
            obstacles.splice(i, 1);
        }
    }

    score += 1;
    writeScore();

    if (obstacles[obstacles.length - 1].x < (canvas.width + deltax)) {
        vertgap = randomNumberBetween(vertgapmin, vertgapmax);
        deltax = randomNumberBetween(deltaxmin, deltaxmax);
        var rh = randomNumberBetween(canvas.height / 4, canvas.height * 3 / 4);
        var obstacle = new Obstacle(obstacles[obstacles.length - 1].x + deltax, 0, obstaclewidth, rh);
        obstacle.draw();
        obstacles.push(obstacle);

        vertgap = randomNumberBetween(vertgapmin, vertgapmax);
        obstacle = new Obstacle(obstacle.x, obstacle.h + vertgap, obstacle.w, canvas.height - (obstacle.h + vertgap));
        obstacle.draw();
        obstacles.push(obstacle);
    }

    obstacles.forEach(function (element) {
        if ((player.x + player.cd / 2 >= element.x && player.x + player.cd / 2 <= element.x + obstaclewidth)
            || (player.x - player.cd / 2 >= element.x && player.x - player.cd / 2 <= element.x + obstaclewidth)) {
            if (element.y > 0 && player.y + player.cd / 2 >= element.y) {
                gameover();
            }

            if (element.y === 0 && player.y - player.cd / 2 <= element.h) {
                gameover();
            }
        }

        player.checkEdges(canvas);
        if (!gameoverBool) {
            player.draw();
        }

        if (player.y - player.cd / 2 < 0 || player.y + player.cd / 2 > canvas.height) {
            gameover();
        }

        // if (player.x-player.cd/2 < 0 || player.x+player.cd/2 > canvas.width) { // check voor gamemode 2
        //     gameover();
        // }
    }, this);

    if (!mousecontrols) {
        if (!paused && keyState[38]) { // up, gamemode 2/3
            player.update();
        }

        if (!paused && keyState[40]) { // down, gamemode 2/3
            player.gravity();
        }

        if (!paused && keyState[39]) { // right, gamemode 2/3
            player.updatex(1);
        }

        if (!paused && keyState[37]) { //left, gamemode 2/3
            player.updatex(-1);
        }
    }

    // if (!paused && keyState[32]) { // space, voor gamemode 1
    //     gravityBool = false;
    //     player.update();
    // } else {
    //     gravityBool = true;
    // }

    // player.gravity();

    if (score !== 0 && score % 2500 === 0) { // sneller na elke 25 punten 
        frameRate = (frameRate > 5 ? frameRate - 1 : frameRate);
        clearInterval(timer);
        timer = setInterval(play, frameRate);
    }
}

function pause() {
    if (paused) {
        clearInterval(timer);
        ctx.fillStyle = "rgb(140,140,140)";
        ctx.font = "30px Verdana";
        ctx.textAlign = "center";
        ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    } else {
        timer = setInterval(play, frameRate);
    }
}

function gameover() {
    gameoverBool = true;
    player.draw();
    ctx.fillStyle = "rgb(140,140,140)";
    ctx.font = "30px Verdana";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
    clearInterval(timer);
}

function restart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    obstacles = [];
    paused = false;
    gameoverBool = false;
    score = 0;
    frameRate = 10;
    init();
    timer = setInterval(play, frameRate);
}

function writeScore() {
    ctx.fillStyle = "rgb(140,140,140)";
    ctx.font = "30px Verdana";
    ctx.textAlign = "right";
    ctx.fillText(Math.floor(score / 100), canvas.width - 10, 40);
}

function init() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player = new Circle(canvas.width / 2, canvas.height / 2);
    player.draw();

    obstaclecount = Math.ceil(canvas.width / (obstaclewidth + deltax));

    writeScore();

    for (var i = 0; i < obstaclecount; i++) {
        vertgap = randomNumberBetween(vertgapmin, vertgapmax);
        deltax = randomNumberBetween(deltaxmin, deltaxmax);
        var rh = Math.floor(randomNumberBetween(canvas.height / 4, canvas.height * 3 / 4));
        var obstacle = new Obstacle((canvas.width - deltax) + i * deltax, 0, obstaclewidth, rh);
        obstacle.draw();
        obstacles.push(obstacle);

        vertgap = randomNumberBetween(vertgapmin, vertgapmax);
        obstacle = new Obstacle(obstacle.x, obstacle.h + vertgap, obstacle.w, canvas.height - (obstacle.h + vertgap));
        obstacle.draw();
        obstacles.push(obstacle);
    }
}

function Circle(x, y) {
    this.cd = 10;
    this.x = x;
    this.y = y;
    this.vup = 4;
    this.vdown = 4;
    this.vx = 4;
    // this.aup = 0.4;
    // this.adown = 0.1;
    this.color = "white";
    // var tempvup = 0;
    // var tempvdown = 0;
    // var oldvup = this.vup;
    // var oldvdown = this.vdown;

    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.cd, 0, 2 * Math.PI);
        ctx.fill();
    }

    this.update = function () {
        // this.vdown = oldvdown;
        // this.vup += this.aup;
        this.y -= this.vup;
    }

    this.updatex = function (dir) {
        this.x = (dir < 0 ? this.x - this.vx : this.x + Math.ceil(this.vx / 2));
    }

    this.gravity = function () {
        if (gravityBool) {
            // this.vup = oldvup;
            // this.vdown += this.adown;
            this.y += this.vdown;
        }
    }

    this.checkEdges = function (canvas) {
        if (this.x - this.cd / 2 < 0) {
            this.x = canvas.width - this.cd / 2;
        }

        if (this.x + this.cd / 2 > canvas.width) {
            this.x = 0 + this.cd / 2;
        }
    }
}

function Obstacle(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.w = w;
    this.v = randomNumberBetween(2, 5);
    this.color = generateRandomColor();

    this.update = function () {
        colorcounter = (colorcounter < 100 ? colorcounter + 1 : 0);
        if (colorcounter === 100) {
            this.color = generateRandomColor();
        }
        this.x -= this.v;
    }

    this.draw = function () {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

}

function randomNumberBetween(start, end) {
    return Math.floor(Math.random() * (end - start) + start);
}

function generateRandomColor() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var rgb = "rgb(" + r + "," + g + "," + b + ")";
    return rgb;
}

function toggleFullScreen() {
  if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
      (!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
    if (document.documentElement.requestFullScreen) {
      document.documentElement.requestFullScreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullScreen) {
      document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.cancelFullScreen) {
      document.cancelFullScreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    }
  }
}

