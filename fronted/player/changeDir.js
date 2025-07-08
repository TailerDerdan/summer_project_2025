import { Player } from './player.js';

export function changeDir()
{
    document.addEventListener('mousemove', (event) => {
        
        const xMouse = event.clientX;
        const yMouse = event.clientY;

        let dir = Math.atan2((yMouse - Player.centerY), (xMouse - Player.centerX));
        dir = dir * 180 / Math.PI;
        
        dir += 90;

        if (dir < 0)
        {
            dir += 360;
        }
        Player.dir = dir;
    });
}