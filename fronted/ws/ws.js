import { createEnemies } from "../enemy/enemy.js";
import { updateMovementEnemies } from "../enemy/movementEnemies.js"
import { player } from "../player/player.js";

// const socket = new WebSocket('ws://');
// const socket = null;

socket.onopen = () => {
    console.log('Соединение установлено');
}

socket.onmessage = (event) => {
    
    const data = JSON.parse(event.data);

    if (data.type === "createEnemies")
    {
        createEnemies(data.enemies);
    }
    if (data.type === "updateMovement")
    {
        updateMovementEnemies(data.updatedEnemies);
    }
}

socket.onclose = function(event) {
    
    if (event.wasClean) {
        console.log('Соединение закрыто');
    } else {
        console.log('Обрыв соединения');
    }
};

socket.onerror = function(error) {

    console.log('Ошибка', error.message);
};


export function sendDataByWS() 
{
    if (socket.readyState === WebSocket.OPEN) 
    {
        const playerToWS = {
            x: player.x,
            y: player.y,
            dir: player.dir,
        }
        socket.send(JSON.stringify(playerToWS));
    }
}