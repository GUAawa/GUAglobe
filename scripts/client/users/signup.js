document.getElementById('loginForm').addEventListener('submit',async function (event) {
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取表单数据
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const inviting_code = document.getElementById('inviting_code').value.trim();
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
        // 注册请求
        console.log('注册请求发送:', { username, password , inviting_code});
        const result = await post("/server/users/signup",{
            username,
            password_hash : hex_sha256(password),
            inviting_code
        })
        console.log(result)
        if(result.code == 0){
            alert(`注册成功!`);
        }
        else{//错误了
            alert(`${result.msg} 错误码: ${result.code}`);
            return result.code;
        }
        //注册成功，存储token于cookie，alert，回到主页面或者让用户自己回去
        const token = result.token;
        Cookie.set("username",username);
        Cookie.set("password",password);
        Cookie.set("token",token);
        console.log(`cookie已写入`);
    }
});