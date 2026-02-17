# NexusPHP qB 自动关联助手 (U2)

### 系统功能介绍
本项目是一个专为 NexusPHP 架构（以 U2 为例）设计的 Chrome 扩展，旨在实现网页端与 qBittorrent 客户端的无缝关联。

- **自动状态同步**：后台 Service Worker 定时（每 10 秒）通过 qB API 获取种子状态，并实时推送到所有打开的 U2 页面。
- **智能关联管理**：支持一键"抓取"详情页 Hash 并与本地 qB 任务关联。
- **远程任务控制**：在网页端直接对 qB 中的任务进行"开始"、"暂停"操作。
- **快捷添加任务**：支持一键下载种子并推送至 qB 客户端，自动添加标签。
- **数据管理中心**：提供 Options 页面，支持对 Hash 关联数据库进行 JSON 格式的导入、导出和清理。
- **Popup 快速查询**：点击扩展图标弹出快捷面板，支持输入 Hash 快速打开对应的 U2 详情页。

### 文件功能图
```text
src/
├── background/             # 后台服务 (Service Worker)
│   ├── index.ts            # 入口文件：消息分发与初始化
│   ├── alarms.ts           # 定时任务管理：控制同步频率
│   ├── api.ts              # qB API 通信：处理常规指令
│   ├── sync.ts             # 状态同步逻辑：获取 qB 数据并推送至页面
│   └── upload.ts           # 文件上传逻辑：推送种子至 qB
├── content/                # 内容脚本 (注入 U2 页面)
│   ├── index.ts            # 入口逻辑：页面初始化与事件委托
│   └── ui.ts               # UI 渲染层：DOM 操作、状态图标与控制按钮
├── popup/                  # 弹出面板
│   └── index.ts            # Hash 快速查询与跳转详情页
├── options/                # 设置页面
│   └── index.ts            # Hash 数据库管理逻辑
├── utils/                  # 公共工具库
│   └── index.ts            # 全局常量、配置、通用工具函数
├── assets/                 # 静态资源
│   └── style.css           # 页面注入样式
└── manifest.json           # 扩展配置文件
```

### 开发与构建
本项目采用现代前端工程化体系构建，基于 **Vite + TypeScript + Bun**。

#### 环境要求
- [Bun](https://bun.sh/) (推荐) 或 Node.js

#### 安装依赖
```bash
bun install
```

#### 开发模式
运行以下命令后，Vite 将监听文件变化并自动重新编译。
```bash
bun dev
```
然后在 Chrome 中加载项目根目录。

#### 生产编译
```bash
bun run build
```
编译后的插件位于 `dist` 目录。
