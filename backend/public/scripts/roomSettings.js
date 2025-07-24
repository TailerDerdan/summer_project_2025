document.addEventListener("DOMContentLoaded", async () => {
    const roomSet = JSON.parse(sessionStorage.getItem('roomSettings'));
    // if (roomSet) {
    //     if (roomSet.hostId) {
    //         const startBtn = document.createElement("button")
    //         startBtn.className = ("start-btn")
    //         startBtn.textContent = "Играть"
    //         startBtn.type = "submit"
    //         const roomElt = document.querySelector(".room-window__buttons")
    //         roomElt.appendChild(startBtn)
    //     }
    //     //addReadyButton(roomSet.userId)
    // }
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
    const userList = document.querySelector(`.room-info__main-indicator-bar`)
    if (userList &&  !document.getElementById(`user-${user.userId}`)) {
        const userElt = document.createElement("p")
        userElt.setAttribute("style", "background-color: red;")
        userElt.id = `user-${user.userId}`
        userElt.textContent = `${user.userId}: ${user.nickname}`
        userList.appendChild(userElt)
    }
}

// function addReadyButton(userId) {
//     const btn = document.createElement("button")
//     btn.value = "not ready"
//     btn.type = "button"
//     btn.className = "room-window__button"
//     btn.id = `room_ready-${ userId }`
//     btn.textContent = "ГОТОВ"
//     document.querySelector(".room").appendChild(btn)
// }
