import { getInitValues, Weapon } from "./typeWeapons.js";

export let allWeapon = new Map();

export function spawnWeapon(weaponsServer)
{
    for (const weaponServer of weaponsServer)
    {
        const initValue = getInitValues(weaponServer.type);
        if (initValue)
        {
            const weapon = new Weapon(initValue, weaponServer.type, weaponServer.x, weaponServer.y, weaponServer.id.toString());
            allWeapon.set(weaponServer.id.toString(), weapon);
        }
    }
}

export function drawAllWeaponOnMap(ctx, xView, yView)
{
    ctx.save();

    for (const [id, weapon] of allWeapon)
    {
        if (weapon.owner) continue;

        let screenX = weapon.x - xView;
        let screenY = weapon.y - yView;

        weapon.container.updateX(weapon.x);
        weapon.container.updateY(weapon.y);

        ctx.drawImage(weapon.sprite, screenX, screenY, weapon.widthSprite, weapon.heightSprite);
        weapon.container.drawContainer(ctx, screenX, screenY);
    };
    
    ctx.restore();
}

export function updateAllWeaponOnMap()
{
    for (const [id, weapon] of allWeapon)
    {
        if (weapon.currentAmmo <= 0 && !weapon.owner)
        {
            if (!weapon.expireTime)
            {
                weapon.expireTime = Date.now() + 2000;
            }
            else if (Date.now() >= weapon.expireTime)
            {
                weapon.isExpired = true;
            }
        }
    }
    for (const [id, weapon] of allWeapon)
    {
        if (weapon.isExpired)
        {
            allWeapon.delete(id);
        }
    }
}