import { Sound } from "../soundsScript/sound.js";
import { Character } from "../Infrastructure/Character.js";

const WIDTH_FRAME = 23;
const HEIGHT_FRAME = 34;
const START_X = 0;
const COUNT_SPRITE = 8;

export const WIDTH_ENEMY = 40;
export const HEIGHT_ENEMY = 80;

export class Enemy extends Character
{
    constructor(id, x, y, width, height, dir, nickname)
    {
        super(id, x, y, width, height, dir, nickname);

        this.weapon = null;
    }
}

// export const enemy1 = new Enemy(null, 600, 600, 80, 51.2, 0);