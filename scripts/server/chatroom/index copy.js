module.exports = (io,socket)=>{
    socket.join("chatroom");
    socket.on("client_sent_msg",(msg)=>{
    console.log("chatroom: ",msg);
    io.to("chatroom").emit("server_sent_msg",msg);
})
}