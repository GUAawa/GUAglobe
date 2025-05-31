module.exports.socket = function(io){
    const io_this = io.of("shellfish_running");
    io_this.on("connection",(socket)=>{
    })
}