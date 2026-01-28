# R2 Explorer

一个精美的 Cloudflare R2 桌面客户端，使用 Tauri 2.0 + React + TypeScript 构建。

## 功能特性

- 多账户管理
- 存储桶浏览与管理
- 文件上传/下载/删除
- 文件夹导航与创建
- 网格/列表视图切换
- 深色/浅色主题
- 传输队列管理
- 凭证安全存储

## 截图

(待添加)

## 安装

### 下载预编译版本

从 [Releases](../../releases) 页面下载对应平台的安装包：

- **Windows**: `.msi` 或 `.exe`
- **macOS**: `.dmg`
- **Linux**: `.AppImage` 或 `.deb`

### 从源码构建

#### 前置要求

- Node.js >= 18
- Rust >= 1.70
- 平台特定依赖：

**Windows:**
- Visual Studio Build Tools (C++ 桌面开发)

**macOS:**
- Xcode Command Line Tools

**Linux (Ubuntu/Debian):**
```bash
sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libsecret-1-dev
```

#### 构建步骤

```bash
# 克隆仓库
git clone https://github.com/your-username/r2-explorer.git
cd r2-explorer

# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建发布版本
npm run tauri build
```

## 使用说明

### 添加账户

1. 点击侧边栏的 `+` 按钮
2. 填写账户信息：
   - **账户名称**: 自定义名称
   - **Account ID**: Cloudflare Account ID
   - **Access Key ID**: R2 API Token 的 Access Key
   - **Secret Access Key**: R2 API Token 的 Secret Key

> 在 Cloudflare Dashboard > R2 > Manage R2 API Tokens 中创建 API Token

### 文件操作

- **上传**: 点击工具栏「上传」按钮或拖拽文件
- **下载**: 选中文件后点击「下载」
- **删除**: 选中文件后点击「删除」
- **新建文件夹**: 点击工具栏「新建文件夹」按钮

## 技术栈

### 前端
- React 18
- TypeScript
- Tailwind CSS
- Zustand (状态管理)
- Framer Motion (动画)
- Lucide Icons

### 后端
- Tauri 2.0
- Rust
- aws-sdk-s3 (R2 兼容)
- keyring (安全存储)

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev

# 类型检查
npm run build

# Rust 检查
cd src-tauri && cargo check
```

## 许可证

MIT License
