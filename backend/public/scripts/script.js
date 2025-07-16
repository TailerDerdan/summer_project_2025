function connectWebSocket() {
    const socket = new WebSocket('ws://localhost:8080/ws/global-updates');
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data["type"] === 'room_create') {
            addRoomToList(data["room"]);
        } else if (data["type"] === 'room_list_TTTT') {
            updateRoomList(data["rooms"]);
        }
    };
}

function updateRoomList(rooms) {
    if (!rooms) {
        return
    }
    const container = document.querySelector('.room-list');
    container.innerHTML = ''
    for (const room of rooms) {
        const roomElt = document.createElement("div")
        roomElt.innerHTML = `
            <div class="room">
                <span>${room.name}</span>
                <p>Режим: ${room.gamemode}</p>
                <button onclick="joinRoom('${room.id}')">Join</button>
            </div>
        `
        container.appendChild(roomElt)
    }
}

function addRoomToList(room) {
    if (!room) {
        return
    }
    const container = document.querySelector('.room-list');
    const roomElt = document.createElement("div")
    roomElt.innerHTML = `
        <div class="room">
            <span>${room.name}</span>
            <p>Режим: ${room.gamemode}</p>
            <button onclick="joinRoom('${room.id}')">Join</button>
        </div>
    `
    container.appendChild(roomElt)
}

function joinRoom(roomId) {
    const socket = new WebSocket(`ws://localhost:8080/ws/room_${roomId}`);
    socket.onopen = () => {
        console.log("Connected to room", roomId);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket()
});
