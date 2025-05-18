const express = require("express");
const router = express.Router();

router.post("/login",express.json(),(req,res)=>{
    console.log(req.body);
    res.send({b:2});
})

module.exports = router