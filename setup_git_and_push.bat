@echo off
echo ==========================================
echo Git Setup & Push
echo ==========================================
echo.
echo It looks like Git does not know who you are yet.
echo We need to configure your Name and Email once.
echo.

set /p GIT_EMAIL="Enter your Email (e.g. you@gmail.com): "
set /p GIT_NAME="Enter your Name (e.g. John Doe): "

echo.
echo Configuring Git...
git config --global user.email "%GIT_EMAIL%"
git config --global user.name "%GIT_NAME%"

echo.
echo Retrying Commit and Push...
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
echo Adding Remote...
git remote remove origin
git remote add origin %REPO_URL%

echo.
echo Pushing to GitHub...
git push -u origin main --force

echo.
echo Done! Please check your GitHub now.
pause
