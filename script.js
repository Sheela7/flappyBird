class FlappyBird {
  constructor() {
    this.GRAVITY = 0.2;
    this.BACKGROUND_SPEED = 3;
    this.BACKGROUND = document.querySelector(".background");
    this.BIRD = document.querySelector(".bird");
    this.START_MESSAGE = document.querySelector(".start-message");
    this.RESTART_MESSAGE = document.querySelector(".restart-message");
    this.SCORE = document.querySelector(".score");
    this.HIGH_SCORE = document.querySelector(".high-score"); // New line: reference to high score element
    this.START_BUTTON = document.getElementById("startButton");
    this.RESTART_BUTTON = document.getElementById("restartButton");
    this.BACKGROUND_RECT = this.BACKGROUND.getBoundingClientRect();
    this.GAME_STATE = "Start";
    this.BIRD_PROPS = null;
    this.PIPES = [];
    this.PIPE_SEPARATION = 200;
    this.score = 0;
    this.previousHighScore = localStorage.getItem("flappyHighestScore") || 0;
    this.highScore = 0; // New line: variable to store high score
    this.animationFrame = null;
  }

  start() {
    this.START_BUTTON.addEventListener("click", () => {
      this.restartGame();
      this.GAME_STATE = "Play";
      this.START_MESSAGE.innerHTML = "";
      this.RESTART_MESSAGE.innerHTML = "";
      this.START_BUTTON.style.display = "none";
      this.RESTART_BUTTON.style.display = "none";
      this.init();
    });
  }

  init() {
    document.addEventListener("keyup", (e) => this.keyUp(e));
    this.animationFrame = requestAnimationFrame(() => this.update());
    this.generatePipes();
  }

  update() {
    if (this.GAME_STATE === "Play") {
      this.moveBackground();
      this.applyGravity();
      this.moveBird();
      this.movePipes();
      this.checkCollision();
      this.updateScore();
      this.animationFrame = requestAnimationFrame(() => this.update());
    }
  }

  moveBackground() {
    const parallax = this.BACKGROUND_SPEED * 0.5;
    const backgroundPosition = parseInt(
      getComputedStyle(this.BACKGROUND).backgroundPositionX
    );
    this.BACKGROUND.style.backgroundPositionX =
      backgroundPosition - parallax + "px";
  }

  applyGravity() {
    if (!this.BIRD_PROPS) {
      this.BIRD_PROPS = {
        top: this.BIRD.offsetTop,
        height: this.BIRD.offsetHeight,
        velocity: 0,
      };
    }
  }

  moveBird() {
    if (
      this.BIRD_PROPS.top + this.BIRD_PROPS.height <
      this.BACKGROUND_RECT.height
    ) {
      this.BIRD_PROPS.velocity += this.GRAVITY;
      this.BIRD_PROPS.top += this.BIRD_PROPS.velocity;
      this.BIRD.style.top = this.BIRD_PROPS.top + "px";

      // Apply rotation to the bird's face
      const rotationAngle = this.BIRD_PROPS.velocity < 0 ? -20 : 20;
      this.BIRD.style.transform = `rotate(${rotationAngle}deg)`;
    } else {
      this.gameOver();
    }
  }

  generatePipes() {
    const currentPipes = this.PIPES.length || 0;
    if (currentPipes === 0 || currentPipes < 2) {
      for (let i = currentPipes; i <= 3; i++) {
        this.generateSinglePipe(i);
      }
    }
  }

  generateSinglePipe(index) {
    const pipePair = this.createPipePair(index);
    this.PIPES.push(pipePair);
  }

  createPipePair(index) {
    const pipePair = {
      topPipe: document.createElement("div"),
      bottomPipe: document.createElement("div"),
      right: -((index - 1) * (this.BACKGROUND_RECT.width * 0.3)),
      passed: false,
    };

    pipePair.topPipe.className = "pipes";
    pipePair.bottomPipe.className = "pipes";
    const topPipeHeight = this.randomPipeHeight();
    pipePair.topPipe.style.height = topPipeHeight + "px";
    pipePair.topPipe.style.transform = "rotate(180deg)";

    const bottomPipeHeight =
      this.BACKGROUND_RECT.height - (topPipeHeight + this.PIPE_SEPARATION);
    pipePair.bottomPipe.style.height = bottomPipeHeight + "px";
    pipePair.bottomPipe.style.bottom = "0px";

    this.BACKGROUND.appendChild(pipePair.topPipe);
    this.BACKGROUND.appendChild(pipePair.bottomPipe);
    return pipePair;
  }

  randomPipeHeight() {
    const minHeight = 100;
    const maxHeight = this.BACKGROUND_RECT.height - this.PIPE_SEPARATION;
    return Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
  }

  movePipes() {
    for (let i = 0; i < this.PIPES.length; i++) {
      const pipePair = this.PIPES[i];

      pipePair.right += this.BACKGROUND_SPEED;
      pipePair.topPipe.style.right = pipePair.right + "px";
      pipePair.bottomPipe.style.right = pipePair.right + "px";

      if (pipePair.right > this.BACKGROUND_RECT.width) {
        this.PIPES.splice(i, 1);
        this.BACKGROUND.removeChild(pipePair.topPipe);
        this.BACKGROUND.removeChild(pipePair.bottomPipe);
        i--;
        this.generateSinglePipe(2);
      }
    }
  }

  checkCollision() {
    const birdRect = this.BIRD.getBoundingClientRect();

    for (const pipePair of this.PIPES) {
      const topPipeRect = pipePair.topPipe.getBoundingClientRect();
      const bottomPipeRect = pipePair.bottomPipe.getBoundingClientRect();

      if (
        this.checkRectCollision(birdRect, topPipeRect) ||
        this.checkRectCollision(birdRect, bottomPipeRect)
      ) {
        this.gameOver();
        return;
      }

      if (!pipePair.passed && birdRect.left > topPipeRect.right) {
        pipePair.passed = true;
        this.score++;
      }
    }
  }

  checkRectCollision(rect1, rect2) {
    return (
      rect1.right > rect2.left &&
      rect1.left < rect2.right &&
      rect1.bottom > rect2.top &&
      rect1.top < rect2.bottom
    );
  }

  updateScore() {
    this.SCORE.innerHTML = "Score: " + this.score;
    this.updateHighScore();
  }

  updateHighScore() {
    this.HIGH_SCORE.innerHTML = "High Score: " + this.previousHighScore;
    if (this.score > this.previousHighScore) {
      this.highScore = this.score;
      this.HIGH_SCORE.innerHTML = "New High Score: " + this.highScore;
    }
  }

  gameOver() {
    console.log("Game overr");
    this.GAME_STATE = "Game Over";
    cancelAnimationFrame(this.animationFrame);
    if (this.score > this.previousHighScore) {
      this.previousHighScore = this.score;
      localStorage.setItem("flappyHighestScore", this.previousHighScore);
    }
    this.RESTART_MESSAGE.innerHTML =
      "Press Restart button to re-start the game.";
    this.RESTART_BUTTON.style.display = "block";
    this.RESTART_MESSAGE.style.display = "block";
    this.RESTART_BUTTON.addEventListener("click", () => {
      this.removePreviousPipes();
      this.restartGame();
      this.GAME_STATE = "Play";
      this.RESTART_MESSAGE.innerHTML = "";
      this.RESTART_BUTTON.style.display = "none";
      this.init();
    });
  }

  removePreviousPipes() {
    for (let i = 0; i < this.PIPES.length; i++) {
      const pipePair = this.PIPES[i];
      this.PIPES.splice(i, 1);
      this.BACKGROUND.removeChild(pipePair.topPipe);
      this.BACKGROUND.removeChild(pipePair.bottomPipe);
      i--;
    }
  }

  restartGame() {
    this.BIRD_PROPS = null;
    this.PIPES = [];
    this.score = 0;
    this.SCORE.innerHTML = "Score: " + this.score;
    this.BIRD.style.top = "40vh";
  }

  keyUp(e) {
    if (e.key === " ") {
      this.BIRD_PROPS.velocity = -5;
    }
  }
}

const game = new FlappyBird();
game.start();
