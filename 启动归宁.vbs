Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
AppDir = FSO.GetParentFolderName(WScript.ScriptFullName)

' 关闭已有的 Edge 进程（确保 --app 模式生效）
WshShell.Run "taskkill /f /im msedge.exe", 0, True
WScript.Sleep 1000

' 用完整路径启动 Node
NodeExe = "C:\Program Files\nodejs\node.exe"
If Not FSO.FileExists(NodeExe) Then NodeExe = "node"

' 静默启动服务器
WshShell.Run """" & NodeExe & """ """ & AppDir & "\server.js""", 0, False
WScript.Sleep 2500

' 以独立应用窗口打开
WshShell.Run "msedge --new-window --app=http://localhost:5173 --start-maximized", 1, False
