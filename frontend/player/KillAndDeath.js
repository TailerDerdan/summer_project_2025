import {sendWebSocketMessage} from "../websocketGame";

export function playerKill(data) {
    const msg = {
        type: "player_kill",
        data: {
            playerId: data.playerId,
        }
    }
    sendWebSocketMessage(msg)
}
export function playerDeath(data) {
    const msg = {
        type: "player_death",
        data: {
            playerId: data.playerId,
        }
    }
    sendWebSocketMessage(msg)
}