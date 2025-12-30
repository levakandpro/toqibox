@echo off
title TOQIBOX DEV
cd /d %~dp0

echo ===============================
echo TOQIBOX - запуск dev сервера
echo ===============================
echo.

REM Проверяем, установлен ли npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ОШИБКА] npm не найден! Установите Node.js
    echo.
    pause
    exit /b 1
)

REM Проверяем, занят ли порт
netstat -ano | findstr :5174 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [ВНИМАНИЕ] Порт 5174 уже занят!
    echo Dev сервер уже запущен или другой процесс использует порт.
    echo.
    echo Хотите остановить процесс на порту 5174? (Y/N)
    set /p killport=
    if /i "%killport%"=="Y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5174 ^| findstr LISTENING') do (
            echo Останавливаю процесс %%a...
            taskkill /PID %%a /F >nul 2>&1
        )
        timeout /t 2 >nul
    ) else (
        echo Запускаю на занятом порту...
    )
)

echo.
echo Запускаю dev сервер...
echo Если увидите ошибку - она будет показана ниже
echo.
echo ===============================
echo.

npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===============================
    echo [ОШИБКА] Dev сервер не запустился!
    echo Код ошибки: %ERRORLEVEL%
    echo ===============================
    echo.
    pause
    exit /b %ERRORLEVEL%
)

pause
