import { COUNT_TILE_X, TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";
import { choosenBuilding, CountOfBuildings, TypeBuilding } from "./fillingBuldings.js";
import { panOffset } from "./panning.js";
import { stateEditor } from "./state.js";

let drawing = false;
let erasing = false;

const handleMouseDown = (event) => {
    
    event.preventDefault();
    if (event.button === 0 && event.altKey)
    {
        erasing = true;
        return;
    }
    else if (event.button === 0)
    {
        drawing = true;
        return;
    }
    
}

const handleLeftMouseDown = (event) => {

    event.preventDefault();
}

const handleMouseMove = (event) => {
    
    if (!drawing && !erasing)
    {
        return;
    }

    const {offsetX, offsetY} = event;

    let iterX = Math.floor((offsetX + panOffset.x) / TILE_WIDTH);
    let iterY = Math.floor((offsetY + panOffset.y) / TILE_HEIGHT);

    console.log(iterX, iterY);

    if (erasing)
    {
        stateEditor.map.tileMap[iterY * COUNT_TILE_X + iterX] = 0;
        stateEditor.map.buldings[iterY * COUNT_TILE_X + iterX] = 0;
        return;
    }
    if (drawing)
    {
        if (choosenBuilding.state >= TypeBuilding.Floor1 &&
            choosenBuilding.state <= TypeBuilding.Floor1 + CountOfBuildings.Floor - 1
        )
        {
            stateEditor.map.tileMap[iterY * COUNT_TILE_X + iterX] = choosenBuilding.state;
        }

        if (choosenBuilding.state >= TypeBuilding.Wall1 &&
            choosenBuilding.state <= TypeBuilding.Wall1 + CountOfBuildings.Wall - 1
        )
        {
            stateEditor.map.buldings[iterY * COUNT_TILE_X + iterX] = choosenBuilding.state;
        }
    }
    
}

const handleMouseUp = (event) => {
    
    drawing = false;
    erasing = false;
}

export function applyEventsToCanvas(canvas)
{
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('contextmenu', handleLeftMouseDown);
}