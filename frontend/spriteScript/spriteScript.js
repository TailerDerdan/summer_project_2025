import { Clock } from "../clock/clock.js";

export class IntRect
{
    constructor(x, y, width, height)
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export class Sprite
{
    constructor(countFrames, src, delayMovement, willAnimationRepeat)
    {
        this.countFrames = countFrames;
        this.src = src;
        this.currentFrame = 0;
        this.frames = [];
        this.delayMovement = delayMovement;

        this.timeForMovement = 0;

        this.image = new Image();
        this.image.src = src;

        this.isAnimationPlayed = false;
        this.willAnimationRepeat = willAnimationRepeat;
    }

    makeFrames(widthImage, heightImage, x)
    {
        for (let iter = 0; iter < 10; iter++)
        {
            const frame = new IntRect(x, 0, widthImage, heightImage);
            this.frames.push(frame);
            x += widthImage;
        }
    }

    applyToSpriteMovement(ctx, dx, dy, dWidth, dHeight)
    {
        ctx.drawImage(this.image, this.frames[this.currentFrame].x, this.frames[this.currentFrame].y,
            this.frames[this.currentFrame].width, this.frames[this.currentFrame].height,
            dx, dy, dWidth, dHeight);
    }

    advanceMovement()
    {
        if (++this.currentFrame >= this.countFrames)
        {
            this.currentFrame = 0;
            if (!this.willAnimationRepeat)
            {
                this.isAnimationPlayed = true;
            }
        }
    }

    updateFrames(deltaTime)
    {
        this.timeForMovement += deltaTime;
        while (this.timeForMovement >= this.delayMovement && !this.isAnimationPlayed)
        {
            this.timeForMovement -= this.delayMovement;
            this.advanceMovement();
        }

        if (this.isAnimationPlayed)
        {
            this.currentFrame = this.countFrames - 1;
        }
    }

    playAnimation(deltaTime)
    {
        if (this.isAnimationPlayed) return;

        const animate = () => {

            if (this.isAnimationPlayed) return;

            this.updateFrames(deltaTime);

            requestAnimationFrame(animate);
        }

        animate();
    }
}