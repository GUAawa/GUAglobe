const PORT = 8000;

const express = require("express");
const {Server} = require("socket.io");
const fs = require("fs");

const app = express();

app.use('/',express.static("./webpages"));
app.use('/scripts/client',express.static("./scripts/client"));
app.use('/node_modules',express.static("./node_modules"));

const server = app.listen(PORT,()=>{
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
    require("./scripts/server/chatroom")(io,socket);
})