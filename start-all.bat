@echo off
setlocal enabledelayedexpansion

title Trend Compass - Local Service Launcher
cls
echo =====================================================================
echo                Trend Compass - Local Service Launcher
echo       NASA Space Apps Challenge: Earth System Trend Detective
echo =====================================================================
echo.

:: Resolve workspace root directory
set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

:: 1. Detect and verify Python environment
echo [1/4] Checking Python environment...
set "PYTHON_EXEC="

:: Check virtual environment in root .venv or api\.venv
if exist "%ROOT_DIR%.venv\Scripts\python.exe" (
    "%ROOT_DIR%.venv\Scripts\python.exe" -c "import fastapi" >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_EXEC=%ROOT_DIR%.venv\Scripts\python.exe"
        echo  -- Found Python in root .venv with required dependencies.
    )
)

if "!PYTHON_EXEC!"=="" if exist "%ROOT_DIR%api\.venv\Scripts\python.exe" (
    "%ROOT_DIR%api\.venv\Scripts\python.exe" -c "import fastapi" >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_EXEC=%ROOT_DIR%api\.venv\Scripts\python.exe"
        echo  -- Found Python in api\.venv with required dependencies.
    ) else (
        echo  -- Virtual environment found, installing missing dependencies...
        "%ROOT_DIR%api\.venv\Scripts\python.exe" -m pip install -r "%ROOT_DIR%api\requirements.txt"
        if !errorlevel! equ 0 (
            set "PYTHON_EXEC=%ROOT_DIR%api\.venv\Scripts\python.exe"
            echo  -- Dependencies installed successfully in api\.venv.
        )
    )
)

:: If api\.venv is not ready, search for a valid system Python or py launcher
if "!PYTHON_EXEC!"=="" (
    set "SYSTEM_PY="
    :: Test python command first (ensure it's not the dummy Windows Store alias)
    python -c "import sys" >nul 2>&1
    if !errorlevel! equ 0 (
        set "SYSTEM_PY=python"
    ) else (
        :: Test py launcher (standard on Windows)
        py -c "import sys" >nul 2>&1
        if !errorlevel! equ 0 (
            set "SYSTEM_PY=py"
        )
    )

    if defined SYSTEM_PY (
        echo  -- Found !SYSTEM_PY! on system. Setting up virtual environment in api\.venv...
        !SYSTEM_PY! -m venv "%ROOT_DIR%api\.venv"
        if exist "%ROOT_DIR%api\.venv\Scripts\python.exe" (
            echo  -- Installing packages from api\requirements.txt...
            "%ROOT_DIR%api\.venv\Scripts\python.exe" -m pip install -r "%ROOT_DIR%api\requirements.txt"
            if !errorlevel! equ 0 (
                set "PYTHON_EXEC=%ROOT_DIR%api\.venv\Scripts\python.exe"
                echo  -- Dependencies installed successfully in api\.venv.
            ) else (
                echo [ERROR] Failed to install dependencies into api\.venv.
            )
        ) else (
            :: Fallback: try direct execution if venv creation failed
            !SYSTEM_PY! -c "import fastapi" >nul 2>&1
            if !errorlevel! equ 0 (
                set "PYTHON_EXEC=!SYSTEM_PY!"
                echo  -- Found working dependencies in system Python.
            )
        )
    )
)

if "!PYTHON_EXEC!"=="" (
    echo [ERROR] Python 3.11+ was not found or is blocked by the Windows Store alias.
    echo.
    echo To resolve this:
    echo   1. Disable the Microsoft Store stub:
    echo      Settings ^> Apps ^> Advanced app settings ^> App execution aliases
    echo      Toggle OFF "python.exe" and "python3.exe".
    echo   2. Ensure Python 3.11+ is installed with "Add Python to PATH" enabled.
    echo.
    pause
    exit /b 1
)

:: 2. Detect Node.js and npm
echo.
echo [2/4] Checking Node.js and npm environment...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not found on system PATH.
    echo Please install Node.js version 18 or newer from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
for /f "tokens=*" %%v in ('npm -v 2^>nul') do set "NPM_VER=%%v"
echo  -- Found Node.js !NODE_VER! and npm !NPM_VER!.

:: Check if web\node_modules exists
if not exist "%ROOT_DIR%web\node_modules\" (
    echo  -- web\node_modules not found. Installing frontend dependencies...
    cd /d "%ROOT_DIR%web"
    call npm install
    cd /d "%ROOT_DIR%"
)

:: 3. Start Backend Service (FastAPI)
echo.
echo [3/4] Starting FastAPI Backend on port 8000...
start "Trend Compass API (FastAPI - Port 8000)" cmd /k "cd /d "%ROOT_DIR%" && set "PYTHONPATH=%ROOT_DIR%" & set "PORT=8000" & set "DATA_ADAPTER=gistemp" & set "OPENBLAS_NUM_THREADS=1" & "!PYTHON_EXEC!" main.py"

:: 4. Start Frontend Service (Next.js)
echo.
echo [4/4] Starting Next.js Frontend on port 3000...
start "Trend Compass Web (Next.js - Port 3000)" cmd /k "cd /d "%ROOT_DIR%web" && set "PY_API_URL=http://127.0.0.1:8000" & npm run dev"

:: Wait for services to initialize
echo.
echo Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

echo.
echo =====================================================================
echo                    All Services Started!
echo =====================================================================
echo.
echo   * Web Application:       http://localhost:3000
echo   * Backend API:           http://127.0.0.1:8000
echo   * API Documentation:     http://127.0.0.1:8000/docs
echo   * Health Check:          http://127.0.0.1:8000/health
echo.
echo Both services are running in their respective command prompt windows.
echo To stop a service, close its terminal window or press Ctrl+C in it.
echo =====================================================================
echo.

:: Automatically open browser
start http://localhost:3000

echo Services are running. You can keep this launcher open or close it.
pause
