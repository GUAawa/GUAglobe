document.getElementById('loginForm').addEventListener('submit',async function (event) {
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取表单数据
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    console.log(`提交`,{username,password});
    // 简单的表单验证
    let isValid = true;
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');

    if (!username) {
        usernameError.textContent = '用户名不能为空';
        isValid = false;
    } else {
        usernameError.textContent = '';
    }
    if (!password) {
        passwordError.textContent = '密码不能为空';
        isValid = false;
    } else {
        passwordError.textContent = '';
    }
    if (isValid) {
        // 登录请求
        console.log('登录请求发送:', { username, password });
        const result = await post("/server/users/login",{
            username,
            password_hash : hex_sha256(password)
        })
        console.log(result)
        if(result.code == 1){
            alert(`登录过了哟~`);
        }else if(result.code == 0){
            alert(`登录成功!`);
        }
        else{//错误了
            alert(`${result.msg} 错误码: ${result.code}`);
            return result.code;
        }
        //登录成功，存储token于cookie，alert，回到主页面或者让用户自己回去
        const token = result.token;
        Cookie.set("username",username);
        Cookie.set("password",password);
        Cookie.set("token",token);
        console.log(`cookie已写入`);
    }
});