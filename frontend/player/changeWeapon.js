import { setTypeShooting } from "../weapon/shooting.js";
import { allWeapon } from "../weapon/spawnWeapon.js";
import { TYPE_WEAPON } from "../weapon/typeWeapons.js";
import { sendChangeWeapon, sendDropWeapon } from "../ws/game.js";
import { player } from "./player.js"

document.addEventListener("mousedown", (event) => {
    if (event.button == 2)
    {
        event.preventDefault();

        if (player.weapon)
        {
            const weaponPlayer = player.weapon;
            player.weapon = null;
            weaponPlayer.owner = null;
            weaponPlayer.container.fillVertices();
            allWeapon.set(weaponPlayer.id, weaponPlayer);
            sendDropWeapon();
        }

        for (const [id, weapon] of allWeapon)
        {
            if (weapon.currentAmmo == 0) continue;
            if (player.container.isTwoContainerConcerns(weapon.container))
            {
                player.weapon = weapon;
                weapon.owner = player;
                setTypeShooting(player);
                sendChangeWeapon();
                break;
            }
        }
    }
});

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});