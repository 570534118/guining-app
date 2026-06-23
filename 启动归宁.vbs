Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
AppDir = FSO.GetParentFolderName(WScript.ScriptFullName)

' 静默启动 Node.js 服务器（不弹终端）
WshShell.Run "node """ & AppDir & "\server.js""", 0, False

' 等待服务器启动
WScript.Sleep 2000

' 全屏打开 Edge
WshShell.Run "msedge --app=http://localhost:5173 --start-fullscreen --window-size=1920,1080", 1, False
