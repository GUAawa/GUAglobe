const express = require("express");
const {Server} = require("socket.io");
const fs = require("fs");

const app = express();

app.use('/',express.static("./client"))

const server = app.listen(8000,()=>{
    const host = server.address().address;
    const port = server.address().port;
    console.log(`Server running at ${host}:${port}`);
})

const io = new Server(server);
io.on("connection",(socket)=>{
    console.log("connected");
    socket.on("disconnect",()=>{
        console.log("disconnected");
    })
    require("./server/chatroom/index")(io,socket);
})