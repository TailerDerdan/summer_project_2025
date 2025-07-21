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
    const startBtn = document.querySelector('.start-btn')
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                const gameType = document.querySelector(".gameType").textContent
                socket.send(JSON.stringify({
                    type: "start_game",
                    data: {
                        userId: (dataJson.userId).toString(),
                        gameType: gameType,
                    }
                }));
            }
        });
    }
})
function connectToWSRoom(dataUser)   {
    console.log(typeof dataUser.roomId)
    const socket = new WebSocket(`ws://localhost:8080/ws/room/${dataUser.roomId}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({
            type: "auth",
            data: {
                userId: (dataUser.data.userId).toString(),
                nickname: dataUser.data.nickname,
            }
        }));
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'user_joined') {
            addUserToList(data.data.userId);
            showNotification(` присоединился к комнате`);
        } else if (data.type === 'room_info') {
            data.users.forEach(user => {
                addUserToList(user.id);
            });
        }
        if (data.type === 'leave_ack' || data.type === 'user_leaved_l') {
            removeUserFromList(data.data.userId)
            showNotification(`${data.data.userId}: ${data.data.nickname} вызодит из комнаты...`);
            if (data.type === 'leave_ack') {
                deleteUserFromRoom()
                window.location.href = '/main';
            }
        }
        if (data.type === 'start_game') {
            handleGameStart(data, data.data.userId)
        }
        if (data.type === "not_all_ready") {
            showNotification(`Не все игроки нажали кнопку "ГОТОВ"`);
        }
        if (data.type === "delete_room_l") {
            deleteUserFromRoom()
            deleteRoom(data.data.roomId)
            window.location.href = ("/main")
        }
    }
    return socket
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
function addUserToList(userId) {
    const userList = document.querySelector('.users-list');
    if (!document.getElementById(`user-${userId}`)) {
        const userElement = document.createElement('div');
        userElement.id = `user-${userId}`;
        userElement.innerHTML = `
            <p>ID: ${ userId }</p>
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

function handleGameStart(data, userId) {
    sessionStorage.setItem('gameSession', JSON.stringify({
        userId: userId,
        gameId: data.data.gameId,
        gameType: data.data.gameType,
    }))
    let countStart = 5
    const countStartElt = document.createElement("div")
    document.body.appendChild(countStartElt)
    const timer = setInterval(() => {
        countStartElt.textContent = `Переход в игру через ${countStart}`
        countStart--
        if (countStart < 0) {
            clearInterval(timer)
            window.location.href = `/game/index.html?gameId=${data.data.gameId}`
        }
    })
}

async function deleteUserFromRoom() {
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

async function loadUsersData() {
    const response = await fetch('/main/getUsers', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json()
}
