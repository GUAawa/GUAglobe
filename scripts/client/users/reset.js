document.getElementById('loginForm').addEventListener('submit',async function (event) {
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取表单数据
    const old_username = document.getElementById('old_username').value.trim();
    const old_password = document.getElementById('old_password').value.trim();
    const new_username = document.getElementById('new_username').value.trim();
    const new_password = document.getElementById('new_password').value.trim();
    console.log(`提交`,{old_username,old_password,new_username,new_password});
    // 简单的表单验证
    let isValid = true;
    const old_usernameError = document.getElementById('old_usernameError');
    const old_passwordError = document.getElementById('old_passwordError');
    const new_usernameError = document.getElementById('new_usernameError');
    const new_passwordError = document.getElementById('new_passwordError');

    if (!old_username) {
        old_usernameError.textContent = '用户名不能为空';
        isValid = false;
    } else {
        old_usernameError.textContent = '';
    }
    if (!old_password) {
        old_passwordError.textContent = '密码不能为空';
        isValid = false;
    } else {
        old_passwordError.textContent = '';
    }
    if (!new_username) {
        new_usernameError.textContent = '用户名不能为空';
        isValid = false;
    } else {
        new_usernameError.textContent = '';
    }
    if (!new_password) {
        new_passwordError.textContent = '密码不能为空';
        isValid = false;
    } else {
        new_passwordError.textContent = '';
    }
    if (isValid) {
        // 登录请求
        console.log('修改请求发送:', {old_username,old_password,new_username,new_password});
        const result = await post("/server/users/reset",{
            old_username,
            old_password_hash : hex_sha256(old_password),
            new_username,
            new_password_hash : hex_sha256(new_password),
        })
        console.log(result)
        if(result.code == 0){
            alert(`修改成功!`);
        }
        else{//错误了
            alert(`${result.msg} 错误码: ${result.code}`);
            return result.code;
        }
        //登录成功，存储token于cookie，alert，回到主页面或者让用户自己回去
        const token = result.token;
        Cookie.set("username",new_username);
        Cookie.set("password",new_password);
        Cookie.set("token",token);
        console.log(`cookie已写入`);
    }
});