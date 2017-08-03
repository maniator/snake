export const createDotElement = ({ size = 10, extraClass = 'none' } = {}) => {
    const dot = document.createElement('div');

    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.classList.add('dot');
    dot.classList.add(extraClass);

    return dot;
};
