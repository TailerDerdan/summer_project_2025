import { HEIGHT_MAP, viewportHeight, viewportWidth, WIDTH_MAP } from "./sizes.js";
import { stateEditor } from "./state.js";

export const panOffset = {
    x: 0,
    y: 0,
}

export const scaleData = {
    scale: 0.5,
    scaleOffset: {x: 0, y: 0},
}

const panFunction = (event) => {

    let {deltaX, deltaY} = event;

    if (event.shiftKey)
    {
        if (deltaY < 0 || deltaX < 0)
        {
            scaleData.scale += 0.1;
        }
        if (deltaY > 0 || deltaX > 0)
        {
            scaleData.scale += -0.1;
        }
    }

    scaleData.scale = Math.trunc(scaleData.scale * 10) / 10;

    panOffset.x += deltaX;
    panOffset.y += deltaY;

    const scaledWidth = stateEditor.canvas.width * scaleData.scale;
    const scaledHeight = stateEditor.canvas.height * scaleData.scale;
    const scaleOffsetX = (scaledWidth - stateEditor.canvas.width) / 2;
    const scaleOffsetY = (scaledHeight - stateEditor.canvas.height) / 2;
    scaleData.scaleOffset.x = scaleOffsetX;
    scaleData.scaleOffset.y = scaleOffsetY;

    if ((panOffset.x * scaleData.scale - scaleData.scaleOffset.x) / scaleData.scale < 0) panOffset.x = 0 + scaleData.scaleOffset.x / scaleData.scale;
    if ((panOffset.y * scaleData.scale - scaleData.scaleOffset.y) / scaleData.scale < 0) panOffset.y = 0 + scaleData.scaleOffset.y / scaleData.scale;

    if ((panOffset.x * scaleData.scale - scaleData.scaleOffset.x) / scaleData.scale > WIDTH_MAP - viewportWidth) panOffset.x = ((WIDTH_MAP - viewportWidth) * scaleData.scale + scaleData.scaleOffset.x) / scaleData.scale;
    if ((panOffset.y * scaleData.scale - scaleData.scaleOffset.y) / scaleData.scale > HEIGHT_MAP - viewportHeight) panOffset.y = ((HEIGHT_MAP - viewportHeight) * scaleData.scale + scaleData.scaleOffset.y) / scaleData.scale;

    if (scaleData.scale < 0.1)
    {
        scaleData.scale = 0.1;
    }
    if (scaleData.scale > 1)
    {
        scaleData.scale = 1;
    }

    console.log(scaleData, panOffset)
}

document.addEventListener("wheel", panFunction);