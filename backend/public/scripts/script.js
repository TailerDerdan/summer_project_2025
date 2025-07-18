function connectWebSocket() {
    const socket = new WebSocket('ws://localhost:8080/ws/global-updates');
    socket.onopen = () => {
        console.log("connect to global ws")
    }
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("data: ", data)
        if (data.type === 'room_create') {
            console.log('asdfasdf')
            addRoomToList(data.room);
        }
    };
}

function addRoomToList(room) {
    if (!room) {
        return
    }
    console.log("room ==== : ", room, room.userId, typeof room.userId)
    const container = document.querySelector('.room-list');
    const roomElt = document.createElement("div")
    roomElt.innerHTML = `
        <div class="room">
            <span>${room.name}</span>
            <p>Режим: ${room.gamemode}</p>
            <button onclick="joinRoom('${ room.roomId }')">JOIN</button>
        </div>
    `
    console.log(typeof room.userId, room.userId, "===", room)
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

    sessionStorage.setItem('ws_join_data', JSON.stringify({
        roomId: roomId,
        data: dataJson
    }));
    console.log(typeof roomId, roomId, "---")
    window.location.href = ('/room/show/' + roomId)
}

document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket()
});
