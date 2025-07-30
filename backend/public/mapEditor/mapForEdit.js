import { car1, car2, CountOfBuildings, floor, TypeBuilding, wall } from "./buildings/deterBuildings.js";
import { COUNT_TILE_X, COUNT_TILE_Y, HEIGHT_MAP, TILE_HEIGHT, TILE_WIDTH, WIDTH_MAP } from "./sizes.js";
import { stateEditor } from "./state.js";

export const COLOR_FLOOR = 'rgba(0, 0, 0, 1)';
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
    constructor(width, height, imageFloor, imageWall, imageCar1, imageCar2)
    {
        this.width = width;
        this.height = height;
        this.tileMap = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.buldings = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.imageFloor = imageFloor;
        this.imageWall = imageWall;
        this.imageCar1 = imageCar1;
        this.imageCar2 = imageCar2;
        this.buldingsObject = [];
        this.horizontalWalls = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.verticalWalls = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.containers = [];
        this.isSaveMap = false;
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
                            floor.rectsForSprite[iter].sx,
                            floor.rectsForSprite[iter].sy,
                            floor.rectsForSprite[iter].sWidth,
                            floor.rectsForSprite[iter].sHeight,
                            tileX,
                            tileY,
                            floor.rectsForSprite[iter].dWidth,
                            floor.rectsForSprite[iter].dHeight
                        );
                    }
                    if (this.buldings[iterY * COUNT_TILE_Y + iterX] >= TypeBuilding.Wall1 &&
                        this.buldings[iterY * COUNT_TILE_Y + iterX] <= TypeBuilding.Wall1 + CountOfBuildings.Wall - 1)
                    {
                        const wallObj = this.buldingsObject.find((elem) => {
                            if (elem.x == iterX && elem.y == iterY) return true;
                        });
                        if (wallObj)
                        {
                            wall.drawOnMap(ctx, wallObj);
                        }
                    }
                }
            }
        }

        this.buldingsObject.forEach((elem) => {

            if (elem.choosenBuilding >= TypeBuilding.Car11 &&
                elem.choosenBuilding <= TypeBuilding.Car11 + CountOfBuildings.Car1 - 1)
            {
                car1.drawOnMap(ctx, elem);
            }
            if (elem.choosenBuilding >= TypeBuilding.Car21 &&
                elem.choosenBuilding <= TypeBuilding.Car21 + CountOfBuildings.Car2 - 1)
            {
                car2.drawOnMap(ctx, elem);
            }
        })
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

    drawAllField(ctx)
    {
        for (let iterY = 0; iterY < COUNT_TILE_Y; iterY++)
        {
            for (let iterX = 0; iterX < COUNT_TILE_X; iterX++)
            {
                const tileX = iterX * TILE_WIDTH;
                const tileY = iterY * TILE_HEIGHT;
                if (this.tileMap[iterY * COUNT_TILE_Y + iterX] == 0)
                {
                    ctx.fillStyle = COLOR_FLOOR;
                    ctx.fillRect(tileX, tileY, TILE_WIDTH, TILE_HEIGHT);
                }
                if (this.tileMap[iterY * COUNT_TILE_Y + iterX] >= TypeBuilding.Floor1 &&
                    this.tileMap[iterY * COUNT_TILE_Y + iterX] <= TypeBuilding.Floor1 + CountOfBuildings.Floor - 1)
                {
                    let iter = this.tileMap[iterY * COUNT_TILE_Y + iterX] - TypeBuilding.Floor1;
                    ctx.drawImage(floor.image,
                        floor.rectsForSprite[iter].sx,
                        floor.rectsForSprite[iter].sy,
                        floor.rectsForSprite[iter].sWidth,
                        floor.rectsForSprite[iter].sHeight,
                        tileX,
                        tileY,
                        floor.rectsForSprite[iter].dWidth,
                        floor.rectsForSprite[iter].dHeight
                    );
                }
                if (this.buldings[iterY * COUNT_TILE_Y + iterX] >= TypeBuilding.Wall1 &&
                    this.buldings[iterY * COUNT_TILE_Y + iterX] <= TypeBuilding.Wall1 + CountOfBuildings.Wall - 1)
                {
                    const wallObj = this.buldingsObject.find((elem) => {
                        if (elem.x == iterX && elem.y == iterY) return true;
                    })
                    let rotation = 0;
                    if (wallObj)
                    {
                        rotation = wallObj.rotation;
                    }
                    let iter = this.buldings[iterY * COUNT_TILE_Y + iterX] - TypeBuilding.Wall1;
                    ctx.save();
                    ctx.translate(iterX * TILE_WIDTH + TILE_WIDTH / 2,
                                    iterY * TILE_HEIGHT + TILE_HEIGHT / 2);
                    ctx.rotate(rotation * Math.PI / 180);
                    ctx.drawImage(wall.image,
                        wall.rectsForSprite[iter].sx,
                        wall.rectsForSprite[iter].sy,
                        wall.rectsForSprite[iter].sWidth,
                        wall.rectsForSprite[iter].sHeight,
                        -wall.widthOnMap,
                        -wall.heightOnMap,
                        wall.rectsForSprite[iter].dWidth,
                        wall.rectsForSprite[iter].dHeight
                    );
                    ctx.restore();
                }
            }
        }
    }

    saveMap(nameMap, ctx)
    {
        this.isSaveMap = true;
        this.preparingToGreedyMeshing();
        this.containers = [];

        let isWallStartedHoriz = false;
        let horWall = null;

        for (let iterY = 0; iterY < COUNT_TILE_Y; iterY++)
        {
            for (let iterX = 0; iterX < COUNT_TILE_X; iterX++)
            {
                if (iterX == COUNT_TILE_X - 1)
                {
                    if (horWall)
                    {
                        this.containers.push(horWall);
                        horWall = null;
                        isWallStartedHoriz = false;
                        continue;
                    }
                }
                if (!this.horizontalWalls[iterY * COUNT_TILE_Y + iterX] && isWallStartedHoriz)
                {
                    this.containers.push(horWall);
                    horWall = null;
                    isWallStartedHoriz = false;
                    continue;
                }
                if (this.horizontalWalls[iterY * COUNT_TILE_Y + iterX])
                {
                    if (isWallStartedHoriz)
                    {
                        horWall.w++;
                    }
                    else
                    {
                        horWall = new GreedyQuad(iterX, iterY, 1, 1);
                        isWallStartedHoriz = true;
                    }
                    continue;

                }
            }
        }

        let isWallStartedVert = false;
        let vertWall = null;

        for (let iterX = 0; iterX < COUNT_TILE_X; iterX++)
        {
            for (let iterY = 0; iterY < COUNT_TILE_Y; iterY++)
            {
                if (iterY == COUNT_TILE_Y - 1)
                {
                    if (vertWall)
                    {
                        this.containers.push(vertWall);
                        vertWall = null;
                        isWallStartedVert = false;
                        continue;
                    }
                }
                if (!this.verticalWalls[iterY * COUNT_TILE_Y + iterX] && isWallStartedVert)
                {
                    this.containers.push(vertWall);
                    vertWall = null;
                    isWallStartedVert = false;
                    continue;
                }
                if (this.verticalWalls[iterY * COUNT_TILE_Y + iterX])
                {
                    if (isWallStartedVert)
                    {
                        vertWall.h++;
                    }
                    else
                    {
                        vertWall = new GreedyQuad(iterX, iterY, 1, 1);
                        isWallStartedVert = true;
                    }
                    continue;
                }
            }
        }

        this.drawAllField(ctx);

        const imageMap = stateEditor.ctx.canvas.toDataURL("image/png");
        const newMap = {
            nameMap: nameMap,
            image: imageMap,
            walls: this.containers,
        }
        fetch("/main/saveMap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newMap),
        })
        .then(response => response.text())
        .then(result => {
            console.log('Успешно:', result);
        })
        .catch(error => {
            console.error('Ошибка:', error);
        });
    }
}
