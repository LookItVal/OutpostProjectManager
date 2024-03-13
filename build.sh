#!/bin/zsh

args=("$@")

# Check if to make sure only 0 or 1 arg was provided
if [ $# -gt 1 ]; then
  echo "Too many arguments provided. Only 0 or 1 argument is allowed."
  exit 1
fi

# Init empty directory variable
directory=""

if [ $# -eq 1 ]; then
  # Check if the first argument is a valid directory
  if [ -d $1 ]; then
    directory=$1
  else
    echo "The directory $1 does not exist."
    exit 1
  fi
fi

if [ $# -eq 0 ]; then
  clasp push
  exit 0
fi

# Rename the current appsscript.json file to appsscript.json.bak
mv appsscript.json appsscript.json.bak

# Create a new symlink from the appsscript.json file in the directory to the root
# Check to make sure appscript file exists in the directory
if [ -f $directory/appsscript.json ]; then
  ln -s $directory/appsscript.json appsscript.json
else
  echo "The appsscript.json file does not exist in the directory $directory."
  exit 1
fi

# move the package.json file to the directory
mv package.json $directory

cd $directory
clasp push
cd ..

# move the package.json file back to the root
mv $directory/package.json .

# Remove the symlink and rename the appsscript.json.bak file back to appsscript.json
rm appsscript.json
mv appsscript.json.bak appsscript.json
exit 0
