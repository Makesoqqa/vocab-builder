@echo off
echo ==========================================
echo Fixing Git and Pushing to GitHub
echo ==========================================
echo.
echo Step 1: Cleaning up...
git rm -r --cached .
git add .
git commit -m "Ready for deployment"
git branch -M main

echo.
echo ==========================================
echo PASTE YOUR GITHUB REPO URL BELOW
echo (Example: https://github.com/username/my-repo.git)
echo ==========================================
set /p REPO_URL="Repo URL: "

echo.
echo Step 2: Adding Remote...
git remote remove origin
git remote add origin %REPO_URL%

echo.
echo Step 3: Pushing to GitHub...
git push -u origin main --force

echo.
echo Done! Check your GitHub page.
pause
