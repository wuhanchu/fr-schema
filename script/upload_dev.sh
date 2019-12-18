#!/bin/bash
yarn install
npm run build
zip -r -9 dist.zip ./dist
scp -P 15022 ./dist.zip root@39.105.193.154:/data/tmp
ssh -p 15022 root@39.105.193.154 "cd /data/tmp; unzip -o dist; \cp -fr ./dist/* /data/z_markgo_web;"
rm ./dist.zip
git checkout dist
git clean -fd dist