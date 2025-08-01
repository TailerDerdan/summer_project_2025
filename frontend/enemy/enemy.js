import { Sound } from "../soundsScript/sound.js";
import { Character } from "../Infrastructure/Character.js";
import { Blood, remainingBlood } from "../blood/blood.js";
import {randomPosition} from "../random.js";

export const WIDTH_ENEMY = 40;
export const HEIGHT_ENEMY = 80;

export class Enemy extends Character
{
    constructor(id, x, y, width, height, dir, nickname)
    {
        super(id, x, y, width, height, dir, nickname);

        this.weapon = null;
    }

    updateEnemy() {
        if (this.wasCharacterWounded && this.isCharacterLive) {
            console.log('death enemy');
            this.handleDeath();
        }
        if (!this.isCharacterLive && !this.respawnTimer) {
            this.startRespawnTimer();
        }
    }

    handleDeath() {
        this.isCharacterLive = false;
        const blood = new Blood(this);
        remainingBlood.push(blood);
        blood.playAnimationBlood();
    }

    startRespawnTimer() {
        this.respawnTimer = setTimeout(() => {
            this.respawnTimer = null;
        }, 2500);
    }
}