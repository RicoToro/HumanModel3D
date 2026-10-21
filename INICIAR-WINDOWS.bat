@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo        ANATOMIA 3D - INSTALACAO
echo ==========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale Node.js 20 ou superior em https://nodejs.org/ e execute este arquivo novamente.
  pause
  exit /b 1
)
echo Instalando dependencias. Na primeira vez, isso exige internet...
call npm install
if errorlevel 1 (
  echo.
  echo A instalacao falhou. Verifique sua conexao e tente novamente com: npm install
  pause
  exit /b 1
)
echo.
echo Iniciando o atlas. Mantenha esta janela aberta.
call npm run dev
pause
