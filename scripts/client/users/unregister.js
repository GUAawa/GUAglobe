document.getElementById('loginForm').addEventListener('submit',async function (event) {
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取表单数据
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const password_again = document.getElementById('password_again').value.trim();
    console.log(`提交`,{username,password});
    // 简单的表单验证
    let isValid = true;
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const password_againError = document.getElementById("password_againError");

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
    if (password != password_again) {
        password_againError.textContent = '两次密码不一致';
        isValid = false;
    } else {
        password_againError.textContent = '';
    }
    if (isValid) {
        // 注销请求
        console.log('注销请求发送:', { username, password});
        const result = await post("/server/users/unregister",{
            username,
            password_hash : hex_sha256(password)
        })
        console.log(result)
        if(result.code == 0){
            alert(`注销成功!`);
        }
        else{//错误了
            alert(`${result.msg} 错误码: ${result.code}`);
            return result.code;
        }
        //注销成功，删除cookie，alert，回到主页面或者让用户自己回去
        const token = result.token;
        Cookie.set("username",username,exdays = -1);
        Cookie.set("password",password,exdays = -1);
        Cookie.set("token",token,exdays = -1);
        console.log(`cookie已写入`);
    }
});