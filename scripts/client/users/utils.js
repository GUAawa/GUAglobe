var heartbeat = async function(){
    const token = Cookie.get("token");
    const responde = await post("/server/users/heartbeat",{token});
    console.log(responde);
}