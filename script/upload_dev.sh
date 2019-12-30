#!/bin/bash
yarn install
npm run build
zip -r -9 dist.zip ./dist
scp -P 15022 ./dist.zip root@server.aiknown.cn:/data/tmp
ssh -p 15022 root@server.aiknown.cn "cd /data/tmp; unzip -o dist; cp -fr ./dist/* /data/z_markgo_web;"
rm ./dist.zip
git checkout dist
git clean -fd dist