const MAX_LOG_MESSAGES = 200;
const MAX_RECOVER_MESSAGES = 50;
const MAX_PUBLIC_FILES_SIZE = 1e8;

const fs = require("fs");
const {bindVariableToFile} = require("../../server/utils/var_file_binder");
bindVariableToFile("chatroom_messages","data\\chatroom\\messages.json",(d)=>JSON.parse(d.toString()),JSON.stringify);
bindVariableToFile("chatroom_next_msgid","data\\chatroom\\next_msgid.json");
bindVariableToFile("chatroom_next_fileid","data\\chatroom\\next_fileid.json");
bindVariableToFile("chatroom_oldest_fileid","data\\chatroom\\oldest_fileid.json");
var io_chatroom;
function process_data(data){ //分辨普通与指令 + 指令处理
    console.log(data)
    const {user:{id,username},msg,time} = data;
    const permission = map_id_to_permission[id];

    if(msg.slice(0,2) != "::"){ //普通模式
        console.log("普通消息:",msg);
        let save_msg = msg;
        save_msg = save_msg
        .replaceAll('&',"&amp;") //这条放最前面，防止重复转义
        .replaceAll('"',"&quot;")
        .replaceAll('<',"&lt;")
        .replaceAll('>',"&gt;")
        new_msg({
            user:{id,username},
            time,
            msg:save_msg,
        });
    }
    else{ //指令模式
        console.log("指令消息:",msg);
        //解析指令
        let tokens = msg.split(" ");
        console.log(tokens);
        //处理指令
        switch(tokens[0]){
            case "::searchmusic":
                const MAX_SONGS_AMOUNT = 3;
                const word = tokens[1];
                console.log("搜索音乐:",word);
                (async()=>{
                    const responde = await fetch(
                        `https://music.163.com/api/search/get/web?csrf_token=hlpretag=&hlposttag=&s=${word}&type=1&offset=0&total=true&limit=${MAX_SONGS_AMOUNT}`
                    )
                    const responde_json = await responde.json();
                    if(responde_json.code != 200){
                        new_msg({
                            user:{
                                id,
                                username,
                            },
                            time,
                            msg:`搜索出错，错误码 ${responde_json.code}`
                        });
                        return;
                    }
                    const songs = responde_json.result.songs;
                    console.log(songs);
                    const data = songs.map((song)=>{
                        return {
                            name:song.name,
                            id:song.id,
                            duration:song.duration,
                            artists:song.artists.map((artist)=>artist.name),
                        }
                    })
                    console.log(data);
                    let result = `发现了 ${data.length} 首歌 (点击发送) :<br>`
                    + data.map((song)=>{
                        return `<a href="javascript:void(0)" onclick="const temp = DOM_input.value; DOM_input.value = '::music ${song.id}'; document.getElementById('send').click(); DOM_input.value = temp;">(${Math.floor(song.duration/60/1000)}:${Math.floor(song.duration/1000)%60}) ${song.name} —— ${song.artists.join(", ")}</a>`
                    }).join("<br>");

                    //有可能没有歌哦
                    //发现了 0 首歌
                    new_msg({
                        user:{
                            id,
                            username,
                        },
                        time,
                        msg:result,
                    });
                })()
                console.log("已派发异步任务")
                new_msg
                break;
            case "::initscript":
            call_script_client(`Cookie.set("initscript",\`${msg.slice(12).replaceAll("`","\\`")}\`)`,username);
            new_msg({
                user:{id,username},
                time,
                msg:`设置自启动脚本:
${msg.slice(12)}`,
            })
            break;
            case "::recall":
                let amount,recall_username;
                switch (tokens.length){
                    case 1:
                        amount=1;
                        recall_username = username;
                        break;
                    case 2:
                        amount = tokens[1];
                        recall_username = username;
                        break;
                    case 3:
                        amount = tokens[1];
                        recall_username = tokens[2];
                        break;
                    default:
                        new_msg({
                            user:{id,username},
                            time,
                            msg:`错误指令——${msg}`,
                        });

                }
                if(username!=recall_username && permission < 1){ //0级只能自撤回
                    new_msg({
                        user:{id,username},
                        time,
                        msg:`想要撤回${recall_username}的消息，但失败了`,
                    });
                    break;
                }
                const amount_original = amount;
                for(let i = chatroom_messages.length-1;amount>0 && i>=0;i--){
                    let msg = chatroom_messages[i];
                    if(msg.user.username != recall_username) continue;
                    msg.msg = "(已撤回)";
                    io_chatroom.emit("server:recall_msg",msg.msgid);
                    amount--;
                }
                new_msg({
                    user:{id,username},
                    time,
                    msg:`撤回了 [${recall_username}] 的 ${amount_original} 条消息`,
                })

                break;
            case "::server":
                if(permission < 623){
                    new_msg({
                        user:{id:'0',username:"server"},
                        time,
                        msg:`${username} 竟敢命令我`,
                    });
                    break;
                }
                process_data({user:{id,username},msg:"script: "+msg.slice(8),time}); //反馈源代码
                try{ //尝试eval
                    let result = eval(msg.slice(8));
                    let result_str
                    try{
                        result_str = result.toString();
                    }catch{
                        result_str = "result has no toString."
                    }
                    new_msg({
                        user:{id:'0',username:"server"},
                        time,
                        msg:result_str,
                    });
                }catch{
                    new_msg({
                        user:{id:'0',username:"server"},
                        time,
                        msg:"ERROR ):",
                    });
                }

                break;
            case "::": //高级消息
            if(permission<2){
                new_msg({
                    user:{id,username},
                    time,
                    msg:`危险操作(联系GUA)——${msg}`,
                });
            }else{
                new_msg({
                    user:{id,username},
                    time,
                    msg:msg.slice(3),
                });
            }
            break;
            case "::music": //网易云音乐id -> audio
                new_msg({
                    user:{id,username},
                    time,
                    msg:`<audio controls src="https://music.163.com/song/media/outer/url?id=${tokens[1]}.mp3"/>`
                });
                break;
            case "::permission":
                new_msg({
                    user:{id,username},
                    time,
                    msg:`我的权限组是 ${map_id_to_permission[id]}`
                });
                break;
            case "::help":
                new_msg({
                    user:{id,username},
                    time,
                    msg:`
参数：<必选项>/[可选项]
如“::music 29023577”会召唤深海少女
===帮助===
::searchmusic <名字> 搜索网易云音乐
::music <网易云音乐id> 放音乐
::recall [amount] [username] 撤回消息
::upload <audio/img/file> 上传文件
::permission 查看权限组
:: <msg> msg无html转义
::initscript <script> 设置自启动脚本
::server <script> 运行js(服务器)
##...$$ 运行js(客户端)
`
.replaceAll('&',"&amp;") //这条放最前面，防止重复转义
.replaceAll('"',"&quot;")
.replaceAll('<',"&lt;")
.replaceAll('>',"&gt;")
.replaceAll("\n","<br>") //这条不要转义
                });
                break;
            default: //错误
                new_msg({
                    user:{id,username},
                    time,
                    msg:`错误指令——${msg}`,
                });
            //end switch
        }
    }
}
function new_msg(data){ //向客户端推送一条msg_div
    if(chatroom_messages.length>MAX_LOG_MESSAGES) chatroom_messages.shift();
    data.msgid = chatroom_next_msgid++;
    chatroom_messages.push(data);
    console.log("聊天室:",data);
    io_chatroom.emit("server:send_msg",data);
}
function call_script_client(script,username){
    console.log("聊天室客户端调用:",username,script);
    io_chatroom.emit("server:run_function",script,username);
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
            process_data({
                user:{
                    username,
                    id,
                },
                msg,
                time:+(new Date()),
            });
            //心跳
            map_token_to_heartbeat[token] = +(new Date());
        })
        //文件传输
        socket.on("client:upload_file",(file,type,{username,password_hash,token},name)=>{
            //用户验证
            //#region 
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
            //#endregion
            //存储
            const path = `data\\chatroom\\public_files\\${chatroom_next_fileid}`;
            fs.writeFileSync(path,file);
            const url = `http://guaawa.fucku.top/server/chatroom/public_files/${chatroom_next_fileid}`;
            chatroom_next_fileid++;
            //发送
            switch(type){
                case "audio":
                new_msg({
                    user:{id,username},
                    msg:`<audio controls src="${url}" />`,
                    time:+(new Date()),
                })
                break;
                case "img":
                new_msg({
                    user:{id,username},
                    msg:`<img src="${url}" width="100%"/>`,
                    time:+(new Date()),
                })
                break;
                case "file":
                new_msg({
                    user:{id,username},
                    msg:`<a href="${url}" download="${name}">我分享了一个文件，点击下载</a>`,
                    time:+(new Date()),
                })
                break;
                default:
                console.log("未处理的上传类型",type)
            }
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
    process_data({
        user:{
            username,
            id,
        },
        msg,
        time:+(new Date()),
    });
    //心跳
    map_token_to_heartbeat[token] = +(new Date());
    res.send({code:0,msg:"发送成功"});
    return result;
})
router.use("/public_files",express.static("data\\chatroom\\public_files"));

