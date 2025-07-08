import { ctx, canvas } from '../canvas.js';

export const Player = {
    x: 400,
    y: 400,
    speed: 2.5,
    dir: 0,
    width: 20,
    height: 30,
    get centerX() { return this.x + this.width / 2 },
    get centerY() { return this.y + this.height / 2 }
}

export function drawPlayer() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();

    let centerX = Player.x + Player.width / 2;
    let centerY = Player.y + Player.width / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate(Player.dir * Math.PI / 180);

    ctx.fillStyle = 'black';
    ctx.fillRect(-Player.width / 2, -Player.height / 2, Player.width, Player.width);

    // ctx.fillStyle = 'red';
    // ctx.fillRect(Player.x + Player.width / 4, Player.y - Player.height, Player.width / 2, Player.height);

    ctx.restore();
}