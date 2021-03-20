const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");


// get username and room from url
const {username, room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
// console.log(username,room);

const socket = io();

// join chatroom
socket.emit('joinRoom',{username,room});

socket.on('message',message =>{
    // console.log(message);
    outputMessage(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

// get room and users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room),
    outputUsers(users)
})

// Message Submit

chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // get message
    const msg = e.target.elements.msg.value;
    // emit message
    socket.emit("chatMessage",msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

const outputMessage = msg =>{
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class='meta'>${msg.username} <span>${msg.time}</span></p>
    <p class='text'>${msg.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to dom
function outputRoomName(room){
    roomName.innerText = room;
}

// Add users
function outputUsers(users){
    userList.innerHTML =`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `
}