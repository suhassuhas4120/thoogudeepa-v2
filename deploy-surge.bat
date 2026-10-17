@echo off
echo ==============================================
echo Deploying Thoogudeepa V2 to Surge
echo ==============================================
echo.
echo [1/3] Building production static bundle...
call npx next build --webpack
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed. Please verify errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Preparing SPA routing fallback...
copy /Y out\index.html out\200.html

echo.
echo [3/3] Publishing to Surge...
call npx surge ./out --domain thoogudeepa-v2.surge.sh
echo.
echo ==============================================
echo Deployment completed!
echo Visit: https://thoogudeepa-v2.surge.sh
echo ==============================================
pause
