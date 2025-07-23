import { COUNT_TILE_X, COUNT_TILE_Y, TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";
import { CountOfBuildings, rectForFloor, rectForWall, TypeBuilding } from "./fillingBuldings.js";

export const COLOR_FLOOR = 'rgba(179, 211, 0, 1)';
export const COLOR_WALL = 'rgba(231, 40, 10, 1)';

class GreedyQuad
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

export class MapEditor
{
    constructor(width, height, imageFloor, imageWall)
    {
        this.width = width;
        this.height = height;
        this.tileMap = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.buldings = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.imageFloor = imageFloor;
        this.imageWall = imageWall;
        this.buldingsObject = [];
        this.horizontalWalls = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.verticalWalls = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.containers = [];
    }

    draw(ctx, x, y, viewportWidth, viewportHeight, panOffset, scaleData)
    {
        const viewportEndX = (x + viewportWidth + panOffset.x * scaleData.scale - scaleData.scaleOffset.x) / scaleData.scale;
        const viewportEndY = (y + viewportHeight + panOffset.y * scaleData.scale - scaleData.scaleOffset.y) / scaleData.scale;

        for (let iterY = 0; iterY < COUNT_TILE_Y; iterY++)
        {
            for (let iterX = 0; iterX < COUNT_TILE_X; iterX++)
            {
                const tileX = iterX * TILE_WIDTH;
                const tileY = iterY * TILE_HEIGHT;
                if (tileX + TILE_WIDTH >= x &&
                    tileX <= viewportEndX &&
                    tileY + TILE_HEIGHT >= y &&
                    tileY <= viewportEndY)
                {
                    if (this.tileMap[iterY * COUNT_TILE_Y + iterX] == 0)
                    {
                        ctx.fillStyle = COLOR_FLOOR;
                        ctx.fillRect(tileX, tileY, TILE_WIDTH, TILE_HEIGHT);
                    }
                    if (this.tileMap[iterY * COUNT_TILE_Y + iterX] >= TypeBuilding.Floor1 &&
                        this.tileMap[iterY * COUNT_TILE_Y + iterX] <= TypeBuilding.Floor1 + CountOfBuildings.Floor - 1)
                    {
                        let iter = this.tileMap[iterY * COUNT_TILE_Y + iterX] - TypeBuilding.Floor1;
                        ctx.drawImage(this.imageFloor,
                            rectForFloor[iter].sx,
                            rectForFloor[iter].sy,
                            rectForFloor[iter].sWidth,
                            rectForFloor[iter].sHeight,
                            tileX,
                            tileY,
                            rectForFloor[iter].dWidth,
                            rectForFloor[iter].dHeight
                        );
                    }
                    if (this.buldings[iterY * COUNT_TILE_Y + iterX] >= TypeBuilding.Wall1 &&
                        this.buldings[iterY * COUNT_TILE_Y + iterX] <= TypeBuilding.Wall1 + CountOfBuildings.Wall - 1)
                    {
                        const wall = this.buldingsObject.find((elem) => {
                            if (elem.x == iterX && elem.y == iterY) return true;
                        })
                        let rotation = 0;
                        if (wall)
                        {
                            rotation = wall.rotation;
                        }
                        let iter = this.buldings[iterY * COUNT_TILE_Y + iterX] - TypeBuilding.Wall1;
                        ctx.save();
                        ctx.translate(iterX * TILE_WIDTH + TILE_WIDTH / 2,
                                      iterY * TILE_HEIGHT + TILE_HEIGHT / 2);
                        ctx.rotate(rotation * Math.PI / 180);
                        ctx.drawImage(this.imageWall,
                            rectForWall[iter].sx,
                            rectForWall[iter].sy,
                            rectForWall[iter].sWidth,
                            rectForWall[iter].sHeight,
                            -TILE_WIDTH / 2 + 12,
                            -TILE_HEIGHT / 2,
                            rectForWall[iter].dWidth,
                            rectForWall[iter].dHeight
                        );
                        ctx.restore();
                    }
                }
            }
        }
    }

    preparingToGreedyMeshing()
    {
        for (let iterY = 0; iterY < COUNT_TILE_Y; iterY++)
        {
            for (let iterX = 0; iterX < COUNT_TILE_X; iterX++)
            {
                const wall = this.buldingsObject.find((elem) => {
                    if (elem.x == iterX && elem.y == iterY) return true;
                });
        
                if (wall)
                {
                    if (wall.rotation == 90 || wall.rotation == 270)
                    {
                        this.horizontalWalls[iterY * COUNT_TILE_Y + iterX] = 1;
                    }
                    if (wall.rotation == 0 || wall.rotation == 180)
                    {
                        this.verticalWalls[iterY * COUNT_TILE_Y + iterX] = 1;
                    }
                } 
            }
        }
    }

    saveMap()
    {
        this.preparingToGreedyMeshing();

        for (let iterY = 0; iterY < COUNT_TILE_Y; iterY++)
        {
            for (let iterX = 0; iterX < COUNT_TILE_X; iterX++)
            {
                
            }
        }
    }
}