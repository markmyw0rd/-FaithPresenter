@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Install Node.js LTS first, then reopen this file. & pause & exit /b 1)
call npm ci
if errorlevel 1 (echo Dependency installation failed. Read the error above. & pause & exit /b 1)
echo Dependencies installed. Next: open 02-Run-FaithPresenter.cmd
pause
