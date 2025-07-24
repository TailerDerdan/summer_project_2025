function connectWebSocket() {
    const socket = new WebSocket('ws://87.228.90.3:8080/ws/global-updates');

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
            await deleteRoom()
            const room = document.getElementById(`room-menu__room-list-item-${data.data.roomId}`)
            if (room) {
                room.remove()
            }
        }
    };
}

function addUser(user) {
    const userList = document.getElementById(`room-list-item__avatar-list-${user['roomId']}`)
    if (userList && !document.getElementById(`user-${user["userId"]}`)) {
        console.log('add user to list global')
        const userElt = document.createElement("p")
        userElt.id = `user-${user["userId"]}`
        userElt.textContent = `${user["userId"]}: ${user["nickname"]}`
        userList.appendChild(userElt)
        const playersCount = document.getElementById(`playersCount-${ user['roomId'] }`)
        playersCount.dataset.count++
        playersCount.textContent = `${playersCount.dataset.count}/${playersCount.dataset.max}`
    }
}

async function deleteUser(user) {
    const userElt = document.getElementById(`user-${user["userId"]}`)
    if (userElt) {
        userElt.remove()
        const playersCount = document.getElementById(`playersCount-${ user["roomId"] }`)
        playersCount.dataset.count--
        playersCount.textContent = `${playersCount.dataset.count}/${playersCount.dataset.max}`
        if (parseInt(playersCount.dataset.count) <= 0) {
            await deleteRoom()
            const room = document.getElementById(`room-menu__room-list-item-${user["roomId"]}`)
            if (room) {
                room.remove()
            }
        }
    }
}

function addRoomToList(room) {
    if (!room) {
        return
    }
    const container = document.querySelector('.room-menu__room-list');
    const roomElt = document.createElement("div")
    roomElt.className = "room-menu__room-list-item"
    roomElt.id = `room-menu__room-list-item-${room.roomId}`
    roomElt.click(joinRoom(`${ room.roomId }`))
    roomElt.innerHTML = `
            <div class="room-list-item__main">
                <div class="room-list-item__header">
                    <p class="room-list-item__name">${ room.name }</p>
    `
    if (!room.isOpen) {
        roomElt.innerHTML += `
                    <img class="room-list-item__status-indicator" src="/images/lock.png" alt="">
        `
    }
    roomElt.innerHTML += `
                </div>
                <div class="room-list-item__avatar-list" id="room-list-item__avatar-list-{{ room.id }}">
                </div>
            </div>
            <div class="room-list-item__extra">
    `
    if (room.playersCount < room.maxPlayers) {
        roomElt.innerHTML += `
                <p class="room-list-item__fill-indicator">${room.playersCount}/${room.maxPlayers}</p>
        `
    } else {
        roomElt.innerHTML += `
                <p class="room-list-item__fill-indicator-full">${room.maxPlayers}/${room.maxPlayers}</p>
        `
    }
    roomElt.innerHTML += `
                <p class="room-list-item__gamemode">${room.gamemode}</p>
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
