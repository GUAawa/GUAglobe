const DOM_messages = document.getElementById("messages");
const DOM_input = document.getElementById("input");
const DOM_send = document.getElementById("send");


const socket = io()

DOM_send.onclick = ()=>{
    console.log('send!');
    const input = DOM_input.value;
    console.log(input);
    socket.emit("client_sent_msg",input);
}

socket.on("server_sent_msg",(msg)=>{
    console.log(msg);
    const DOM_msg = document.createElement("p");
    DOM_msg.innerHTML = msg;
    DOM_messages.appendChild(DOM_msg);
})