const fs = require("fs")
module.exports = {
    bindVariableToFile(var_name,path,read_fix = (x)=>x ,write_fix = (x)=>x){
        global[var_name] = read_fix(fs.readFileSync(path));
        console.log(`^^^ 已读取 ${path} , 赋值给 global.${var_name}`)
        
        process.on('SIGINT',()=>{
            fs.writeFileSync(path,write_fix(global[var_name]));
            console.log(`^^^ 已写入 ${path} , 数据为 global.${var_name}`);
        })
    }
}