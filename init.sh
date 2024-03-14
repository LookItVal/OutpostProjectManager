#!/bin/zsh

echo "Please enter the name of the new directory:"
read directory
# if name exists as directory
if [ -d $directory ]; then
  echo "The directory $directory already exists."
  exit 1
fi
echo "Please enter the script id:"
read script

mkdir $directory
mv appsscript.json appsscript.json.bak

# make .clasp.json file with script id inside in the new directory
echo "{\"scriptId\":\"$script\",\"rootDir\":\"/home/quinn/projects/OutpostProjectManager\"}" > $directory/.clasp.json
# make .claspignore file and update the others
state=0
while IFS= read -r line
do
  if [ $state -eq 0 ]; then
    echo "# $(echo $directory | tr '[:lower:]' '[:upper:]')" > $directory/.claspignore
    state=1
    continue
  fi
  if [  $state -eq 1 ]; then
    if [ "$line" = "# local" ]; then
      echo "# src" >> $directory/.claspignore
      echo "src/**" >> $directory/.claspignore
      state=2
      continue
    fi 
    echo $line >> $directory/.claspignore
    continue
  fi
  if [ $state -eq 2 ]; then
    if [ "$line" = "# subscripts" ]; then
      echo "" >> $directory/.claspignore
      echo "# subscripts" >> $directory/.claspignore
      state=3
      continue
    fi
    continue
  fi
  if [ $state -eq 3 ]; then
      if [ $line = "" ]; then
        continue
      fi
      ignore_directory=${line%%/**}
      echo $line >> $directory/.claspignore
      echo "$directory/**" >> $ignore_directory/.claspignore
      continue
  fi
done < .claspignore
echo "$directory/**" >> .claspignore
unset state

# move the package.json file to the directory and pull
mv package.json $directory
cd $directory
clasp pull
cd ..

# move everything back
mv $directory/package.json .
mv appsscript.json $directory
mv appsscript.json.bak appsscript.json

# check if code.js exists in the root and if it does, delete it
if [ -f Code.js ]; then
  rm Code.js
fi

exit 0