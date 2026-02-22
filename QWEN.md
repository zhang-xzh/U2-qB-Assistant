# U2-qB-Assistant 项目上下文

## 项目概述

**U2 助手** 是一个专为 **U2 次元 (u2.dmhy.org)** 设计的浏览器扩展工具，提供站点增强功能和 qBittorrent 客户端联动。

### 核心功能

| 功能模块 | 描述 |
|---------|------|
| 🎨 界面美化 | 收藏图标替换为 FontAwesome 星星、种子标题智能换行 |
| 🪄 一键施放魔法 | 列表页/详情页批量施放 Free/2X 等优惠 |
| 🔄 qB 联动 | 自动状态同步、Hash 关联、远程开始/暂停、快捷添加 |
| 💾 数据管理 | Hash 数据库 JSON 导入/导出、数据清理 |

### 技术栈

- **类型**: Chrome/Firefox 浏览器扩展 (Manifest V3)
- **语言**: TypeScript
- **构建工具**: Vite + @crxjs/vite-plugin
- **依赖**: FontAwesome 图标库、web-ext (Firefox 打包)

## 项目结构

```
U2-qB-Assistant/
├── src/
│   ├── background/          # Service Worker 后台服务
│   │   ├── index.ts         # 消息分发入口
│   │   ├── api.ts           # qBittorrent API 通信
│   │   ├── sync.ts          # 状态同步逻辑
│   │   ├── upload.ts        # 种子文件上传
│   │   └── alarms.ts        # 定时任务 (10 秒同步)
│   ├── content/             # 内容脚本 (注入 U2 页面)
│   │   ├── index.ts         # 页面初始化与事件委托
│   │   ├── ui.ts            # UI 渲染、DOM 操作
│   │   └── magic.ts         # 魔法施放功能
│   ├── popup/               # 扩展图标弹出面板
│   ├── options/             # 设置页面 (Hash 管理)
│   ├── utils/               # 公共工具库
│   │   ├── index.ts         # 常量、配置、通用函数
│   │   └── icons.ts         # FontAwesome 图标初始化
│   └── assets/style.css     # 注入样式
├── public/
│   └── icon.png             # 扩展图标
├── manifest.json            # Chrome 扩展配置
├── manifest.firefox.json    # Firefox 扩展配置
├── popup.html               # Popup 页面
├── options.html             # Options 页面
├── vite.config.ts           # Vite 构建配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目依赖与脚本
```

## 构建与运行

### 环境要求

- **包管理器**: Bun (推荐) 或 Node.js >= 18
- **浏览器**: Chrome 或 Firefox 109+

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
# Chrome
bun dev

# Firefox
bun dev:firefox
```

### 生产构建

```bash
# Chrome - 输出到 dist/
bun run build

# Firefox - 输出到 dist-firefox/
bun run build:firefox
```

### 安装扩展

**Chrome:**
1. 访问 `chrome://extensions/`
2. 启用 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `dist` 目录

**Firefox:**
1. 访问 `about:debugging#/runtime/this-firefox`
2. 点击 **临时载入附加组件**
3. 选择 `dist-firefox/manifest.json`

## 开发约定

### 代码风格

- **TypeScript**: 严格模式 (`strict: true`)
- **模块**: ES Modules + bundler 解析
- **命名**: 驼峰命名法 (camelCase)，常量使用大写蛇形 (UPPER_SNAKE_CASE)

### 架构模式

- **背景页**: Service Worker 处理跨域请求和定时任务
- **内容脚本**: 注入 U2 页面，通过消息传递与背景页通信
- **消息类型**: `QB_API` (API 调用)、`QB_UPLOAD` (文件上传)

### 关键常量 (src/utils/index.ts)

```typescript
QB_BASE_URL = 'http://localhost:18000'  // qB 默认地址
STORAGE_KEY = 'qb_hash_map'             // 本地存储键名
ALARM_NAME = 'QB_SYNC_ALARM'            // 定时任务名称
UPLOAD_TAG = 'U2'                       // 默认标签
```

### 消息通信示例

```typescript
// 内容脚本 → 背景页
await chrome.runtime.sendMessage({
    type: 'QB_API',
    url: `${QB_BASE_URL}/api/v2/torrents/info`,
    options: { method: 'GET' }
});

// 背景页处理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'QB_API') {
        handleQBAPI(message, sendResponse);
    }
});
```

## 注意事项

1. **qBittorrent 配置**: 需启用 Web UI 并允许 CORS，在 `Bypass authentication for localhost` 中添加 `u2.dmhy.org`
2. **Firefox 构建**: 使用 `manifest.firefox.json`，不支持某些 Chrome 特有 API
3. **魔法功能**: 需要用户有足够魔力值，批量操作前建议确认

## 常用命令速查

```bash
bun dev                    # Chrome 开发
bun run build              # Chrome 构建
bun run build:firefox      # Firefox 构建
```
