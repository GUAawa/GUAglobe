const DOM_messages = document.getElementById("messages");
const DOM_input = document.getElementById("input");
const DOM_send = document.getElementById("send");
const DOM_username = document.getElementById("username");

const socket = io()

DOM_send.onclick = ()=>{
    console.log('send!');
    socket.emit("client_sent_msg",`[${DOM_username.value}] ${DOM_input.value}`);
}

socket.on("server_sent_msg",(msg)=>{
    console.log(msg);
    const DOM_msg = document.createElement("p");
    DOM_msg.className = "message";
    DOM_msg.innerHTML = msg;
    DOM_messages.appendChild(DOM_msg);
})