@echo off

clear
git status
git log --oneline -5
node git-commit-prompt.js
git log --oneline -10