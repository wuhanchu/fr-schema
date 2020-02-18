yarn install
npm run build
zip -r -9 dist.zip ./dist
scp  ./dist.zip root@server.aiknown.cn:/data/tmp
ssh  root@*** "cd /data/tmp; unzip -o dist; cp -fr ./dist/* /data;"
rm ./dist.zip
git checkout dist
git clean -fd dist
