document.addEventListener("DOMContentLoaded", async (e) => {
    //const usersArr = await loadUsersData()
    const dataJson = JSON.parse(sessionStorage.getItem('ws_join_data'));
    //sessionStorage.removeItem('ws_join_data');
    console.log("dataJson: ", dataJson)
    const socket = connectToWSRoom(dataJson)

    document.getElementById('leave-room-btn').addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: "user_leave",
                data: {
                    userId: (dataJson.data.userId).toString(),
                    nickname: dataJson.data.nickname,
                },
            }));
        }
    });
    const startBtn = document.getElementById("room_start")
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const gameType = document.getElementById("room-gamemode").textContent
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

    const readyBtn = document.getElementById(`room_ready-${dataJson.data.userId}`)
    if (readyBtn) {
        readyBtn.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: "user_ready",
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
    const socket = new WebSocket(`ws://mochilovo-avi.ru:8080/ws/room/${dataUser.roomId}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "user_auth",
            data: {
                userId: (dataUser.data.userId).toString(),
                nickname: dataUser.data.nickname,
            }
        }));
    };

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'user_joined') {
            addUserToList(data.data);
            showNotification(` присоединился к комнате`);
        } else if (data.type === 'init_users') {
            data.data.users.forEach(user => {
                addUserToList(user);
            });
        }
        if (data.type === 'leave_ack' || data.type === 'user_leaved_l') {
            removeUserFromList(data.data.userId)
            showNotification(`${data.data.userId}: ${data.data.nickname} вызодит из комнаты...`);
            if (data.type === 'leave_ack') {
                await deleteUserFromRoom(data.data.roomId)
                socket.close()
                window.location.href = '/main';
            }
        }
        if (data.type === 'start_game') {
            handleGameStart(data.data, dataUser.data)
            await deleteRoom(data.data.roomId)
            socket.close()
        }
        if (data.type === "not_all_ready") {
            showNotification(`Не все игроки нажали кнопку "ГОТОВ"`);
        }
        if (data.type === "delete_room_l") {
            await deleteUserFromRoom(data.data.roomId)
            await deleteRoom(data.data.roomId)
            socket.close()
            window.location.href = ("/main")
        }
        if (data.type === "update_ready_state") {
            await updateReadyState(data.data)
        }
    }
    return socket
}

async function updateReadyState(data) {
    const userElt = document.getElementById(`user-${data.userId}`)
    const readyBtn = document.getElementById(`room_ready-${data.userId}`)
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
    await updateReadyStateFetch(data.isReady)
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
    const userList = document.querySelector('.room-info__main-indicator-bar');
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

function handleGameStart(data, user) {
    sessionStorage.setItem('gameSession', JSON.stringify({
        gameId: data.gameId,
        userId: user.userId,
        nickname: user.nickname,
    }))
    let countStart = 2
    const countStartElt = document.querySelector(".timer-down")
    const timer = setInterval(() => {
        countStartElt.textContent = `Переход в игру через ${countStart}`
        countStart--
        if (countStart < 0) {
            clearInterval(timer)
            window.location.href = `/game/index.html?${data.gameId}`
        }
    }, 1000)
}

async function deleteUserFromRoom(roomId) {
    const response = await fetch('/room/deleteUser', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            roomId: roomId,
        })
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
 }

 async function updateReadyStateFetch(isReady) {
    const response = await fetch('/room/updateReadyState', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            isReady: isReady,
        })
    })
     if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
     }
 }
