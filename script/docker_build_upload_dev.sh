#!/bin/bash
npm run build:dataknown
docker build  -t registry.cn-hangzhou.aliyuncs.com/dataknown/z_know_info_web:$1 --file docker/Dockerfile.hub  .
docker push registry.cn-hangzhou.aliyuncs.com/dataknown/z_know_info_web:$1
