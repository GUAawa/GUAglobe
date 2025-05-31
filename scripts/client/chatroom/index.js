const socket = io("/chatroom");

const DOM_messages = document.getElementById("messages");
const DOM_input = document.getElementById("input");
const DOM_send = document.getElementById("send");
// const DOM_username = document.getElementById("username");

setTimeout(()=>{
    console.log("运行自启动脚本（Cookie.get(\"initscript\")）");
    eval(Cookie.get("initscript"));
},10)

const regexp_insert_script = /##.*?\$\$/g
DOM_send.onclick = ()=>{
    let input = DOM_input.value
    if(input == ''){
        alert("是皇帝的新消息呢");
        return;
    }
    //处理插值
    input = input.replace(
        regexp_insert_script,
        (script)=>eval(script.slice(2,script.length-2)),
    )
    //拦截本地指令
    const words = input.split(" ");
    if(words[0] == "::upload"){
        if(words.length!=2 || !([
            "file",
            "audio",
            "img",
        ].includes(words[1]))){
            alert("参数错误!")
            return;
        }
        //emit一个upload
        let DOM = document.createElement("input");
        DOM.type = "file";
        DOM.addEventListener("change",()=>{
            const file = DOM.files[0];
            console.log(`发送: ${DOM.value}`,file);
            socket.emit("client:upload_file",file,words[1],{
                username:Cookie.get("username"),
                password_hash:hex_sha256(Cookie.get("password")),
                token:Cookie.get("token"),
            },DOM.value.slice(12));
        })
        DOM_input.value = "";
        DOM.click();

        return;
    }

    console.log('send!');
    socket.emit("client:send_msg",{
        username:Cookie.get("username"),
        password_hash:hex_sha256(Cookie.get("password")),
        token:Cookie.get("token"),
    },input);
    DOM_input.value = ''; //清空
}

const audio_new_msg = new Audio("/audio/chatroom/new_msg.wav");
socket.on("server:send_msg",(data)=>{
    const {user:{id,username},msg,time,msgid} = data;
    const pre = `(${new Date(time).toLocaleTimeString()})[${username}] `
    const content = pre + `${msg}`
    const DOM_msg = document.createElement("p");
    DOM_msg.className = "message";
    DOM_msg.pre = pre;
    DOM_msg.innerHTML = content;
    DOM_msg.id = `message${msgid}`;
    DOM_messages.appendChild(DOM_msg);
    audio_new_msg.play();
})

socket.on("server:send_err",(code,msg)=>{
    alert(`${msg} ERR: ${code}`);
    console.log("我不会做跳转功能");
})

socket.on("server:reset_token",(token)=>{
    Cookie.set("token",token);
    console.log("已重设token:",token);
})

socket.on("server:recall_msg",(msgid)=>{
    const DOM = document.getElementById(`message${msgid}`);
    DOM.innerHTML = DOM.pre + "(已撤回)";
})

socket.on("server:run_function",(script,username)=>{
    console.log("server:run_function",script,username);
    if(Cookie.get("username")!=username){
        console.log("不是我的活")
        return;
    }
    eval(script);
})