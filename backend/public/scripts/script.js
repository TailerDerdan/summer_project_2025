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
                <button onclick="joinRoom('${ room.id }', '1234')">JOIN
                </button>
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
            <button onclick="joinRoom('${ room.id }')">JOIN</button>
        </div>
    `
    container.appendChild(roomElt)
}
async function joinRoom(roomId) {
    const response = await fetch('/room/join', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const dataJson = await response.json()

    sessionStorage.setItem('ws_connection_data', JSON.stringify({
        roomId,
        dataJson
    }));
    window.location.href = ('/room/show/' + roomId)
}

document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket()
});
