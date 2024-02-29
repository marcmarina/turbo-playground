#!/bin/bash

DEPS_DIR=./deps/

# Recreate deps folder if necessary
[ -d $DEPS_DIR ] && rm -rf $DEPS_DIR
[ ! -d $DEPS_DIR ] && mkdir $DEPS_DIR

# Copy yarn files
cp package.json $DEPS_DIR/
cp yarn.lock $DEPS_DIR/
cp -r .yarn $DEPS_DIR/
cp .yarnrc.yml $DEPS_DIR/
cp turbo.json $DEPS_DIR/


# Accepts the folder as argument in which to look for package.json files recursively
# Ex: copyPackageJSONs "./services"
# The above will copy all package.json files in the sub-folders of ./services
# to the $DEPS_DIR folder keeping the folders structure
function copyPackageJSONs() {
  PACKAGE_JSONS=$(find $1 -type f -name package.json ! -path "*node_modules*")

  for package in $PACKAGE_JSONS
  do
    PACKAGE_FOLDER=$DEPS_DIR$(echo $package | awk -Fpackage.json '{print $1}')

    [ ! -d $PACKAGE_FOLDER ] && mkdir -p $PACKAGE_FOLDER

    cp -r $package $PACKAGE_FOLDER
  done
}

# Copy all package.json files in ./apps/*
copyPackageJSONs "./apps"

# Copy all package.json files in ./packages/*
copyPackageJSONs "./packages"
