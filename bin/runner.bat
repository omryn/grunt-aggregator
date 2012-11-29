@echo off
%* > %TEMP%\running.txt
set /A runningerror = %errorlevel%
cd %TEMP%
type running.txt
del running.txt
exit %runningerror%