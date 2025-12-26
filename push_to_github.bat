@echo off
echo ==========================================
echo Pushing Code to GitHub
echo ==========================================
echo.
echo Step 1: Initialize Git
git init
git add .
git commit -m "Initial commit"
git branch -M main

echo.
echo ==========================================
echo PASTE YOUR GITHUB REPO URL BELOW
echo (Example: https://github.com/username/my-repo.git)
echo ==========================================
set /p REPO_URL="Repo URL: "

echo.
echo Step 2: Adding Remote...
git remote add origin %REPO_URL%

echo.
echo Step 3: Pushing to GitHub...
git push -u origin main

echo.
echo Done! Check your GitHub page.
pause
