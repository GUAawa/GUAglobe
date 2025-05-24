module.exports = {
    login(username,password_hash){
        console.log(`::: 登录请求, 自称: ${username}`);
        const id = map_username_to_id[username];
        if(!id){
            console.log(`... 登录失败 不存在的用户 ERR: -1`);
            return {code:-1,msg:`不存在的用户：${username}`};
        }
        const correct_password_hash = map_id_to_password_hash[id];
        if(password_hash != correct_password_hash){
            console.log(`... 登录失败 错误的密码 ERR:-2`);
            return {code:-2,msg:`错误的密码：${"我不知道你输入了什么"}`};
        }
        console.log(`... 登录成功 id: ${id}`)
        //尝试已有token 更新心跳
        if(map_id_to_token[id]){
            let token = map_id_to_token[id]
            map_token_to_heartbeat[token] = +(new Date());
            console.warn(`... 心跳`);
            console.log(`@@@ 已发送旧token code: 1 token: ${token}`);
            return {code:1,msg:`旧token`,token}
        }
        //不存在 生成token
        let token = generateToken();
        bindTokenToId(token,id);
        console.log(`@@@ 已发送新token code: 0 token: ${token}`);
        return {code:0,msg:`新token`,token}
    }
}