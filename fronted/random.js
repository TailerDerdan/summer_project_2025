import { HEIGHT_MAP, WIDTH_MAP } from "./map/map.js";

export function randomPosition()
{
    let x = Math.random() * WIDTH_MAP;
    let y = Math.random() * HEIGHT_MAP;

    return {x: x, y: y};
}