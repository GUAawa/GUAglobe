function new_msg(data){
    const {user:{id,username},msg} = data
}
const {login} = require("../users/login");
module.exports = {
    io(io){
        console.log("io还没写");
    },
    socket(socket){
        socket.join("chatroom");
        socket.on("client:chatroom/send_msg",({username,password_hash,token},msg)=>{
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
                }else{
                    console.log("无效的用户信息")
                    //错误用户信息
                    socket.emit("server:chatroom/send_err",-1,"请重新登录!");
                    return -1;
                }
            }
            console.log(`获取成功 token: ${token}`);
            const id = map_token_to_id[token];
            username = map_id_to_username[id];
            console.log(`用户信息: ${id} - ${username}`);
        })
    }
}