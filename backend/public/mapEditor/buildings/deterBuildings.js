import { TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";
import { Building } from "./bulding.js";

export const TypeBuilding = {};

export const CountOfBuildings = {
    Floor: 14,
    Wall: 2,
    Car1: 1,
    Car2: 1,
    SpawnWeapon: 1,
    ConnectionWalls: 3,
}

export const choosenBuilding = {
    state: 0,
    rotation: 0,
};

export const SPRITE_FLOOR_WIDTH = 16;
export const SPRITE_FLOOR_HEIGHT = 16;

export const SPRITE_WALL_WIDTH = 8;
export const SPRITE_WALL_HEIGHT = 32;

export const SPRITE_CAR1_WIDTH = 96;
export const SPRITE_CAR1_HEIGHT = 128;

export const SPRITE_CAR2_WIDTH = 64;
export const SPRITE_CAR2_HEIGHT = 128;

export const floor = new Building(
    SPRITE_FLOOR_WIDTH,
    SPRITE_FLOOR_HEIGHT,
    TILE_WIDTH,
    TILE_HEIGHT,
    CountOfBuildings.Floor,
    true,
    0,
    "../mapEditor/sprites/level1/floorSprites.png",
    "Floor"
);

export const wall = new Building(
    SPRITE_WALL_WIDTH,
    SPRITE_WALL_HEIGHT,
    SPRITE_WALL_WIDTH,
    SPRITE_WALL_HEIGHT,
    CountOfBuildings.Wall,
    false,
    0,
    "../mapEditor/sprites/level1/wallSprites.png",
    "Wall"
);

export const car1 = new Building(
    SPRITE_CAR1_WIDTH,
    SPRITE_CAR1_HEIGHT,
    SPRITE_CAR1_WIDTH,
    SPRITE_CAR1_HEIGHT,
    CountOfBuildings.Car1,
    false,
    0,
    "../mapEditor/sprites/level1/car1.png",
    "Car1"
);

export const car2 = new Building(
    SPRITE_CAR2_WIDTH,
    SPRITE_CAR2_HEIGHT,
    SPRITE_CAR2_WIDTH,
    SPRITE_CAR2_HEIGHT,
    CountOfBuildings.Car2,
    false,
    0,
    "../mapEditor/sprites/level1/car2.png",
    "Car2"
);

export const spawnWeapon = new Building(
    TILE_WIDTH,
    TILE_HEIGHT,
    TILE_WIDTH,
    TILE_HEIGHT,
    1,
    false,
    0,
    "../mapEditor/sprites/level1/spawnWeapon.png",
    "SpawnWeapon"
);

export const connectionWalls = new Building(
    TILE_WIDTH,
    TILE_HEIGHT,
    TILE_WIDTH,
    TILE_HEIGHT,
    CountOfBuildings.ConnectionWalls,
    false,
    0,
    "../mapEditor/sprites/level1/connectionWalls.png",
    "ConnectionWalls"
);

floor.fillSprite(1, TypeBuilding, 7, 4);
wall.fillSprite(TypeBuilding.Floor1 + CountOfBuildings.Floor + 1, TypeBuilding, 1, 2);
car1.fillSprite(TypeBuilding.Wall1 + CountOfBuildings.Wall + 1, TypeBuilding, 1, 1);
car2.fillSprite(TypeBuilding.Car11 + CountOfBuildings.Car2 + 1, TypeBuilding, 1, 1);
spawnWeapon.fillSprite(TypeBuilding.Car21 + CountOfBuildings.SpawnWeapon + 1, TypeBuilding, 1, 1);
connectionWalls.fillSprite(TypeBuilding.SpawnWeapon1 + CountOfBuildings.ConnectionWalls + 1, TypeBuilding, 3, 3);

console.log(TypeBuilding)

const spritesFloor = document.getElementsByClassName("floor")[0];
const spritesWall = document.getElementsByClassName("wall")[0];
const spritesCar1 = document.getElementsByClassName("car1")[0];
const spritesCar2 = document.getElementsByClassName("car2")[0];
const spritesSpawnWeapon = document.getElementsByClassName("spawnWeapon")[0];
const spritesConnectionWalls = document.getElementsByClassName("connectionWalls")[0];

const divSprites = document.getElementsByClassName("choosen-sprites")[0];
const canvasForSprite = document.getElementById("sprites");
const ctxForSprite = canvasForSprite.getContext('2d');

canvasForSprite.width = divSprites.clientWidth;
canvasForSprite.height = divSprites.clientHeight;

window.addEventListener("load", () => {

    canvasForSprite.width = canvasForSprite.offsetWidth;
    canvasForSprite.height = canvasForSprite.offsetHeight;
})

const boundHandlersForBuildings = {
    floor: null,
    wall: null,
    car1: null,
    car2: null,
    spawnWeapon: null,
    connectionWalls: null,
}

spritesFloor.addEventListener("mousedown", (event) => {
    
    floor.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    for (const key in boundHandlersForBuildings)
    {
        if (boundHandlersForBuildings[key])
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings[key]);
            boundHandlersForBuildings[key] = null;
        }
    }

    boundHandlersForBuildings.floor = floor.interactionWithBuilding.bind(floor);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.floor);
})

spritesWall.addEventListener("mousedown", (event) => {
    
    wall.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    for (const key in boundHandlersForBuildings)
    {
        if (boundHandlersForBuildings[key])
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings[key]);
            boundHandlersForBuildings[key] = null;
        }
    }

    boundHandlersForBuildings.wall = wall.interactionWithBuilding.bind(wall);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.wall);
})

spritesCar1.addEventListener("mousedown", (event) => {
    
    car1.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    for (const key in boundHandlersForBuildings)
    {
        if (boundHandlersForBuildings[key])
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings[key]);
            boundHandlersForBuildings[key] = null;
        }
    }

    boundHandlersForBuildings.car1 = car1.interactionWithBuilding.bind(car1);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.car1);
})

spritesCar2.addEventListener("mousedown", (event) => {
    
    car2.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    for (const key in boundHandlersForBuildings)
    {
        if (boundHandlersForBuildings[key])
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings[key]);
            boundHandlersForBuildings[key] = null;
        }
    }

    boundHandlersForBuildings.car2 = car2.interactionWithBuilding.bind(car2);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.car2);
})

spritesSpawnWeapon.addEventListener("mousedown", (event) => {
    
    spawnWeapon.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    for (const key in boundHandlersForBuildings)
    {
        if (boundHandlersForBuildings[key])
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings[key]);
            boundHandlersForBuildings[key] = null;
        }
    }

    boundHandlersForBuildings.spawnWeapon = spawnWeapon.interactionWithBuilding.bind(spawnWeapon);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.spawnWeapon);
})

spritesConnectionWalls.addEventListener("mousedown", (event) => {
    
    connectionWalls.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    for (const key in boundHandlersForBuildings)
    {
        if (boundHandlersForBuildings[key])
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings[key]);
            boundHandlersForBuildings[key] = null;
        }
    }

    boundHandlersForBuildings.connectionWalls = connectionWalls.interactionWithBuilding.bind(connectionWalls);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.connectionWalls);
})