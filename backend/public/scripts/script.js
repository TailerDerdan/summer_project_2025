export const socketState = {
    conn: null,
}

function connectWebSocket() {
    socketState.conn = new WebSocket('ws://mochilovo-avi.ru:8080/ws/global-updates');

    socketState.conn.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'room_create_server') {
            addRoomToList(data.room, data.user);
            addUser(data.user)
        }
        if (data.type === "add_user_server") {
            addUser(data.data)
            incCounterUsers(data.data.roomId)
        }
        if (data.type === "user_leaved_g_server") {
            await deleteUser(data.data)
        }
        if (data.type === "delete_room_g_server") {
            await deleteRoom(data.data.roomId)
            const room = document.getElementById(`room-menu__room-list-item-${data.data.roomId}`)
            if (room) {
                room.remove()
            }
        }
    };
}

function addUser(user) {
    const userList = document.getElementById(`room-list-item__avatar-list-${user["roomId"]}`)
    if (userList && !document.getElementById(`user-${user["userId"]}`)) {
        const userElt = document.createElement("p")
        userElt.id = `user-${user["userId"]}`
        userElt.textContent = `${user["userId"]}: ${user["nickname"]}`
        userList.appendChild(userElt)
    }
}

function incCounterUsers(roomId) {
    const playersCount = document.getElementById(`playersCount-${ roomId }`)
    if (parseInt(playersCount.dataset.count) < parseInt(playersCount.dataset.max)) {
        playersCount.dataset.count++
        playersCount.textContent = `${playersCount.dataset.count}/${playersCount.dataset.max}`
    }
}

async function deleteUser(user) {
    const userElt = document.getElementById(`user-${user["userId"]}`)
    if (userElt) {
        userElt.remove()
        const playersCount = document.getElementById(`playersCount-${ user["roomId"] }`)
        if (parseInt(playersCount.dataset.count) > 0) {
            playersCount.dataset.count--
            playersCount.textContent = `${playersCount.dataset.count}/${playersCount.dataset.max}`
        }
        if (parseInt(playersCount.dataset.count) <= 0) {
            await deleteRoom(user["roomId"])
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
    roomElt.setAttribute('onclick', `joinRoom('${room.roomId}')`);
    roomElt.innerHTML = `
        <div class="room-list-item__main">
            <div class="room-list-item__header">
                <p class="room-list-item__name">${room.name}</p>
                ${!room.isOpen ? '<img class="room-list-item__status-indicator" src="/images/lock.png" alt="">' : ''}
            </div>
            <div class="room-list-item__avatar-list" id="room-list-item__avatar-list-${room.roomId}"></div>
        </div>
        <div class="room-list-item__extra">
            ${room.playersCount < room.maxPlayers ?
            `<p class="room-list-item__fill-indicator" id="playersCount-${room.roomId}" data-count="0" data-max="${room.maxPlayers}">0/${room.maxPlayers}</p>` :
            `<p class="room-list-item__fill-indicator-full" id="playersCount-${room.roomId}" data-count="0" data-max="${room.maxPlayers}">0/${room.maxPlayers}</p>`
        }
            <p class="room-list-item__gamemode">${room.gamemode}</p>
        </div>
    `;
    container.appendChild(roomElt)
}
async function joinRoom(roomId) {
    // if (socketState.conn) {
    //     socketState.conn.send(JSON.stringify({
    //         type: "get_count_users",
    //         data: {
    //             roomId: roomId.toString(),
    //         },
    //     }))
    // }
    // await new Promise(resolve => {
    //     const checkInterval = setInterval(() => {
    //         if (socketState.) {
    //             console.log("||||||")
    //             clearInterval(checkInterval);
    //             resolve();
    //         }
    //     }, 2000);
    // });
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
        isReady: dataJson.isReady,
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
