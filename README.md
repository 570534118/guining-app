# 归宁

一个基于 Electron + React + Supabase 的公司内部社交桌面应用。

## 功能

- 🏠 公司文化主页 - 展示公司使命、价值观、公告
- 👥 好友系统 - 搜索、添加、管理好友
- 📢 公共动态 - 发布文字/图片动态，评论互动
- 💬 私信聊天 - 好友间一对一实时聊天
- 🔔 消息通知 - 评论、私信到达提醒
- 👤 个人主页 - 展示个人信息和动态
- ⚙️ 管理员后台 - 用户管理、内容审核

## 技术栈

- **前端**: React 19 + TypeScript + Tailwind CSS
- **桌面**: Electron 42
- **后端**: Supabase (BaaS)
- **状态管理**: Zustand + TanStack Query
- **路由**: React Router v7

## 前置条件

1. 安装 [Node.js](https://nodejs.org/) (v20 或更高)
2. 注册 [Supabase](https://supabase.com/) 免费账号并创建项目

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 在 Supabase 项目中，进入 **SQL Editor**，复制 `supabase-init.sql` 的内容并执行
2. 在 **Storage** 中创建两个公开存储桶: `avatars` 和 `post-images`
3. 在项目设置 > API 中找到你的 `URL` 和 `anon key`
4. 编辑 `.env` 文件，填入你的 Supabase 配置:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 启动开发模式

```bash
# 仅启动前端 (在浏览器中查看)
npm run dev

# 启动 Electron 桌面应用
npm run dev:electron
```

### 4. 打包为 Windows 安装包

```bash
npm run build:electron
```

打包后的安装包在 `release/` 目录中。

## 项目结构

```
social-app/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口
│   └── preload.ts        # 预加载脚本
├── src/                   # React 前端
│   ├── components/        # UI 组件
│   │   ├── layout/       # 布局组件
│   │   ├── ui/           # 基础组件
│   │   ├── feed/         # 动态组件
│   │   ├── chat/         # 聊天组件
│   │   └── friends/      # 好友组件
│   ├── pages/            # 页面
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   ├── store/            # 状态管理
│   └── types/            # TypeScript 类型
└── supabase-init.sql      # 数据库初始化脚本
```

## 首次使用

1. 启动应用后，点击"立即注册"创建账号
2. 登录后进入公司主页
3. 添加好友 → 搜索用户名 → 发送好友请求
4. 在公共动态中发布内容
5. 进入私信与好友聊天

## 设置管理员

在 Supabase 控制台 > Table Editor > profiles 中，将用户的 `is_admin` 字段设为 `true`。
