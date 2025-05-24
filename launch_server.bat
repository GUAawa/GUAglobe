@echo off
title launch frpc and server
echo launching...

:: 检查 frpc.exe 是否正在运行
tasklist | findstr "frpc.exe" > nul
if %errorlevel% == 0 (
    echo *** frpc has already been launched...
) else (
    echo *** launching frpc...
    start cmd /k "cd /d "D:\ChmlFrp-0.51.2_240715_windows_amd64" && frpc.exe"
)

:: 在当前窗口启动服务器
echo *** launching server...
::cd /d "./"
node index.js