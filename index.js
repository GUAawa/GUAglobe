const PORT = 8000;

const express = require("express");
const {Server} = require("socket.io");
const fs = require("fs");

const app = express();

app.use('/',express.static("./webpages"));
app.use('/scripts/client',express.static("./scripts/client"));
app.use('/scripts/shared',express.static("./scripts/shared"));
app.use('/node_modules',express.static("./node_modules"));

const server = app.listen(PORT,()=>{
    const host = server.address().address;
    const port = server.address().port;
    console.log(`Server running at ${host}:${port}`);
})

const io = new Server(server);
require("./scripts/server/chatroom").io(io)
io.on("connection",(socket)=>{
    console.log("connected");
    socket.on("disconnect",()=>{
        console.log("disconnected");
    })
    require("./scripts/server/chatroom").socket(socket);
})
require("./scripts/server/users/init");
app.use("/server/users",require("./scripts/server/users/index"));
// require("./scripts/server/users/socket")

//ctrl+C 可以挂好几个事件，似乎是按挂载顺序执行的，所以这个最终退出放在最后面
process.on("SIGINT",()=>{
    console.log("全部退出事项执行完毕, 退出!");
    process.exit();
})