import {createSnakeObject} from "./createSnakeObject.js";
import {createDotElement} from "./dot.js";
import {generateRandomFromZero} from "./generateRandomFromZero.js";

const Arrows = {
    'ArrowUp': [0, -1],
    'ArrowDown': [0, 1],
    'ArrowLeft': [-1, 0],
    'ArrowRight': [1, 0],
};

export class Board {
    constructor ({ width = 200, height = 200, speed = 200, dotSize = 10 } = {}) {
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.dotSize = dotSize;

        // need to do this so we do not have to rebind later
        this.keyupEvent = this.keyupEvent.bind(this);
        this.generateNextDot = this.generateNextDot.bind(this);

        this.addTitleCard();

        this.listenForEnterEvent();
    }

    newGame () {
        if (this.board) {
            clearTimeout(this.currentTimeout);
            document.body.removeChild(this.board);
            document.body.removeChild(this.scoreCard);
        }

        this.removeEvents();
        this.listenToEvents();

        // this is the snake map so that we can track where the snake is on the board
        this.dotMap = new Map();
        this.currentFood = null;

        this.board = this.createBoard();
        document.body.appendChild(this.board);

        this.score = 0;
        this.scoreCard = this.createScoreCard();
        document.body.appendChild(this.scoreCard);

        this.snake = this.createSnakeObject();

        this.generateFoodDot();

        this.startGame();
    }

    createBoard () {
        const board = document.createElement('div');

        board.style.width = `${this.width}px`;
        board.style.height = `${this.height}px`;

        board.classList.add('board');

        return board;
    }

    createScoreCard () {
        const scoreCard = document.createElement('div');

        scoreCard.classList.add('score');

        scoreCard.textContent = 1;

        return scoreCard;
    }

    createSnakeObject () {
        const snake = createSnakeObject({
            width: this.width,
            height: this.height,
            board: this.board,
            dotSize: this.dotSize,
        });

        this.snakeLength = 1;
        // @todo make starting direction random
        this.currentDirection = Arrows.ArrowRight;
        this.currentDot = snake[0].dot;
        const { top, left } = this.currentDot.style;

        this.dotMap.set(`${top}|${left}`, this.currentDot);

        return snake;
    }

    generateFoodDot () {
        const numberOfDotWidth = this.width / this.dotSize;
        const numberOfDotHeight = this.height / this.dotSize;
        let newTop = generateRandomFromZero(numberOfDotHeight) * this.dotSize;
        let newLeft = generateRandomFromZero(numberOfDotWidth) * this.dotSize;
        let foodDot;

        // make sure we don't put a food dot in the path that the snake exists in already
        while (this.dotMap.has(`${newTop}px|${newLeft}px`)) {
            newTop = generateRandomFromZero(numberOfDotHeight) * this.dotSize;
            newLeft = generateRandomFromZero(numberOfDotWidth) * this.dotSize;
        }

        // create the foodDot once it has been established in the right location
        foodDot = createDotElement({ size: this.dotSize, extraClass: 'food' });

        if (this.currentFood) {
            this.board.removeChild(this.currentFood);
        }

        // add the food to the board
        this.board.appendChild(foodDot);
        this.currentFood = foodDot;

        foodDot.style.top = `${newTop}px`;
        foodDot.style.left = `${newLeft}px`;

        const { top, left } = this.currentFood.style;

        const foodLeft = Number(left.match(/\d+/gi));
        const foodTop = Number(top.match(/\d+/gi));

        this.foodLocation = [ foodLeft, foodTop ];

        return foodDot;
    }

    gameOver ({ noMessage = false } = {}) {
        clearTimeout(this.currentTimeout);
        this.removeEvents();

        const gameOverDiv = document.createElement('div');
        const instructionsDiv = document.createElement('div');

        if (!noMessage) {
            this.scoreCard.appendChild(gameOverDiv);
            gameOverDiv.textContent = 'GAME OVER';
        } else if (this.scoreCard) {
            this.scoreCard.textContent = '';
            this.scoreCard.classList.add('no-content');
        }

        this.scoreCard.appendChild(instructionsDiv);
        instructionsDiv.textContent = 'Press ENTER key for new game';
    }

    generateNextDot ({ timeout = true } = {}) {
        const { top, left } = this.currentDot.style;

        const topPx = Number(top.match(/\d+/gi));
        const leftPx = Number(left.match(/\d+/gi));

        const [ fromLeft, fromTop ] = this.currentDirection;
        const newTop = topPx + (fromTop * this.dotSize);
        const newLeft = leftPx + (fromLeft * this.dotSize);

        // clear out timeout if changed direction
        if (!timeout) {
            clearTimeout(this.currentTimeout);
        }

        if (newTop < 0 || newLeft < 0 || newTop >= this.height || newLeft >= this.width) {
            this.gameOver();
        } else {
            this.createNextDotInChain({ newLeft, newTop });
        }
    }

    createNextDotInChain({ newLeft, newTop }) {
        const newDot = createDotElement({
            size: this.dotSize,
        });

        this.snake.push({
            dot: newDot,
        });

        newDot.style.top = `${newTop}px`;
        newDot.style.left = `${newLeft}px`;

        const [ foodLeft, foodTop ] = this.foodLocation;

        // eat the food dot
        if (newLeft === foodLeft && newTop === foodTop) {
            this.snakeLength += 1;
            this.scoreCard.textContent = this.snakeLength;
            this.generateFoodDot();
        }

        if (this.snake.length > this.snakeLength) {
            const { dot } = this.snake.shift();
            const { top, left } = dot.style;
            // remove from the map
            this.dotMap.delete(`${top}|${left}`);

            this.board.removeChild(dot);
        }

        this.board.appendChild(newDot);

        this.currentDot = newDot;

        // check to make sure we are not overlapping on the snake
        if (this.dotMap.has(`${newTop}px|${newLeft}px`)) {
            this.gameOver();
        } else {
            this.currentTimeout = setTimeout(this.generateNextDot, this.speed);

            this.dotMap.set(`${newTop}px|${newLeft}px`, this.currentDot);
        }
    }

    startGame () {
        this.currentTimeout = setTimeout(this.generateNextDot, this.speed);
    }

    keyupEvent ({code}) {
        if (Arrows[code]) {
            this.currentDirection = Arrows[code];
            this.generateNextDot({ timeout: false });
        }
    }

    removeEvents () {
        document.removeEventListener('keyup', this.keyupEvent, false);
    }

    listenForEnterEvent () {
        document.addEventListener('keyup', ({code}) => {
            if (code === 'Enter') {
                this.newGame();
            }
        }, false);
    }

    listenToEvents () {
        document.addEventListener('keyup', this.keyupEvent, false);
    }

    addTitleCard() {
        const titleCard = document.createElement('h2');

        titleCard.textContent = 'Snake';
        titleCard.classList.add('title');

        document.body.appendChild(titleCard);
    }
}
