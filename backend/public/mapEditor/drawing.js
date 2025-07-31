import { COUNT_TILE_X, COUNT_TILE_Y, TILE_HEIGHT, TILE_WIDTH } from "./sizes.js";
import { panOffset, scaleData } from "./panning.js";
import { stateEditor } from "./state.js";
import { Building } from "./buildings/bulding.js";
import { car1, car2, choosenBuilding, connectionWalls, CountOfBuildings, floor, spawnWeapon, TypeBuilding, wall } from "./buildings/deterBuildings.js";

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
        Building.erasingOnMainCanvas(stateEditor.map.tileMap, stateEditor.map.buldingsObject, stateEditor.map.buldings, iterX, iterY);

        return;
    }
    if (drawing)
    {
        if (choosenBuilding.state >= TypeBuilding.Floor1 &&
            choosenBuilding.state <= TypeBuilding.Floor1 + CountOfBuildings.Floor - 1
        )
        {
            floor.drawOnMainCanvas(stateEditor.map.tileMap, stateEditor.map.buldingsObject, stateEditor.map.buldings, iterX, iterY);
        }

        if (choosenBuilding.state >= TypeBuilding.Wall1 &&
            choosenBuilding.state <= TypeBuilding.Wall1 + CountOfBuildings.Wall - 1
        )
        {
            wall.drawOnMainCanvas(stateEditor.map.tileMap, stateEditor.map.buldingsObject, stateEditor.map.buldings, iterX, iterY);
        }
        if (choosenBuilding.state >= TypeBuilding.Car11 &&
            choosenBuilding.state <= TypeBuilding.Car11 + CountOfBuildings.Car1 - 1
        )
        {
            car1.drawOnMainCanvas(stateEditor.map.tileMap, stateEditor.map.buldingsObject, stateEditor.map.buldings, iterX, iterY);
        }
        if (choosenBuilding.state >= TypeBuilding.Car21 &&
            choosenBuilding.state <= TypeBuilding.Car21 + CountOfBuildings.Car2 - 1
        )
        {
            car2.drawOnMainCanvas(stateEditor.map.tileMap, stateEditor.map.buldingsObject, stateEditor.map.buldings, iterX, iterY);
        }
        if (choosenBuilding.state >= TypeBuilding.ConnectionWalls1 &&
            choosenBuilding.state <= TypeBuilding.ConnectionWalls1 + CountOfBuildings.ConnectionWalls - 1
        )
        {
            connectionWalls.drawOnMainCanvas(stateEditor.map.tileMap, stateEditor.map.buldingsObject, stateEditor.map.buldings, iterX, iterY);
        }
        if (choosenBuilding.state >= TypeBuilding.SpawnWeapon1 &&
            choosenBuilding.state <= TypeBuilding.SpawnWeapon1 + CountOfBuildings.SpawnWeapon - 1
        )
        {
            let isProbablyPutSpawn = true;
            for (const spawn of stateEditor.map.spawnsWeapons)
            {
                console.log(Math.abs((spawn.x / COUNT_TILE_X) - iterX))
                if (Math.abs((spawn.x / COUNT_TILE_X) - iterX) < 35 && Math.abs((spawn.y / COUNT_TILE_Y) - iterY) < 35)
                {
                    isProbablyPutSpawn = false;
                    break;
                }
            }
            if (isProbablyPutSpawn)
            {
                spawnWeapon.drawOnMainCanvas(stateEditor.map.tileMap, stateEditor.map.buldingsObject, stateEditor.map.buldings, iterX, iterY);
                stateEditor.map.spawnsWeapons.push({x: iterX * COUNT_TILE_X, y: iterY * COUNT_TILE_Y});
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
    }
    if (choosenBuilding.rotation == 360)
    {
        choosenBuilding.rotation = 0;
    }
    console.log(choosenBuilding.rotation)
}


export function applyEventsToCanvas(canvas)
{
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('contextmenu', handleLeftMouseDown);
    document.addEventListener('keydown', rotationObject);
}