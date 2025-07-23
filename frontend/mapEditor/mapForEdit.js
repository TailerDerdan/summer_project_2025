import { COUNT_TILE_X, COUNT_TILE_Y, TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";
import { CountOfBuildings, rectForFloor, rectForWall, TypeBuilding } from "./fillingBuldings.js";

export const COLOR_FLOOR = 'rgba(179, 211, 0, 1)';
export const COLOR_WALL = 'rgba(231, 40, 10, 1)';

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
    }

    draw(ctx, x, y, viewportWidth, viewportHeight, panOffset)
    {
        const viewportEndX = x + viewportWidth + panOffset.x;
        const viewportEndY = y + viewportHeight + panOffset.y;

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

                    // if (iterY > 33) console.log(iterX);

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
                        let iter = this.buldings[iterY * COUNT_TILE_Y + iterX] - TypeBuilding.Wall1;
                        ctx.drawImage(this.imageWall,
                            rectForWall[iter].sx,
                            rectForWall[iter].sy,
                            rectForWall[iter].sWidth,
                            rectForWall[iter].sHeight,
                            tileX + 12,
                            tileY,
                            rectForWall[iter].dWidth,
                            rectForWall[iter].dHeight
                        );
                    }
                }
            }
        }
    }
}