function sendBulletToServer(socket, bullet, owner) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
        type: "shoot",
        data: {
            x: bullet.x,
            y: bullet.y,
            speed: bullet.speed,
            dir: bullet.dir,
            ownerId: owner.playerId,
            lifetime: bullet.lifetime
        }
    }));
}

// В обработке попаданий
function sendHitToServer(playerId, bulletId) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({
        type: "bullet_hit",
        data: {
            playerId: playerId,
            bulletId: bulletId
        }
    }));
}