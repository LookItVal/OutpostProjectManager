#!/bin/zsh

# Import secondary utility scripts
. utilities/colors.sh

# if youve come this far im assuming you are using unix anyway so lets just assume you have python3 installed
# im not doing anything crazy i would just rather edit and parse files with something like python than bash

args=("$@")

#Basic Validation
if [ $# -gt 2 ]; then
  echo "Too many arguments provided. Only 0, 1, or 2 arguments are allowed."
  exit 1
fi
if [ $# -eq 0 ]; then
  echo "${ORANGE}USAGE: ${PURPLE}./feature.sh <${LIGHT_RED}bump${PURPLE}|${YELLOW}search${PURPLE}|${LIGHT_GREEN}todo${PURPLE}|${LIGHT_BLUE}new${PURPLE}>"
  exit 1
fi

if [ $1 = 'bump' ]; then
  if [ $# -eq 1 ]; then
    echo << EOM
USAGE:
feature.sh bump <major|minor|patch>
EOM
    exit 1
  fi
  python3 utilities/feature.py bump $2
fi

exit 0