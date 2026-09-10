@echo off
cd /d "%~dp0"
call npm run make:windows
if errorlevel 1 (echo Installer build failed. Read the error above. & pause & exit /b 1)
echo Installer build completed. See out\make\squirrel.windows\x64
explorer "out\make\squirrel.windows\x64"
pause
