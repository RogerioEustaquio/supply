@ECHO OFF
setlocal DISABLEDELAYEDEXPANSION
SET BIN_TARGET=%~dp0/../doctrine/doctrine-module/bin/doctrine-module
php "%BIN_TARGET%" %*
