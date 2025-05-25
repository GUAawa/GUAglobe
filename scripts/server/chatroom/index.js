const MAX_LOG_MESSAGES = 100;
const MAX_RECOVER_MESSAGES = 20;

const {bindVariableToFile} = require("../../server/utils/var_file_binder");
bindVariableToFile("chatroom_messages","data\\chatroom\\messages.json",(d)=>JSON.parse(d.toString()),JSON.stringify);
var io_chatroom;
function new_msg(data){
    // const {user:{id,username},msg} = data;
    data.time = +(new Date());
    //一方面发送，一方面记录日志
    if(chatroom_messages.length>MAX_LOG_MESSAGES) chatroom_messages.shift();
    chatroom_messages.push(data);
    console.log("聊天室:",data);
    io_chatroom.emit("server:send_msg",data);
    // io.emit("server:chatroom/send_msg");
}
const {login} = require("../users/login");
module.exports.socket = function(io){
    io_chatroom = io.of("/chatroom");
    io_chatroom.on("connection",(socket)=>{
        console.log("chatroom: connected");
        socket.on("disconnect",()=>{
            console.log("disconnected");
        })
        //恢复机制
        //#region 
        console.log("恢复聊天室数据...");
        for(let i = chatroom_messages.length-MAX_RECOVER_MESSAGES;i<chatroom_messages.length && chatroom_messages.length>0;i++){
            if(i<0) i=0; //越界了，就这样吧
            let data = chatroom_messages[i];
            // console.log(i,data);
            //发送
            socket.emit("server:send_msg",data);
        }
        socket.emit("server:send_msg",{
            user:{
                username:"server",
                id:"server",
            },
            time:(3*60*60+45*60+14)*1000,
            msg:`恢复了 ${MAX_RECOVER_MESSAGES} 条历史记录`
        });
        //#endregion
        //实时收发机制
        socket.on("client:send_msg",({username,password_hash,token},msg)=>{
            console.log("聊天室请求")
            console.log("正在检验token");
            //获取用户信息
            //尝试获取token
            if(!(map_token_to_id[token])){
                console.log("token无效, 可能是过期了")
                //尝试重新登录
                let result = login(username,password_hash)
                if(result.code >= 0){
                    console.log("已重新登录")
                    token = result.token;
                    socket.emit("server:reset_token",token)
                }else{
                    console.log("无效的用户信息")
                    //错误用户信息
                    socket.emit("server:send_err",-1,"请重新登录!");
                    return -1;
                }
            }
            console.log(`获取成功 token: ${token}`);
            const id = map_token_to_id[token];
            username = map_id_to_username[id];
            console.log(`用户信息: ${id} - ${username}`);
            new_msg({
                user:{
                    username,
                    id,
                },
                msg
            });
            //心跳
            map_token_to_heartbeat[token] = +(new Date());
        })
    })
}

const express = require("express");
const hex_sha256 = require("../../shared/utils/hash");
const router = express.Router();

router.post("/send_msg",express.json(),(req,res)=>{
    const data = req.body
    let {username,password,msg} = data;
    const password_hash = hex_sha256(password);
    console.log("聊天室请求 (POST)")
    //获取用户信息
    //获取token
    //登录
    let result = login(username,password_hash)
    if(result.code >= 0){
        console.log("已登录")
        token = result.token;
    }else{
        console.log("无效的用户信息")
        //错误用户信息
        res.send(result)
        return -1;
    }
    console.log(`获取成功 token: ${token}`);
    const id = map_token_to_id[token];
    username = map_id_to_username[id];
    console.log(`用户信息: ${id} - ${username}`);
    new_msg({
        user:{
            username,
            id,
        },
        msg
    });
    //心跳
    map_token_to_heartbeat[token] = +(new Date());
    res.send({code:0,msg:"发送成功"});
    return result;
})

module.exports.router = router;