#!/bin/bash
yarn install
docker build . -f /docker/Dockerfile.hub -t asus.uglyxu.cn:35744/z_antd_design_pro_strater:master
docker push asus.uglyxu.cn:35744/z_antd_design_pro_strater:master
docker rmi asus.uglyxu.cn:35744/z_antd_design_pro_strater:master
docker pull asus.uglyxu.cn:35744/z_antd_design_pro_strater:master
# docker run asus.uglyxu.cn:35744/z_antd_design_pro_strater -p 8080:80 --name z_antd_design_pro_strater_master z_antd_design_pro_strater:master
docker run --rm -ti -p 8080:80 -e SERVER_URL=http://127.0.1.1:5000 --name z_antd_design_pro_strater_master asus.uglyxu.cn:35744/z_antd_design_pro_strater