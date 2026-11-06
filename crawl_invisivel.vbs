Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
' 0 = Janela Oculta (Nenhum CMD visual abre na tela)
WshShell.Run "cmd /c .\.bin\node.cmd ./scripts/discover.mjs", 0, False
