import { canvas } from "../canvas.js";
import { HEIGHT_MAP, WIDTH_MAP } from "../map/map.js";
import { player } from "../player/player.js";

class WrapperRect
{
    constructor(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
    }

    setProperties(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width || this.width;
        this.height = height || this.height;
        this.right = this.x + this.width;
        this.bottom = this.y + this.height;
    }

    isRectInside(wrapperRect)
    {
        return (
            this.x >= wrapperRect.x &&
            this.y >= wrapperRect.y &&
            this.right <= wrapperRect.right &&
            this.bottom <= wrapperRect.bottom
        );
    }

    isRectIntersects(wrapperRect)
    {
        return (
            this.x < wrapperRect.right &&
            this.right > wrapperRect.x &&
            this.y < wrapperRect.bottom &&
            this.bottom > wrapperRect.y
        );
    }
}

class Camera
{
    constructor(xView, yView, viewportWidth, viewportHeight, worldWidth, worldHeight)
    {
        this.xView = xView;
        this.yView = yView;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;

        this.minDistX = 0;
        this.minDistY = 0;

        this.followedObject = null;

        this.mapWrapperRect = new WrapperRect(0, 0, worldWidth, worldHeight);
        this.viewportWrapperRect = new WrapperRect(xView, yView, viewportWidth, viewportHeight);
    }

    follow(object, minDistX, minDistY)
    {
        this.followedObject = object;
        this.minDistX = minDistX;
        this.minDistY = minDistY;
    }

    update()
    {
        if (!this.followedObject) return;
        
        if (this.followedObject.x - this.xView + this.minDistX > this.viewportWidth)
        {
            this.xView = this.followedObject.x - (this.viewportWidth - this.minDistX); 
        }
        else if (this.followedObject.x - this.minDistX < this.xView)
        {
            this.xView = this.followedObject.x - this.minDistX;
        }

        if (this.followedObject.y - this.yView + this.minDistY > this.viewportHeight)
        {
            this.yView = this.followedObject.y - (this.viewportHeight - this.minDistY); 
        }
        else if (this.followedObject.y - this.minDistX < this.yView)
        {
            this.yView = this.followedObject.y - this.minDistY;
        }

        this.viewportWrapperRect.setProperties(this.xView, this.yView);

        if (!this.viewportWrapperRect.isRectInside(this.mapWrapperRect))
        {
            if (this.viewportWrapperRect.x < this.mapWrapperRect.x)
            {
                this.xView = this.mapWrapperRect.x;
            }
            if (this.viewportWrapperRect.y < this.mapWrapperRect.y)
            {
                this.yView = this.mapWrapperRect.y;
            }
            if (this.viewportWrapperRect.right > this.mapWrapperRect.right)
            {
                this.xView = this.mapWrapperRect.right - this.viewportWidth;
            }
            if (this.viewportWrapperRect.bottom > this.mapWrapperRect.bottom)
            {
                this.yView = this.mapWrapperRect.bottom - this.viewportHeight;
            }
        }
    }
}

const viewportWidth = 1920;
const viewportHeight = 1080;

export const camera = new Camera(0, 0, viewportWidth, viewportHeight, WIDTH_MAP, HEIGHT_MAP);
camera.follow(player, viewportWidth / 2, viewportHeight / 2);