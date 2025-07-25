function showDeathMessage(playerId, killerId) {
    let deathText;
    if (killerId) {
        deathText = `Игрок ${playerId} был убит ${killerId}`;
    }
    else {
        deathText = `Игрок ${playerId} погиб`;
    }
    console.log(deathText);
}

function getDeathEvent(socket) {
    socket.onopen = () => {
        console.log("connect to global ws")
    }
    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case "player_death":
                const death = message.data;
                console.log(`Player ${death.playerId} died`);
                showDeathMessage(death.playerId, death.killerId);
                break;
        }
    }
}
