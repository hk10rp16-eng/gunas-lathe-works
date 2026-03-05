@echo off
echo ========================================
echo  Guna's Lathe Works - Starting Backend
echo ========================================
echo.

cd Backend

echo Checking if node_modules exists...
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo Starting backend server on port 5000...
echo.
start cmd /k "npm start"

echo.
echo ========================================
echo Backend server started successfully!
echo Server running at: http://localhost:5000
echo.
echo To start frontend:
echo 1. Open Frontend/index.html in your browser
echo 2. Or run: cd Frontend && npx http-server -p 3000
echo ========================================
echo.
pause
