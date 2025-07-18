document.addEventListener("DOMContentLoaded", () => {
    const roomSet = JSON.parse(sessionStorage.getItem('roomSettings'));
    if (roomSet) {
        console.log("roomSet: ", roomSet)
        if (roomSet.userId) {
            const startBtn = document.createElement("button")
            startBtn.className = ("start-btn")
            startBtn.textContent = "Играть"
            startBtn.type = "submit"
            document.body.appendChild(startBtn)
        }
    }
    sessionStorage.removeItem('roomSettings');
})
