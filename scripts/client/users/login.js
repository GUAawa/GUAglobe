document.getElementById('loginForm').addEventListener('submit',async function (event) {
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取表单数据
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

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
        // 模拟登录成功后跳转到首页
        alert('登录成功！');
        // window.location.href = '/'; // 跳转到首页
    }
});