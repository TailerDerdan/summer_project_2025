import { HEIGHT_MAP, viewportHeight, viewportWidth, WIDTH_MAP } from "../sizes.js";

export const panOffset = {
    x: 0,
    y: 0,
}

const panFunction = (event) => {

    let {deltaX, deltaY} = event;

    panOffset.x += deltaX;
    panOffset.y += deltaY;

    if (panOffset.x < 0) panOffset.x = 0;
    if (panOffset.y < 0) panOffset.y = 0;

    if (panOffset.x > WIDTH_MAP - viewportWidth) panOffset.x = WIDTH_MAP - viewportWidth;
    if (panOffset.y > HEIGHT_MAP - viewportHeight) panOffset.y = HEIGHT_MAP - viewportHeight;
}

document.addEventListener("wheel", panFunction);