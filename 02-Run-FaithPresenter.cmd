@echo off
cd /d "%~dp0"
call npm start
if errorlevel 1 echo FaithPresenter did not start. Read the error above.
pause
