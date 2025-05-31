const express = require("express");
const router = express.Router();
const {login} = require("./login");
const {bindVariableToFile} = require("../utils/var_file_binder");

bindVariableToFile("deleted_users_username","data\\users\\deleted_users.json");

router.post("/login",express.json(),(req,res)=>{
    const data = req.body
    const {username,password_hash} = data;
    result = login(username,password_hash);
    res.send(result);
    return result;
})
let inviting_codes = [
    "supermegaultragua",
]
router.post("/signup",express.json(),(req,res)=>{
    const data = req.body
    const {username,password_hash,inviting_code} = data;
    console.log(username,password_hash,inviting_code);
    if(!(inviting_codes.includes(inviting_code))){
        res.send({code:-1,msg:"邀请码错误"});
        console.log("邀请码错误 -1");
        return -1;
    }
    if(username in map_username_to_id){
        res.send({code:-2,msg:"用户已存在"});
        console.log("用户已存在 -2");
        return -2;
    }
    const id = next_user_id++;
    map_username_to_id[username] = id;
    map_id_to_username[id] = username;
    map_id_to_password_hash[id] = password_hash;
    map_id_to_permission[id] = 0;
    res.send({code:0,msg:"注册成功，请登录"})
    console.log("注册成功 0")
    return 0;
})
router.post("/unregister",express.json(),(req,res)=>{
    const data = req.body
    const {username,password_hash} = data;
    console.log("请求注销");
    console.log(username,password_hash);

    if(!(username in map_username_to_id)){
        res.send({code:-2,msg:"用户不存在"});
        console.log("用户不存在 -2");
        return -2;
    }

    const id = map_username_to_id[username];
    const password_hash_correct = map_id_to_password_hash[id];
    if(password_hash_correct != password_hash){
        res.send({code:-3,msg:"密码错误"});
        console.log("密码错误 -3");
        return -3;
    }

    //注销
    delete map_username_to_id[username];
    delete map_id_to_username[id];
    if(id in map_id_to_token) delete map_id_to_token[id];
    deleted_users_username[id] = username;
    //并不删除全部数据，因为难以解耦，只要切断id路径让它不能被找到就好了
    res.send({code:0,msg:"注销成功"});
    console.log("注销成功 0");
    return 0;
})
router.post("/reset",express.json(),(req,res)=>{
    console.log("请求修改账密")
    const data = req.body
    const {
        old_username,
        old_password_hash,
        new_username,
        new_password_hash,
    } = data;
    console.log({
        old_username,
        old_password_hash,
        new_username,
        new_password_hash,
    });

    if(new_username != old_username && new_username in map_username_to_id){
        res.send({code:-2,msg:"新用户已存在"});
        console.log("新用户已存在 -2");
        return -2;
    }

    const id = map_username_to_id[old_username];
    if(!id){
        res.send({code:-1,msg:"旧用户不存在"});
        console.log("旧用户不存在 -1");
        return -1;
    }
    const password_hash_correct = map_id_to_password_hash[id];
    if(password_hash_correct != old_password_hash){
        res.send({code:-3,msg:"密码错误"});
        console.log("密码错误 -3");
        return -3;
    }
    //修改
    map_id_to_username[id] = new_username;
    delete map_username_to_id[old_username];
    map_username_to_id[new_username] = id;
    map_id_to_password_hash[id] = new_password_hash;

    res.send({code:0,msg:"修改成功"})
    console.log("修改成功 0")
    return 0;
})
router.post("/heartbeat",express.json(),(req,res)=>{
    const data = req.body;
    const {token} = data;
    //验证token有效
    const id = map_token_to_id[token];
    console.log("heartbeat",token,id);
    if(id === undefined){
        res.send({code:-114,msg:"无效的token"});
        return;
    }
    //heartbeat
    map_token_to_heartbeat[token] = +(new Date());
    res.send({code:200,msg:"beat-^v---"});
    return;
})

module.exports = router