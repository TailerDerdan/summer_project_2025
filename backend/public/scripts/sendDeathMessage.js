export function sendDeathEvent(socket, playerId, killerId) {
    const deathEvent = {
        type: "player_death",
        data: {
            playerId: playerId,
            killerId: killerId || null
        }
    };
    socket.send(JSON.stringify(deathEvent));
}
