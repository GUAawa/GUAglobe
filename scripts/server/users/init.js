//读取 users 并挂到 global.users
const fs = require("fs");
let users_str = fs.readFileSync("../../data/users.json");
// let users_json = JSON.parse(users_str);
// console.log(users_json);