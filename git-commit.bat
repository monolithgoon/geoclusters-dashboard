@echo off

echo Automating Git commit...
node git-commit.js
git log --oneline -5