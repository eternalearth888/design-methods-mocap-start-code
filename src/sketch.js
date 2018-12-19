// Holds our socket server connection
let socket;


// positions
var mocapZ = 0;

// create water video canvas
var water;
// has the player started the game
var isGamePlaying = false;
var isTimeUp = false;
var isAllFished = false;

// GUI ANIMATION CAST TO START
var castStart;
var castStartAnimation;

// fishes
var fish1Animation;
let x = 0;
let y = 0;

var fishes = [];

// sharks
// var sharkAnimation;
// var sharks = [];

// bubbles
var bubbleAnimation;

// timer
var timer = 30; // 60 seconds


// preload animations
function preload() {
  // preload start gui animation
  castStartAnimation = loadAnimation("images/castStart/Frame001.png", "images/castStart/Frame012.png");

  // bubble animations
  // bubbleAnimation = loadAnimation()

  //fish animations
  fish1Animation = loadAnimation("images/greenFish/greenFish0000.png", "images/greenFish/greenFish0090.png");

  // sharkAnimation = loadAnimation("images/sharks/shark0000.png", "images/sharks/shark0090.png");
}

function setup() {

  // DONT CHANGE THIS, connection to mocap server
  socket = io('192.168.0.100:8000');
  // Setup a listener for the frame event containing rigid body data
  socket.on(
    'frame',
    function (data) {
      // PLACE YOUR CODE FOR HANDLING DATA HERE

      // Data here is an array of the rigid body objects from QTM
      // [{ x: int, y: int, z: int } ...]
      // x is the short side - max 3600 - min -2000
      // y is the long side - max 3500 - min -3500
      // If the body loses tracking, all three values will be null

      // Ex of drawing a circle with x and y coords from a rigid body
      // data[5] is bobber id for summer team
      if (data[7].y !== null) {
        // Map between two ranges
        x = (data[7].y + 3256) * (windowWidth / 3600) +200;
        y = (data[7].x - 1053) * (windowHeight / 1400);
        // fill (0);
        // ellipse(x, y, 20, 20);

        // positionvalues of the mocap
        // console.log("X: " + x);
        // console.log("Y: " + y);
        // // make sure mocap is under 200 for it to activate
        // console.log("Z: " + mocapZ);
      }
    }
  );

  // Put your setup code here
  // you can delete this if you want
  createCanvas(windowWidth, windowHeight);
  // CODE GOES HERE 
  // water video background
  water = createVideo('images/water.mp4');
  water.hide();

  // create start gui
  castStart = new StartGame();

  // POPULATE ARRAY OF FISH OBJECTS AND SHARKS
  for (var i = 0; i < 10; i++) {
    fishes.push(new FishGreen());
    // fishes.push(new Shark());
  }

}

function draw() {
  // Any draw loop code goes here
  // we always want the water background
  image(water, 0, 0);

  // WHEN THE GAME IS IN STANDBY
  if (!isGamePlaying) {
    // animate start gui
    castStart.display();
    // did someone hover over our graphic
    var d = dist(x, y, (windowWidth) / 2, (windowHeight) / 2);
    if (d < 300) {
      // delete animation by creating a new canvas for the game to begin
      isGamePlaying = true;
      water.loop();
    }
  }

  //START THE TIMER WHEN THE GAME STARTS
  if (isGamePlaying) {
    textAlign(CENTER, TOP);
    textSize(150);
    text(timer, windowWidth - 100, 5);
  }

  // PLAY GAME
  // DRAW AND DELETE FISH
  if (isGamePlaying && !isTimeUp) {
    // FISHES
    var fishToBeDeleted = -1;
    for (var i = 0; i < fishes.length; i++) {
      // if not deleted, keep moving
      fishes[i].move();
      fishes[i].display();

      if ((x > fishes[i].x) && (x < fishes[i].x + 150) && (y > fishes[i].y) && (y < fishes[i].y + 150)) {
        //delete fish from array
        fishToBeDeleted = i;
        console.log(fishToBeDeleted);
        // console.log("HOVER: " + fishes[i].x + ", " + fishes[i].y);
      }
    }

    if (fishToBeDeleted > -1) {
      fishes.splice(fishToBeDeleted, 1);
    }

    // SHARKS
    // var sharksToBeDeleted = -1;
    // for (var i = 0; i < sharks.length; i++) {
    //   // if not deleted, keep moving
    //   sharks[i].move();
    //   sharks[i].display();

    //   if ((x > sharks[i].x) && (x < sharks[i].x + 300) && (y > sharks[i].y) && (y < sharks[i].y + 300)) {
    //     //delete fish from array
    //     sharksToBeDeleted = i;
    //     console.log(sharksToBeDeleted);
    //     // console.log("HOVER: " + fishes[i].x + ", " + fishes[i].y);
    //   }
    // }

    // if (sharksToBeDeleted > -1) {
    //   sharks.splice(sharksToBeDeleted, 1);
    // }

    // TIMER CHANGES
    // if the frameCount is divisible by 60, then a second has passed. it will stop at 0
    if (frameCount % 60 == 0 && timer > 0) {
      timer--;
    }
    // did the timer end before you could catch all the fish
    if (timer == 0 && fishes.length != 0) {
      isTimeUp = true;
    } else if (timer > 0 && fishes.length == 0) {
      isAllFished = true;
    }
  }

  // GAME OVER SCREENS
  // timer is up before they catch all the fish
  if (isTimeUp) {
    textAlign(CENTER, CENTER);
    textSize(100);
    text("TIME IS UP", width / 2, height / 2);
  }

  if (isAllFished) {
    textAlign(CENTER, CENTER);
    textSize(100);
    text("GOT 'EM!", (windowWidth) / 2, (windowHeight ) / 2);
  }
}

// THIS IS HOW THE PROGRAM IS STARTED0
function keyPressed() {
  // water animation
  water.loop();
}

// FISHES
function FishGreen() {
  // initial left side of the screen
  this.x = random(0, (windowWidth  / 8));
  this.y = random(0, (windowHeight));
  this.speed = random(.5,2);
  this.frame = 0;
  this.numFrames = 91;

  this.display = function () {
    this.frame = this.frame >= this.numFrames ? 0 : this.frame + 1;
    fish1Animation.changeFrame(this.frame);
    animation(fish1Animation, this.x, this.y);
  }

  this.move = function () {
    if (this.x > (windowWidth) + 100) {
      this.x = 0;
    }
    this.x += (-this.speed, this.speed);
  }
}

// Shark class
function Shark() {
  // initial left side of the screen
  this.x = random(0, (windowWidth) / 8);
  this.y = random(0, (windowHeight));
  this.speed = random(.5,2);
  this.frame = 0;
  this.numFrames = 91;

  this.display = function () {
    this.frame = this.frame >= this.numFrames ? 0 : this.frame + 1;
    sharkAnimation.changeFrame(this.frame);
    animation(sharkAnimation, this.x, this.y);
  }

  this.move = function () {
    if (this.x > windowWidth + 100) {
      this.x = 0;
    }
    this.x += (-this.speed, this.speed);
  }
}


function StartGame() {
  this.display = function () {
    animation(castStartAnimation, (windowWidth) / 2, (windowHeight) / 2);
  }

}