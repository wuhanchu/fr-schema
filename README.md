简体中文 | [English](./README.en.md)

# antd_design_pro_starter

这个项目主要是在[fr-schema](https://github.com/wuhanchu/fr-schema.git),[antd_design_pro](https://github.com/ant-design/ant-design-pro.git),[fr-schema-antd-utils](https://github.com/wuhanchu/fr-schema-antd-utils.git)的基础上，组建出一个快速的开发模版。

## 安装环境

Install `node_modules`:

```bash
npm install
```

or

```bash
yarn installe
```

### 运行

```bash
npm start
```

### 编译

```bash
npm run build
```

### 检查代码规范

```bash
npm run lint
```

你可以运行下面的代码来修改代码规范问题:

```bash
npm run prettier
```

### 运行单元测试

```bash
npm test
```

## 部署

### 编译镜像

```docker
docker build  -t antd_design_pro_starter --file docker/Dockerfile.hub  .
```

### 运行容器

```docker
docker run --rm  -p 8000:80 --name antd_design_pro_starter -e SERVER_URL='http://192.168.1.150:5002' antd_design_pro_starter
```

-   端口 80: web 访问端口
-   SERVER_URL: 后端服务地址

### 导入导出镜像

-   导出镜像：docker save -o ./antd_design_pro_starter.docker antd_design_pro_starter
-   导入镜像：docker load ‒‒input antd_design_pro_starter.docker

## More

使用到的一些组件可以在[official website](https://pro.ant.design)中找到. 如果你不喜欢我开发的模版，你可以访问[github](https://github.com/ant-design/ant-design-pro)是一个很优秀的脚手架.
