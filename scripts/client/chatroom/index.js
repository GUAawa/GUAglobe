const socket = io("/chatroom");

const DOM_messages = document.getElementById("messages");
const DOM_input = document.getElementById("input");
const DOM_send = document.getElementById("send");
// const DOM_username = document.getElementById("username");

DOM_send.onclick = ()=>{
    if(DOM_input.value == ''){
        alert("是皇帝的新消息呢");
        return;
    }
    console.log('send!');
    socket.emit("client:send_msg",{
        username:Cookie.get("username"),
        password_hash:hex_sha256(Cookie.get("password")),
        token:Cookie.get("token"),
    },DOM_input.value);
    DOM_input.value = ''; //清空
}

const audio_new_msg = new Audio("/audio/chatroom/new_msg.wav");
socket.on("server:send_msg",(data)=>{
    const {user:{id,username},msg,time} = data;
    const content = `(${new Date(time).toLocaleTimeString()})[${username}] ${msg}`
    const DOM_msg = document.createElement("p");
    DOM_msg.className = "message";
    DOM_msg.innerHTML = content;
    DOM_messages.appendChild(DOM_msg);
    audio_new_msg.play();
})

socket.on("server:send_err",(code,msg)=>{
    alert(`${msg} ERR: ${code}`);
    console.log("我不会做跳转功能");
})

socket.on("server:reset_token",(token)=>{
    Cookie.set("token",token);
    console.log("已重设token:",token);
})