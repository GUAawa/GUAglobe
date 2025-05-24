const DOM_messages = document.getElementById("messages");
const DOM_input = document.getElementById("input");
const DOM_send = document.getElementById("send");
const DOM_username = document.getElementById("username");

const socket = io()

DOM_send.onclick = ()=>{
    console.log('send!');
    socket.emit("client:chatroom/send_msg",{
        username:Cookie.get("username"),
        password_hash:hex_sha256(Cookie.get("password")),
        token:Cookie.get("token"),
    },DOM_input.value);
}

socket.on("server_sent_msg",(msg)=>{
    console.log(msg);
    const DOM_msg = document.createElement("p");
    DOM_msg.className = "message";
    DOM_msg.innerHTML = msg;
    DOM_messages.appendChild(DOM_msg);
})