module.exports.router = router;

//转存空间自洁
(()=>{
    const CLEANING_INTERVAL = 30*60*1000;
    const f = 
    ()=>{
        console.log("*** chatroom public_files 总大小控制系统")
        let size_sum = 0;
        console.log("... 统计文件总大小")
        for(let i = chatroom_oldest_fileid; i<chatroom_next_fileid; i++){//遍历文件
            let stats = fs.statSync(`data\\chatroom\\public_files\\${i}`);
            console.log(`... ${i} : ${stats.size}`);
            size_sum += stats.size
        }
        console.log(`... 总大小 : ${size_sum} / ${MAX_PUBLIC_FILES_SIZE}`);
        if(size_sum < MAX_PUBLIC_FILES_SIZE){
            console.log("@@@ 大小安全，结束!")
            return;
        }
        console.log("!!! 大小超出，开始删除")
        for(let i = chatroom_oldest_fileid; size_sum >= MAX_PUBLIC_FILES_SIZE; i++){
            let stats = fs.statSync(`data\\chatroom\\public_files\\${i}`);
            console.log(`... delete ${i} : ${stats.size}`);
            fs.unlink(`data\\chatroom\\public_files\\${i}`,(err) => {
                if (err) {
                   console.error('删除文件失败：', err);
                   return;
                }
            }) //异步即可
            size_sum -= stats.size;
            chatroom_oldest_fileid++;
        }
        console.log("*** 已结束删除");
        console.log(`... 当前最老文件: ${chatroom_oldest_fileid}`);
        console.log(`... 当前文件总大小: ${size_sum}`);
        console.log("@@@ 退出!");
    };

    //启动立即自洁
    f();
    //挂载
    setInterval(f,CLEANING_INTERVAL)
})()