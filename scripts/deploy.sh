#!/bin/bash
# Remove current repo and gitignore
rm -rf .git
rm .gitignore

# Initialize fresh repo
git init

# Setting infos
git config user.name "Travis CI Deployment"
git config user.email "no-reply@example.com"

# Adding everything, including node-js
git add -f .
git commit -m "Automatic CI Deployment Commit"
# We redirect any output to
# /dev/null to hide any sensitive credential data that might otherwise be exposed.
git push --force --quiet "https://${git_user}:${git_password}@${git_target}" master:gh-pages > /dev/null 2>&1
