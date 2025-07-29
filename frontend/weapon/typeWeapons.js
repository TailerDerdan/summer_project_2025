export const TYPE_WEAPON = {
    NONE: 0,
    ASSAULT_RIFLE: 1,
    SNIPER_RIFLE: 2,
    SHOTGUN: 3,
}

const TYPE_SHOOTING = {
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
    sprite: (() => {
        const img = new Image();
        img.src = "./spriteWeapon/assaultRifle.png";
        return img;
    }),
}

export const InitSniperRifle = {
    ammoCapacity: 5,
    totalAmmo: Infinity,
    currentAmmo: 5,
    fireRange: 3000,
    timeBetweenBul: 2,
    weight: 3,
    timeReload: 6,
    damage: 2,
    speedBullet: 8,
    typeShooting: TYPE_SHOOTING.SINGLE,
    sprite: (() => {
        const img = new Image();
        img.src = "./spriteWeapon/sniperRifle.png";
        return img;
    }),
}

export const InitShotgun = {
    ammoCapacity: 4,
    totalAmmo: Infinity,
    currentAmmo: 4,
    fireRange: 1200,
    timeBetweenBul: 2.5,
    weight: 1.6,
    timeReload: 5,
    damage: 2,
    speedBullet: 15,
    typeShooting: TYPE_SHOOTING.FIRING_A_BURST,
    sprite: (() => {
        const img = new Image();
        img.src = "./spriteWeapon/shotgun.png";
        return img;
    }),
}

export class Weapon
{
    constructor(InitValues, typeWeapon, x, y)
    {
        this.ammoCapacity = InitValues.ammoCapacity;
        this.totalAmmo = InitValues.totalAmmo;
        this.currentAmmo = InitValues.currentAmmo;
        this.fireRange = InitValues.fireRange;
        this.timeBetweenBul = InitValues.timeBetweenBul;
        this.weight = InitValues.weight;
        this.timeReload = InitValues.timeReload;
        this.damage = InitValues.damage;
        this.type = typeWeapon;
        this.speedBullet = InitValues.speedBullet;
        this.x = x;
        this.y = y;
    }
}