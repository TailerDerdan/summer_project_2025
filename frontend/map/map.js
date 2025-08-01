import { Container } from "../collisions/collisions.js";
import { COUNT_TILE_X, COUNT_TILE_Y, HEIGHT_MAP, TILE_HEIGHT, TILE_WIDTH, WIDTH_MAP } from "../sizes.js";

export const COLOR_FLOOR = 'rgba(179, 211, 0, 1)';
export const COLOR_WALL = 'rgba(231, 40, 10, 1)';

export class Map2D
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.tileMap = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.walls = [];
        this.wallsAddingByEditor = [];
        this.image = null;
    }

    generateRectWall(x, y, width, height)
    {
        for (let iterX = x; iterX < x + width; iterX++)
        {
            for (let iterY = y; iterY < y + height; iterY++)
            {
                this.tileMap[iterY * COUNT_TILE_Y + iterX] = 1;
            }
        }
        const container = new Container(width * TILE_WIDTH, height * TILE_HEIGHT, x * TILE_WIDTH, y * TILE_HEIGHT, 0);
        this.walls.push(container);
    }

    draw(ctx, xView, yView)
    {
        let sourceX = xView;
        let sourceY = yView;

        let sourceWidth = ctx.canvas.width;
        let sourceHeight = ctx.canvas.height;

        if (this.image.width - sourceX < sourceWidth)
        {
            sourceWidth = this.image.width - sourceX;
        }
        if (this.image.height - sourceY < sourceHeight)
        {
            sourceHeight = this.image.height - sourceY;
        }
        let destinationX = 0;
        let destinationY = 0;

        let destinationWidth = sourceWidth;
        let destinationHeight = sourceHeight;

        ctx.drawImage(this.image, sourceX, sourceY, sourceWidth, sourceHeight, destinationX, destinationY, destinationWidth, destinationHeight);
    }

    fillWalls(wallsFromJson)
    {
        wallsFromJson.forEach((elem) => {
            this.generateRectWall(elem.x, elem.y, elem.w, elem.h);
        })
    }
}

export const map = new Map2D(WIDTH_MAP, HEIGHT_MAP);