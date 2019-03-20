#!/usr/bin/sh

cd ..
tar --exclude='.*' --exclude='node_modules' -czvf minicle.tgz minicle
cd minicle
