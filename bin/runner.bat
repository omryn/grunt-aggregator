@echo off
IF EXIST "%NODE_HOME%\node.exe" GOTO gotnode
echo ***********************************************************************************************
echo *                                                                                             *
echo *                              --- FATAL!!! STINKY NODE ---                                   *
echo *                                                                                             *
echo *          NODE_HOME is not defined or does not point to NodeJs base directory                *
echo *          NodeJs must be installed in the build environment (http://nodejs.org/download/)    *
echo *          And NODE_JOME should be set to NodeJs's base folder                                *
echo *          See Yoav Avrahami +972-54-2344146 for more details                                 *
echo *                                                                                             *
echo ***********************************************************************************************
EXIT 1
:gotnode
%* > %TEMP%\running.txt
IF %errorlevel% NEQ 0 ( exit %errorlevel% )
type %TEMP%\running.txt
del %TEMP%\running.txt
exit  %errorlevel%