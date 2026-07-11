@echo off
setlocal
set ROOT=%~dp0
set SRC=%ROOT%..\BlockMir_WebApp_PlayStore
set DST=%ROOT%BlockMir\www

if not exist "%SRC%\index.html" (
  echo HATA: WebApp bulunamadi: %SRC%
  exit /b 1
)

if not exist "%DST%" mkdir "%DST%"
robocopy "%SRC%" "%DST%" /E /XO /NFL /NDL /NJH /NJS /nc /ns /np
if %ERRORLEVEL% GEQ 8 (
  echo HATA: Kopyalama basarisiz.
  exit /b 1
)
if not exist "%DST%\assets\mir-soft.jpg" (
  echo UYARI: mir-soft.jpg eksik. Android assets klasorunden kopyalayin.
)

echo.
echo OK: Web dosyalari kopyalandi -> %DST%
echo Android / Play Store projesine dokunulmadi.
exit /b 0
