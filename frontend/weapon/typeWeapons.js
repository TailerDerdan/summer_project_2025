import { Container } from "../collisions/collisions.js"

export const TYPE_WEAPON = {
    NONE: 0,
    ASSAULT_RIFLE: 1,
    SNIPER_RIFLE: 2,
    SHOTGUN: 3,
    PISTOL: 4
}

export const TYPE_SHOOTING = {
    SINGLE: 0,
    AUTOMATIC: 1,
    FIRING_A_BURST: 2
}

export const InitAssaultRifle = {
    ammoCapacity: 30,
    totalAmmo: Infinity,
    currentAmmo: 30,
    fireRange: 2500,
    timeBetweenBul: 0.1,
    weight: 2,
    timeReload: 4,
    damage: 1,
    speedBullet: 20,
    typeShooting: TYPE_SHOOTING.AUTOMATIC,
    sprite: "./weapon/spriteWeapon/assaultRifle.png",
    widthSprite: 11 * 2,
    heightSprite: 31 * 2,
}

export const InitSniperRifle = {
    ammoCapacity: 5,
    totalAmmo: Infinity,
    currentAmmo: 5,
    fireRange: 3000,
    timeBetweenBul: 2,
    weight: 3,
    timeReload: 4,
    damage: 2,
    speedBullet: 30,
    typeShooting: TYPE_SHOOTING.SINGLE,
    sprite: "./weapon/spriteWeapon/sniperRifle.png",
    widthSprite: 10 * 2,
    heightSprite: 39 * 2,
}

export const InitShotgun = {
    ammoCapacity: 4,
    totalAmmo: Infinity,
    currentAmmo: 4,
    fireRange: 1200,
    timeBetweenBul: 1.8,
    weight: 1.6,
    timeReload: 5,
    damage: 2,
    speedBullet: 15,
    typeShooting: TYPE_SHOOTING.FIRING_A_BURST,
    sprite: "./weapon/spriteWeapon/shotgun.png",
    widthSprite: 9 * 2,
    heightSprite: 27 * 2,
}

export const InitPistols = {
    ammoCapacity: 4,
    totalAmmo: Infinity,
    currentAmmo: 4,
    fireRange: 1200,
    timeBetweenBul: 2.5,
    weight: 1.6,
    timeReload: 5,
    damage: 2,
    speedBullet: 15,
    typeShooting: TYPE_SHOOTING.SINGLE,
    sprite: "./weapon/spriteWeapon/gun.png",
    widthSprite: 6 * 2,
    heightSprite: 13 * 2,
}

export function getInitValues(typeWeapon)
{
    switch (typeWeapon) {
        case TYPE_WEAPON.ASSAULT_RIFLE:
            return InitAssaultRifle;
        case TYPE_WEAPON.SHOTGUN:
            return InitShotgun;
        case TYPE_WEAPON.SNIPER_RIFLE:
            return InitSniperRifle;
        case TYPE_WEAPON.PISTOL:
            return InitPistols;
        default:
            break;
    }
}

export class Weapon
{
    constructor(InitValues, typeWeapon, x, y, id)
    {
        this.id = id;
        this.ammoCapacity = InitValues.ammoCapacity;
        this.totalAmmo = InitValues.totalAmmo;
        this.currentAmmo = InitValues.currentAmmo;
        this.fireRange = InitValues.fireRange;
        this.timeBetweenBul = InitValues.timeBetweenBul;
        this.weight = InitValues.weight;
        this.timeReload = InitValues.timeReload;
        this.damage = InitValues.damage;
        this.type = typeWeapon;
        this.typeShooting = InitValues.typeShooting;
        this.speedBullet = InitValues.speedBullet;
        this.x = x;
        this.y = y;
        this.sprite = new Image();
        this.sprite.src = InitValues.sprite;
        this.widthSprite = InitValues.widthSprite;
        this.heightSprite = InitValues.heightSprite;
        this.owner = null;
        this.container = new Container(this.widthSprite, this.heightSprite, x, y, 0);
        this.container.fillVertices();
        this.isExpired = false;
        this.expireTime = null;
    }
}