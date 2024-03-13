#!/bin/zsh

echo "Please enter the name of the new directory:"
read directory
# if name exists as directory
if [ -d $directory ]; then
  echo "The directory $directory already exists."
  exit 1
fi
# create new directory
mkdir $directory

echo "Please enter the script id:"
read script

# rename root appsscript.json file to appsscript.json.bak
mv appsscript.json appsscript.json.bak

# make .clasp.json file with script id inside in the new directory
echo "{\"scriptId\":\"$script\",\"rootDir\":\"/home/quinn/projects/OutpostProjectManager\"}" > $directory/.clasp.json

# copy the .claspignore file to the new directory
cp .claspignore $directory

# add the src directory to the .claspignore file
echo "src/**" >> $directory/.claspignore

# move the package.json file to the directory
mv package.json $directory

cd $directory
clasp pull
cd ..

# move the package.json file back to the root
mv $directory/package.json .

# move the .appsscript.json file to the directory
mv appsscript.json $directory

# rename the appsscript.json.bak file back to appsscript.json
mv appsscript.json.bak appsscript.json
exit 0