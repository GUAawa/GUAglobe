module.exports = (io,socket)=>{

socket.on("client_sent_msg",(msg)=>{
    console.log(msg);
    io.emit("server_sent_msg",msg);
})

}