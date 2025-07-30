import { TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";
import { Building } from "./bulding.js";

export const TypeBuilding = {};

export const CountOfBuildings = {
    Floor: 14,
    Wall: 2,
    Car1: 1,
    Car2: 1,
}

export const choosenBuilding = {
    state: 0,
    rotation: 0,
};

export const stateMouseDowning = {
    isPressedFloor: false,
    isPressedWall: false,
    isPressedCar1: false,
    isPressedCar2: false,
}

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

export const spawnWeapon = new Building(TILE_WIDTH, TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT, 1, false, 0, "", "spawnWeapon");

floor.fillSprite(1, TypeBuilding, 7, 4);
wall.fillSprite(TypeBuilding.Floor1 + CountOfBuildings.Floor + 1, TypeBuilding, 1, 2);
car1.fillSprite(TypeBuilding.Wall1 + CountOfBuildings.Wall + 1, TypeBuilding, 1, 1);
car2.fillSprite(TypeBuilding.Car11 + CountOfBuildings.Car2 + 1, TypeBuilding, 1, 1);

const spritesFloor = document.getElementsByClassName("floor")[0];
const spritesWall = document.getElementsByClassName("wall")[0];
const spritesCar1 = document.getElementsByClassName("car1")[0];
const spritesCar2 = document.getElementsByClassName("car2")[0];

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
}

spritesFloor.addEventListener("mousedown", (event) => {
    
    floor.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    if (stateMouseDowning.isPressedWall)
    {
        if (boundHandlersForBuildings.wall)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.wall);
            boundHandlersForBuildings.wall = null;
            stateMouseDowning.isPressedWall = false;
        }
    }

    if (stateMouseDowning.isPressedCar1)
    {
        if (boundHandlersForBuildings.car1)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.car1);
            boundHandlersForBuildings.car1 = null;
            stateMouseDowning.isPressedCar1 = false;
        }
    }

    if (stateMouseDowning.isPressedCar2)
    {
        if (boundHandlersForBuildings.car2)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.car2);
            boundHandlersForBuildings.car2 = null;
            stateMouseDowning.isPressedCar2 = false;
        }
    }
    boundHandlersForBuildings.floor = floor.interactionWithBuilding.bind(floor);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.floor);
    stateMouseDowning.isPressedFloor = true;
})

spritesWall.addEventListener("mousedown", (event) => {
    
    wall.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    if (stateMouseDowning.isPressedFloor)
    {
        if (boundHandlersForBuildings.floor)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.floor);
            boundHandlersForBuildings.floor = null;
            stateMouseDowning.isPressedFloor = false;
        }
    }

    if (stateMouseDowning.isPressedCar1)
    {
        if (boundHandlersForBuildings.car1)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.car1);
            boundHandlersForBuildings.car1 = null;
            stateMouseDowning.isPressedCar1 = false;
        }
    }

    if (stateMouseDowning.isPressedCar2)
    {
        if (boundHandlersForBuildings.car2)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.car2);
            boundHandlersForBuildings.car2 = null;
            stateMouseDowning.isPressedCar2 = false;
        }
    }
    boundHandlersForBuildings.wall = wall.interactionWithBuilding.bind(wall);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.wall);
    stateMouseDowning.isPressedWall = true;
})

spritesCar1.addEventListener("mousedown", (event) => {
    
    car1.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    if (stateMouseDowning.isPressedFloor)
    {
        if (boundHandlersForBuildings.floor)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.floor);
            boundHandlersForBuildings.floor = null;
            stateMouseDowning.isPressedFloor = false;
        }
    }

    if (stateMouseDowning.isPressedWall)
    {
        if (boundHandlersForBuildings.wall)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.wall);
            boundHandlersForBuildings.wall = null;
            stateMouseDowning.isPressedWall = false;
        }
    }

    if (stateMouseDowning.isPressedCar2)
    {
        if (boundHandlersForBuildings.car2)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.car2);
            boundHandlersForBuildings.car2 = null;
            stateMouseDowning.isPressedCar2 = false;
        }
    }
    boundHandlersForBuildings.car1 = car1.interactionWithBuilding.bind(car1);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.car1);
    stateMouseDowning.isPressedCar1 = true;
})

spritesCar2.addEventListener("mousedown", (event) => {
    
    car2.drawForCanvasForChoice(ctxForSprite, canvasForSprite);

    if (stateMouseDowning.isPressedFloor)
    {
        if (boundHandlersForBuildings.floor)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.floor);
            boundHandlersForBuildings.floor = null;
            stateMouseDowning.isPressedFloor = false;
        }
    }

    if (stateMouseDowning.isPressedWall)
    {
        if (boundHandlersForBuildings.wall)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.wall);
            boundHandlersForBuildings.wall = null;
            stateMouseDowning.isPressedWall = false;
        }
    }

    if (stateMouseDowning.isPressedCar1)
    {
        if (boundHandlersForBuildings.car1)
        {
            canvasForSprite.removeEventListener('mousedown', boundHandlersForBuildings.car1);
            boundHandlersForBuildings.car1 = null;
            stateMouseDowning.isPressedCar1 = false;
        }
    }
    boundHandlersForBuildings.car2 = car2.interactionWithBuilding.bind(car2);
    canvasForSprite.addEventListener('mousedown', boundHandlersForBuildings.car2);
    stateMouseDowning.isPressedCar2 = true;
})