import { Container } from '../collisions/collisions.js';
import { Sprite } from '../spriteScript/spriteScript.js';
import { InitAssaultRifle, InitShotgun, TYPE_WEAPON, Weapon } from '../weapon/typeWeapons.js';
import { Character } from "../Infrastructure/Character.js";
import { bot1, bot2, bot3 } from "../bot/Bot.js";
import {Sound} from "../soundsScript/sound.js";
import { Blood, remainingBlood } from "../blood/blood.js";
import {playerDeath, playerKill} from './KillAndDeath.js';
import { initGameWebsocket, sendWebSocketMessage, setMessageHandler, stateForWS } from "../ws/websocketGame.js";
import {randomPosition} from "../random.js";

const WIDTH_FRAME = 23;
const HEIGHT_FRAME = 34;
const START_X = 0;
const COUNT_FRAMES = 10;

export const arrBot = [bot1];
export const arrEnemy = new Map();

export class Player extends Character
{
    constructor(id, x, y, dir, width, height, speed, weapon)
    {
        super(id, x, y, width, height, dir);

        this.speed = speed;
        this.weapon = weapon;

        this.sprite = new Sprite(COUNT_FRAMES, './sprites/playerSprite.png', 0.1, true);
        this.sprite.makeFrames(WIDTH_FRAME, HEIGHT_FRAME, START_X);

        this.soundShoot = new Sound('sounds/Hotline_Miami_2_Wrong_Number/M16.wav');

        this.lightPosition = {
            x: this.x,
            y: this.y
        };
    }

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }

    setDir(dir) { this.dir = dir; }
    setX(x) { this.x = x; }
    setY(y) { this.y = y; }

    updatePosition(distX, distY, keyDict)
    {
        let isWasMovement = false;
        if (keyDict.KeyW)
        {
            this.y -= distY;
            this.x += distX;
            isWasMovement = true;
        }
        if (keyDict.KeyS)
        {
            this.y += distY;
            this.x -= distX;
            isWasMovement = true;
        }

        if (keyDict.KeyD)
        {
            this.y += distX;
            this.x += distY;
            isWasMovement = true;
        }
        if (keyDict.KeyA)
        {
            this.y -= distX;
            this.x -= distY;
            isWasMovement = true;
        }
        if (this.weapon)
        {
            this.weapon.x = player.x;
            this.weapon.y = player.y;
        }
        return isWasMovement;
    }

    changeDistXYByPhysic(dist)
    {
        dist.distX *= this.speed;
        dist.distY *= this.speed;

        // dist.distX /= this.weapon.weight * 2;
        // dist.distY /= this.weapon.weight * 2;
    }

    drawCurrentAmmo()
    {
        let currentAmmo = 0;
        if (this.weapon)
        {
            currentAmmo = this.weapon.currentAmmo;
        }
        const spanCurrentAmmo = document.getElementById("currentAmmoPlayer");
        spanCurrentAmmo.textContent = currentAmmo;
    }

    updatePlayer() {
        if (this.wasCharacterWounded && this.isCharacterLive) {
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

        playerDeath(this.id);
    }

    startRespawnTimer() {
        this.respawnTimer = setTimeout(() => {
            sendWebSocketMessage({
                type: "player_respawn",
                data: { playerId: this.id }
            });
            this.respawnTimer = null;
        }, 2500);
    }
}

const weapon1 = new Weapon(InitAssaultRifle, TYPE_WEAPON.ASSAULT_RIFLE, 0, 0);

export const player = new Player(stateForWS.userId, 400, 400, 0, 75, 48, 14, weapon1);