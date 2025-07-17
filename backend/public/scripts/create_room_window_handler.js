const roomMenu = document.getElementById("room_menu");
const createRoom = document.getElementById("create_room");
const btnOpenCreateRoom = document.getElementById("create_room_open");
const btnCloseCreateRoom = document.getElementById("create_room_cancel");

function openCreateRoom() {
    roomMenu.style.display = "none";
    createRoom.style.display = "flex";
}

function closeCreateRoom() {
    createRoom.style.display = "none";
    roomMenu.style.display = "block";
}

btnOpenCreateRoom.addEventListener('click', openCreateRoom);
btnCloseCreateRoom.addEventListener('click', closeCreateRoom);