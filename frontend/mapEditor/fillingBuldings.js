import { TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";

export const imageFloor = new Image();
imageFloor.src = "./../sprites/level1/floorSprites.png";

export const imageWall = new Image();
imageWall.src = "./../sprites/level1/wallSprites.png";

export const TypeBuilding = {};

export const CountOfBuildings = {
    Floor: 14,
    Wall: 2,
    Car: 1
}

export const choosenBuilding = {
    state: 0,
    rotation: 0,
};

export const SPRITE_FLOOR_WIDTH = 16;
export const SPRITE_FLOOR_HEIGHT = 16;

export const SPRITE_WALL_WIDTH = 8;
export const SPRITE_WALL_HEIGHT = 32;

export const rectForFloor = [];
export const rectForWall = [];

export const stateMouseDowning = {
    isPressedFloor: false,
    isPressedWall: false,
    isPressedCar: false,
}

function fillFloorSprites()
{
    let yCoord = 0;
    let yOnCanvas = 0;

    let MARGIN_TILE_FLOOR_X = 5;
    let MARGIN_TILE_FLOOR_Y = 5;

    for (let iter = 1, xCoord = 0, xOnCanvas = 0; iter <= CountOfBuildings.Floor; iter++, xCoord++, xOnCanvas++)
    {
        TypeBuilding[`Floor${iter}`] = iter;
        rectForFloor.push(
        {
            sx: xCoord * SPRITE_FLOOR_WIDTH,
            sy: yCoord * SPRITE_FLOOR_HEIGHT,
            sWidth: SPRITE_FLOOR_WIDTH,
            sHeight: SPRITE_FLOOR_HEIGHT,
            dx: xOnCanvas * TILE_WIDTH + MARGIN_TILE_FLOOR_X,
            dy: yOnCanvas * TILE_HEIGHT + MARGIN_TILE_FLOOR_Y,
            dWidth: TILE_WIDTH,
            dHeight: TILE_HEIGHT,
        });

        if (xCoord == 6)
        {
            xCoord = -1;
            yCoord++;
        }

        if (xOnCanvas == 4)
        {
            xOnCanvas = -1;
            yOnCanvas++;
            MARGIN_TILE_FLOOR_X = 0;
            MARGIN_TILE_FLOOR_Y += 5;
        }
        MARGIN_TILE_FLOOR_X += 5;
    }
}

fillFloorSprites();

function fillWallSprite()
{
    let MARGIN_TILE_WALL_X = 5;
    let MARGIN_TILE_WALL_Y = 5;

    for (let iter = 1, yCoord = 0, xOnCanvas = 0; iter <= CountOfBuildings.Wall; iter++, yCoord++, xOnCanvas++)
    {
        TypeBuilding[`Wall${iter}`] = iter + CountOfBuildings.Floor;
        rectForWall.push(
        {
            sx: 0,
            sy: yCoord * SPRITE_WALL_HEIGHT,
            sWidth: SPRITE_WALL_WIDTH,
            sHeight: SPRITE_WALL_HEIGHT,
            dx: xOnCanvas * TILE_WIDTH + MARGIN_TILE_WALL_X,
            dy: 0 + MARGIN_TILE_WALL_Y,
            dWidth: SPRITE_WALL_WIDTH,
            dHeight: SPRITE_WALL_HEIGHT,
        });

        MARGIN_TILE_WALL_X += 5;
    }
}

fillWallSprite();