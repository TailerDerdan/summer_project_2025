document.addEventListener("DOMContentLoaded", async () => {
    const roomSet = JSON.parse(sessionStorage.getItem('roomSettings'));
    if (roomSet) {
        if (roomSet.hostId) {
            const startBtn = document.createElement("button")
            startBtn.className = ("start-btn")
            startBtn.textContent = "Играть"
            startBtn.type = "submit"
            const roomElt = document.querySelector(".room")
            roomElt.appendChild(startBtn)
        }
        addReadyButton(roomSet.userId)
    }
    //sessionStorage.removeItem('roomSettings');

    const response = await fetch('/room/getUsers', {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const dataJson = await response.json()
    console.log("dataJson: ", dataJson, "roomSet: ", roomSet)
    const users = dataJson["users"]
    users.forEach((user) => {
        if (user["roomId"] && user["roomId"].toString() === roomSet["roomId"].toString()) {
            addUserLocal(user)
        }
    })
})

function addUserLocal(user) {
    const userList = document.getElementById(`users-list-${user.roomId}`)
    if (userList &&  !document.getElementById(`user-${user.userId}`)) {
        const userElt = document.createElement("p")
        userElt.id = `user-${user.userId}`
        userElt.textContent = `${user.userId}: ${user.nickname}`
        userList.appendChild(userElt)
    }
}

function addReadyButton(userId) {
    const btn = document.createElement("button")
    btn.value = "not ready"
    btn.type = "button"
    btn.className = "ready-btn"
    btn.id = `ready-btn-${ userId }`
    btn.textContent = "ГОТОВ"
    document.querySelector(".room").appendChild(btn)
}
