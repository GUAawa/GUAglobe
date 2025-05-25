const express = require("express");
const router = express.Router();
const {login} = require("./login");

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
    res.send({code:0,msg:"注册成功，请登录"})
    console.log("注册成功 0")
    return 0;
})

module.exports = router