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

module.exports = router