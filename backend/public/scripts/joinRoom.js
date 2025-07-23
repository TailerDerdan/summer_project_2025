document.addEventListener("DOMContentLoaded", async (e) => {
    //const usersArr = await loadUsersData()
    const dataJson = JSON.parse(sessionStorage.getItem('ws_join_data'));
    //sessionStorage.removeItem('ws_join_data');
    const socket = connectToWSRoom(dataJson)

    document.querySelector('.leave-room-btn').addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "leave_room",
                data: {
                    userId: (dataJson.data.userId).toString(),
                    nickname: dataJson.data.nickname,
                },
            }));
        }
    });
    const startBtn = document.querySelector(".start-btn")
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const gameType = document.querySelector(".gameType").textContent
                socket.send(JSON.stringify({
                    type: "start_game",
                    data: {
                        userId: (dataJson.data.userId).toString(),
                        nickname: dataJson.data.nickname,
                        gameType: gameType,
                    }
                }));
            }
        });
    }

    const readyBtn = document.getElementById(`ready-btn-${dataJson.data.userId}`)
    if (readyBtn) {
        readyBtn.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: "ready_state",
                    data: {
                        userId: (dataJson.data.userId).toString(),
                        roomId: dataJson.roomId,
                    }
                }))
            }
        })
    }
})
function connectToWSRoom(dataUser)   {
    console.log(typeof dataUser.roomId)
    const socket = new WebSocket(`ws://87.228.90.3:8080/ws/room/${dataUser.roomId}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "auth",
            data: {
                userId: (dataUser.data.userId).toString(),
                nickname: dataUser.data.nickname,
            }
        }));
    };

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("data: ", data)
        if (data.type === 'user_joined') {
            addUserToList(data.data);
            showNotification(` присоединился к комнате`);
        } else if (data.type === 'room_info') {
            data.users.forEach(user => {
                addUserToList(user);
            });
        }
        if (data.type === 'leave_ack' || data.type === 'user_leaved_l') {
            removeUserFromList(data.data.userId)
            showNotification(`${data.data.userId}: ${data.data.nickname} вызодит из комнаты...`);
            if (data.type === 'leave_ack') {
                await deleteUserFromRoom()
                window.location.href = '/main';
            }
        }
        if (data.type === 'start_game') {
            handleGameStart(data)
            await deleteRoom(data.data.roomId)
        }
        if (data.type === "not_all_ready") {
            showNotification(`Не все игроки нажали кнопку "ГОТОВ"`);
        }
        if (data.type === "delete_room_l") {
            await deleteUserFromRoom()
            await deleteRoom(data.data.roomId)
            window.location.href = ("/main")
        }
        if (data.type === "update_ready_state") {
            updateReadyState(data.data)
        }
    }
    return socket
}

function updateReadyState(data) {
    const userElt = document.getElementById(`user-${data.userId}`)
    const readyBtn = document.getElementById(`ready-btn-${data.userId}`)
    if (data.isReady) {
        userElt.setAttribute("style", "background-color: green")
        if (readyBtn) {
            readyBtn.value = "ready"
        }
    } else {
        userElt.setAttribute("style", "background-color: red")
        if (readyBtn) {
            readyBtn.value = "not ready"
        }
    }
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

function removeUserFromList(userId) {
    const userElement = document.getElementById(`user-${userId}`);
    if (userElement) {
        userElement.remove();
        return true;
    }
    return false;
}
function addUserToList(user) {
    const userList = document.querySelector('.users-list');
    if (!document.getElementById(`user-${user.userId}`)) {
        const userElement = document.createElement('div');
        console.log("set style RED")
        userElement.setAttribute("style", "background-color: red;")
        userElement.id = `user-${user.userId}`
        userElement.innerHTML = `
            <p>${ user.userId }: ${user.nickname}</p>
        `
        userList.appendChild(userElement);
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function handleGameStart(data) {
    sessionStorage.setItem('gameSession', JSON.stringify({
        data: data,
    }))
    let countStart = 2
    const countStartElt = document.createElement("div")
    document.body.appendChild(countStartElt)
    const timer = setInterval(() => {
        countStartElt.textContent = `Переход в игру через ${countStart}`
        countStart--
        if (countStart < 0) {
            clearInterval(timer)
            window.location.href = `/game/index.html?${data.data.gameId}`
        }
    }, 1000)
}

async function deleteUserFromRoom() {
    console.log("QQQQQQ")
    const response = await fetch('/room/deleteUser', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
 }
