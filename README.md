## Sales Assistant 销售助手项目文档

### 项目简介

本项目是基于 Node.js 开发的销售助手全栈应用，采用 MVC 分层架构，配套完整 Docker
容器化部署方案，支持本地局域网访问、公网线上访问，内置二维码快速生成脚本，一键构建、启动、推送镜像。
目录结构

```plaintext
├── Makefile
├── qrcode.png
├── README.md
└── sales-assistant
    ├── docker
    │   ├── docker-compose.yaml
    │   └── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── public
    │   ├── css
    │   ├── home.html
    │   ├── js
    │   └── login.html
    └── src
        ├── app.js
        ├── config
        ├── controllers
        ├── db
        ├── middlewares
        ├── routes
        ├── server.js
        └── services
```

### 开发调试

### 项目“sales-assistant”目录

```dotenv
# 服务端口
LT_SALES_HTTP_PORT=3000
# 服务初始化sql文件位置
LT_SALES_INIT_SQL_PATH=

# PostgreSQL 数据库配置
LT_SALES_DB_HOST=127.0.0.1
LT_SALES_DB_PORT=5432
LT_SALES_DB_USER=linkedti
LT_SALES_DB_PASS=linkedti
LT_SALES_DB_NAME=sales

# JWT密钥
LT_SALES_JWT_SECRET=7f29ac6e35d0b82147ce90f531a68b74e2d0f9c6713580e4b12659c38ad701fe54b289c036d15a7ef20b45
```

### 环境依赖

#### 基础运行环境

```text
Docker & Docker Compose
GNU Make（执行 Makefile 脚本）
Node.js 16+（本地开发调试可选）
```

### 二维码生成工具（可选）

#### 如需使用 qr-* 相关命令，系统需安装 qrencode：

#### 未安装时可通过在线网站 http://cli.im/url 手动生成二维码。

```bash
# 运行
# CentOS / RHEL
yum install qrencode -y

# Ubuntu / Debian
apt install qrencode -y

# MacOS
brew install qrencode
```
