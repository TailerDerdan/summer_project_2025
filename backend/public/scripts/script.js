function connectWebSocket() {
    //const socket = new WebSocket('ws://localhost:8080/ws/global-updates');
    //const socket = new WebSocket('ws://87.228.90.3:82/ws/global-updates');
    const socket = new WebSocket('/ws/global-updates');

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'room_create') {
            addRoomToList(data.room, data.user);
        }
        if (data.type === "add_user") {
            addUser(data.data)
        }
        if (data.type === "user_leaved_g") {
            deleteUser(data.data)
        }
        if (data.type === "delete_room_g") {
            await deleteRoom(data.data.roomId)
            const room = document.getElementById(`room_${data.data.roomId}`)
            if (room) {
                room.remove()
            }
        }
    };
}

function addUser(user) {
    const userList = document.getElementById(`users-list-${user['roomId']}`)
    if (userList && !document.getElementById(`user-${user["userId"]}`)) {
        const userElt = document.createElement("p")
        userElt.id = `user-${user["userId"]}`
        userElt.textContent = `${user["userId"]}: ${user["nickname"]}`
        userList.appendChild(userElt)
    }
}

function deleteUser(user) {
    const userElt = document.getElementById(`user-${user["userId"]}`)
    if (userElt) {
        userElt.remove()
    }
}

function addRoomToList(room) {
    if (!room) {
        return
    }
    const container = document.querySelector('.room-list');
    const roomElt = document.createElement("div")
    roomElt.innerHTML = `
        <div class="room" id="room_${room.roomId}">
            <span>${room.name}</span>
            <p>Режим: ${room.gamemode}</p>
            <div class="users-list" id="users-list-${room.roomId}"></div>
            <button onclick="joinRoom('${ room.roomId }')">JOIN</button>
        </div>
    `
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


    sessionStorage.setItem('roomSettings', JSON.stringify({
        userId: dataJson.userId,
        roomId: roomId,
    }))

    sessionStorage.setItem('ws_join_data', JSON.stringify({
        roomId: roomId,
        data: {
            userId: dataJson.userId,
            nickname: dataJson.nickname,
        }
    }));
    window.location.href = ('/room/show/' + roomId)
}

async function deleteRoom(roomId) {
    const response = await fetch ( `/room/delete/${roomId}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        }
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    connectWebSocket()
});
