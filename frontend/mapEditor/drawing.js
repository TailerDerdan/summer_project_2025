import { COUNT_TILE_X, TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";
import { choosenBuilding, CountOfBuildings, TypeBuilding } from "./fillingBuldings.js";
import { panOffset, scaleData } from "./panning.js";
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

    let iterX = Math.floor((offsetX + panOffset.x * scaleData.scale - scaleData.scaleOffset.x) / scaleData.scale / TILE_WIDTH);
    let iterY = Math.floor((offsetY + panOffset.y * scaleData.scale - scaleData.scaleOffset.y) / scaleData.scale / TILE_HEIGHT);

    if (erasing)
    {
        stateEditor.map.tileMap[iterY * COUNT_TILE_X + iterX] = 0;
        stateEditor.map.buldings[iterY * COUNT_TILE_X + iterX] = 0;

        const wall = stateEditor.map.buldingsObject.find((elem) => {
            if (elem.x == iterX && elem.y == iterY) return true;
        });

        if (wall)
        {
            const indexDeletedWall = stateEditor.map.buldingsObject.indexOf(wall);
            stateEditor.map.buldingsObject.splice(indexDeletedWall, 1);
        }

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

            const wall = stateEditor.map.buldingsObject.find((elem) => {
                if (elem.x == iterX && elem.y == iterY) return true;
            });

            if (wall == undefined)
            {
                stateEditor.map.buldingsObject.push({x: iterX, y: iterY, choosenBuilding: choosenBuilding.state, rotation: choosenBuilding.rotation});
            }
        }
    }
    
}

const handleMouseUp = (event) => {
    
    drawing = false;
    erasing = false;
}

const rotationObject = (event) => {
    
    if (event.key == 'к' || event.key == 'К' || event.key == 'r' || event.key == 'R')
    {
        choosenBuilding.rotation += 90;
        console.log(choosenBuilding.rotation)
    }
    if (choosenBuilding.rotation == 360)
    {
        choosenBuilding.rotation = 0;
    }
}


export function applyEventsToCanvas(canvas)
{
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('contextmenu', handleLeftMouseDown);
    document.addEventListener('keydown', rotationObject);
}