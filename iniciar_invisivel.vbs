Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
' 0 = Janela Oculta (Nenhum CMD visual abre na tela)
WshShell.Run "cmd /c .\.bin\node.cmd ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 3000", 0, False
