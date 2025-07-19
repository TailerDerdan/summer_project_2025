document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector(".create-room__button")
    btn.addEventListener('click', async (e) => {
        e.preventDefault()
        const formData = {
            name: document.querySelectorAll(".parameters-room-list-item__input")[0].value,
            gamemode: document.querySelector(".room-playmode-list").value,
            isOpen: document.querySelector(".room-open-list").value === "open",
        };
        const response = await fetch('/room/create', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json()
        sessionStorage.setItem('roomSettings', JSON.stringify({
            userId: data.userId,
        }))
        sessionStorage.setItem('ws_join_data', JSON.stringify({
            roomId: data.roomId,
            data: {
                userId: data.userId,
                nickname: data.nickname,
            }
        }));
        console.log(typeof data.roomId, data.roomId, "+++")
        window.location.href = ('/room/show/' + data.roomId)
    })
})

