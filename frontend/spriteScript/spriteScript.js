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
        const frame1 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame1);

        x += widthImage;

        const frame2 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame2);

        x += widthImage;

        const frame3 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame3);

        x += widthImage;

        const frame4 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame4);

        x += widthImage;

        const frame5 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame5);

        x += widthImage;

        const frame6 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame6);

        x += widthImage;

        const frame7 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame7);

        x += widthImage;

        const frame8 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame8);

        x += widthImage;

        const frame9 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame9);

        x += widthImage;

        const frame10 = new IntRect(x, 0, widthImage, heightImage);
        this.frames.push(frame10);
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

    playAnimation()
    {
        if (this.isAnimationPlayed) return;

        const animate = () => {

            if (this.isAnimationPlayed) return;

            this.updateFrames(16 / 100000);

            requestAnimationFrame(animate);
        }

        animate();
    }
}