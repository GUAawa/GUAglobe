const Cookie = {
    set(cname, cvalue,path = '/', exdays = 114514) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        // 添加 path=/ 和其他必要属性
        document.cookie = `${cname}=${cvalue}; ${expires}; path=${path}; SameSite=Lax`;
    },
    get(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) { return c.substring(name.length, c.length); }
        }
        return undefined;
    }
};