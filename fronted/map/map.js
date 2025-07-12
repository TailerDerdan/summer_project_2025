import { ctx } from "../canvas.js";

export const WIDTH_MAP = 5000;
export const HEIGHT_MAP = 3000;

class Map
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.image = null;
    }

    generate(ctx)
    {
        ctx.canvas.width = this.width;
        ctx.canvas.height = this.height;
        let rows = ~~(this.width / 45) + 1;
        let columns = ~~(this.height / 45) + 1;

        let color = 'rgba(179, 211, 0, 1)';
        ctx.save();
        ctx.fillStyle = color;

        for (let x = 0, iter = 0; iter < rows; x+=45, iter++)
        {
            ctx.beginPath();
            for (let y = 0, iter2 = 0; iter2 < columns; y+=45, iter2++)
            {
                ctx.rect(x, y, 40, 40);
            }
            color = (color == 'rgba(179, 211, 0, 1)' ? 'rgba(3, 194, 105, 1)' : 'rgba(179, 211, 0, 1)');
            ctx.fillStyle = color;
            ctx.fill();
            ctx.closePath();
        }

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