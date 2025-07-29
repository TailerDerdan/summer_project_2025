import { HEIGHT_MAP, WIDTH_MAP } from "./sizes.js";


export function randomPosition()
{
    let x = Math.random() * WIDTH_MAP;
    let y = Math.random() * HEIGHT_MAP;

    return {x: x, y: y};
}

export function randomMinMax(min, max)
{
    return Math.random() * (max - min) + min;
}