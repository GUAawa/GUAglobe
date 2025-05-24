const express = require("express");
const router = express.Router();

router.post("/login",express.json(),(req,res)=>{
    const data = req.body
    console.log(`::: 登录请求, 自称: ${data.username}`);
    //核对身份
    const {username,password_hash} = data;
    const id = map_username_to_id[username];
    if(!id){
        res.send({code:-1,msg:`不存在的用户：${username}`});
        console.log(`... 登录失败 不存在的用户 ERR: -1`);
        return -1;
    }
    const correct_password_hash = map_id_to_password_hash[id];
    if(password_hash != correct_password_hash){
        res.send({code:-2,msg:`错误的密码：${"我不知道你输入了什么"}`});
        console.log(`... 登录失败 错误的密码 ERR:-2`);
        return -2
    }
    console.log(`... 登录成功 id: ${id}`)
    //尝试已有token 更新心跳
    if(map_id_to_token[id]){
        console.warn(`!!! 心跳功能未实现`)
        res.send({code:1,msg:`旧token`,token:map_id_to_token[id]})
        console.log(`@@@ 已发送旧token code: 1 token: ${map_id_to_token[id]}`);
        return 1
    }
    //不存在 生成token
    let token = generateToken();
    bindTokenToId(token,id);
    res.send({code:0,msg:`新token`,token})
    console.log(`@@@ 已发送新token code: 0 token: ${token}`);
    return 0;
})

module.exports = router