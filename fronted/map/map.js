import { COUNT_TILE_X, COUNT_TILE_Y, ctx, HEIGHT_MAP, TILE_HEIGHT, TILE_WIDTH, WIDTH_MAP } from "../canvas.js";
import { camera } from "../camera/camera.js";
import { Container } from "../collisions/collisions.js";

export const COLOR_FLOOR = 'rgba(179, 211, 0, 1)';
export const COLOR_WALL = 'rgba(231, 40, 10, 1)';

class Map
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.tileMap = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
        this.walls = [];
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

    generate(ctx)
    {
        this.generateRectWall(20, 20, 10, 8);
        // this.generateRectWall(10, 10, 2, 3);
        // console.log(21)

        let color = COLOR_FLOOR;
        ctx.save();
        ctx.fillStyle = color;

        for (let iterY = 0; iterY < COUNT_TILE_Y; iterY++)
        {
            for (let iterX = 0; iterX < COUNT_TILE_X; iterX++)
            {
                if (this.tileMap[iterY * COUNT_TILE_Y + iterX] == 0)
                {
                    color = COLOR_FLOOR;
                }
                else
                {
                    color = COLOR_WALL;
                }
                ctx.beginPath();
                ctx.rect(iterX * TILE_WIDTH, iterY * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.closePath();
            }
        }

        this.walls.forEach((elem) => {
            elem.drawContainer(ctx, elem.x, elem.y);
        })

        ctx.restore();

        this.image = new Image();
        this.image.src = ctx.canvas.toDataURL("image/png");
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
}

export const map = new Map(WIDTH_MAP, HEIGHT_MAP);
map.generate(ctx);