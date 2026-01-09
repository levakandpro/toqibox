@echo off
echo ========================================
echo   TOQIBOX Export Server
echo ========================================
echo.

REM Проверка FFmpeg
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] FFmpeg НЕ НАЙДЕН!
    echo.
    echo Установите FFmpeg:
    echo   choco install ffmpeg
    echo.
    echo Или скачайте: https://www.gyan.dev/ffmpeg/builds/
    echo.
    pause
    exit /b 1
)

echo [OK] FFmpeg найден
ffmpeg -version | findstr "ffmpeg version"
echo.

REM Проверка node_modules
if not exist "node_modules" (
    echo [УСТАНОВКА] Устанавливаю зависимости...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Ошибка установки зависимостей!
        pause
        exit /b 1
    )
    echo.
)

echo [ЗАПУСК] Запускаю Export Server...
echo.
node server.js
