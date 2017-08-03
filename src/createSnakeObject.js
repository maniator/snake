import {createDotElement} from "./dot.js";
import {generateRandomFromZero} from "./generateRandomFromZero.js";

export const createSnakeObject = ({ width, height, board, dotSize = 10, }) => {
    const snake = [];
    const dot = createDotElement({ size: dotSize });

    board.appendChild(dot);

    snake.push({
        dot,
    });

    const numberOfDotWidth = width / dotSize;
    const numberOfDotHeight = height / dotSize;

    dot.style.top = `${generateRandomFromZero(numberOfDotHeight) * dotSize}px`;
    dot.style.left = `${generateRandomFromZero(numberOfDotWidth) * dotSize}px`;

    return snake;
};
