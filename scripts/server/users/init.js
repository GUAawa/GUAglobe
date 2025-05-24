//这里的大量量都会暴露于global, 因为它太核心了, 不需也不宜解耦

//users.json应该存什么
/*
{
    id:{ //注: 显然, id是str, 尽管它是个序数
        username,
        password_hash
    }
}
*/
//这样可以最简洁的快速创建核心偏静态用户数据
//与之相对的，token是动态的，没有存储需求
//与之相对的，app_data是非核心的，是可扩展且不必要的
//以上两类都必须与核心数据发生关系，因而id,usr,pwd这些核心数据被存储在以users系统名命名的文件中
//此外
/*
{
    ...,
    next:下一个还没被注册过的id:int
}
*/

const { bindVariableToFile } = require("../utils/var_file_binder");
const hash = require("../../shared/utils/hash");

console.log("*** 正在建立用户信息映射表")
//id->user={username,password_hash}
bindVariableToFile("map_id_to_username","data/users/username.json",(d)=>JSON.parse(d.toString()),JSON.stringify);
//username->id
global.map_username_to_id = {};
for(let id in map_id_to_username){
    let username = map_id_to_username[id];
    map_username_to_id[username] = id;
}
bindVariableToFile("next_user_id","data/users/next_id.json",(d)=>JSON.parse(d.toString()),JSON.stringify);
bindVariableToFile("map_id_to_password_hash","data/users/password_hash.json",(d)=>JSON.parse(d.toString()),JSON.stringify)
//id<->token
global.map_id_to_token = {};
global.map_token_to_id = {};
global.map_token_to_heartbeat = {}
global.generateToken = function(){
    return hash(Math.random().toString());
}
global.bindTokenToId = function(token,id){
    map_id_to_token[id] = token;
    map_token_to_id[token] = id;
    map_token_to_heartbeat[token] = +(new Date());
}
global.discardToken = function(token){
    let id = map_token_to_id[token];
    delete map_id_to_token[id];
    delete map_token_to_id[token];
    delete map_token_to_heartbeat[token];
}
//heart beat
const CLEAR_INTERVAL_MS = 5*60*1000 //执行清理的时间
const DEAD_INTERVAL_MS = 5*60*1000 //判定死亡的时间
setInterval(()=>{
    console.log(`*** 清理死亡token`)
    const time_now = +(new Date())
    for(let token in map_token_to_heartbeat){
        if(time_now - map_token_to_heartbeat[token] <= DEAD_INTERVAL_MS){
            console.log(`... 通过 ${token}`);
            continue
        }
        console.log(`... 死亡 ${token}`);
        discardToken(token);
    }
    console.log(`@@@ 清理完毕!`);
},CLEAR_INTERVAL_MS)