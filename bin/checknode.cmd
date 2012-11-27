@echo off
IF EXIST "%NODE_HOME%\node.exe" EXIT
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