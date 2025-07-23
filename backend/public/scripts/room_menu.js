function connectWebSocket() {
    const socket = new WebSocket('ws://87.228.90.3:8080/ws/global-updates');
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
    const container = document.querySelector('.room-menu__room-list');
    const roomElt = document.createElement("div")
    roomElt.innerHTML = `
        <div class="room-menu__room-list-item" onclick="joinRoom('{{ room.id }}')">
            <div class="room-list-item__main">
                <div class="room-list-item__header">
                    <p class="room-list-item__name">{{ room.name }}</p>
                    {% if not room.isOpen %}
                        <img class="room-list-item__status-indicator" src="/images/lock.png" alt="">
                    {% endif %}
                </div>
                <div class="room-list-item__avatar-list">
<!--                    {% for player in room.players %}-->
<!--                        <img class="room-list-item__avatar-list-item" src="" alt="Аватар">-->
<!--                    {% endfor %}-->
                </div>
            </div>
            <div class="room-list-item__extra">
                {% if room.playersCount < room.maxPlayers %}
                    <p class="room-list-item__fill-indicator">{{ room.playersCount }}/{{ room.maxPlayers }}</p>
                {% else %}
                    <p class="room-list-item__fill-indicator-full">{{ room.maxPlayers }}/{{ room.maxPlayers }}</p>
                {% endif %}
                <p class="room-list-item__gamemode">{{ room.gamemode }}</p>
            </div>
        </div>
    `
    console.log(typeof room.userId, room.userId, "===", room)
    container.appendChild(roomElt)
}
async function joinRoom(roomId) {
    const response = await fetch(`/room/join/${roomId}`, {
        method: "POST",
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
