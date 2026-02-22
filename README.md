# U2 助手 - 站点增强工具

---

## ✨ 功能特性

### 🎨 界面美化

#### ⭐ 收藏图标美化
- 替换原生收藏按钮为 FontAwesome 星星图标
- **金色实心** = 已收藏 | **灰色空心** = 未收藏
- 悬停放大动画效果，更加醒目

#### 📝 标题换行优化
- 自动优化长种子标题显示
- 在单词边界处智能断行，避免截断
- 保持标题完整可读

### 🪄 一键施放魔法

#### 列表页工具栏
- **放魔对象**：恢复系（仅自己）/ 地图炮（全体用户）
- **放魔期限**：自定义小时数（默认 24 小时）
- **放魔类型**：Free / 2X / 2X/Free / 自定义比率
- **批量施放**：一键对整页所有种子施放魔法

#### 种子魔法按钮
- 独立「魔法」列显示 🪄 按钮
- 点击即可对该种子施放当前设置的魔法
- 支持确认对话框防止误操作
- 已有免费优惠的种子按钮会禁用

#### 详情页快速施放
- 在"流量优惠"区域添加快速按钮
- **恢复系**：Free / 2X / 2.33X / 2X/Free / 2.33X/Free
- **地图炮**：Free / 2X / 2.33X / 2X/Free / 2.33X/Free
- 每个按钮独立提交，即时生效

### 🔄 qBittorrent 联动

#### 自动状态同步
- 后台每 **10 秒** 同步 qB 种子状态
- 实时显示在种子列表和详情页
- 状态图标 + 进度百分比 + 任务名称

#### 智能关联管理
- **详情页一键抓取** Hash 并关联
- **批量操作** 支持客户端列标题 ⚡ 按钮快速关联
- **智能识别** 已存在的种子任务

#### 远程任务控制
- 网页端直接 **开始** / **暂停** 种子
- 实时状态反馈

#### 快捷添加任务
- 一键下载并推送种子到 qB
- 自动添加标签（可选）
- 支持自定义重命名

### 💾 数据管理

#### Options 数据中心
- Hash 关联数据库管理
- **JSON 导入/导出**
- **数据清理**

#### Popup 快速查询
- 点击扩展图标弹出快捷面板
- 输入 Hash 快速跳转详情页

---

## 📁 项目结构

```
src/
├── background/              # 后台服务 (Service Worker)
│   ├── index.ts             # 入口：消息分发与初始化
│   ├── alarms.ts            # 定时任务：控制同步频率
│   ├── api.ts               # qB API 通信
│   ├── sync.ts              # 状态同步：获取 qB 数据并推送
│   └── upload.ts            # 文件上传：推送种子至 qB
│
├── content/                 # 内容脚本 (注入 U2 页面)
│   ├── index.ts             # 入口：页面初始化与事件委托
│   ├── ui.ts                # UI 渲染：DOM 操作、状态图标
│   └── magic.ts             # 一键施放魔法功能
│
├── popup/                   # 弹出面板
│   └── index.ts             # Hash 快速查询与跳转
│
├── options/                 # 设置页面
│   └── index.ts             # Hash 数据库管理
│
├── utils/                   # 公共工具库
│   ├── index.ts             # 全局常量、配置、通用函数
│   └── icons.ts             # FontAwesome 图标初始化
│
├── assets/                  # 静态资源
│   └── style.css            # 页面注入样式
│
├── public/                  # 公共资源
│   └── icon.png             # 扩展图标
│
├── manifest.json            # 扩展配置文件
├── popup.html               # Popup 页面
├── options.html             # Options 页面
└── vite.config.ts           # Vite 构建配置
```

---

## 🛠️ 开发与构建

### 环境要求
- [Bun](https://bun.sh/) (推荐) 或 Node.js >= 18

### 安装依赖
```bash
bun install
```

### 开发模式

#### Chrome
```bash
bun dev
```
Vite 将监听文件变化并自动重新编译。在 Chrome 中加载项目根目录即可。

#### Firefox
```bash
bun dev:firefox
```
在 Firefox 中通过 `about:debugging#/runtime/this-firefox` 加载临时扩展。

### 生产编译

#### Chrome
```bash
bun run build
```
编译后的插件位于 `dist` 目录。

#### Firefox
```bash
bun run build:firefox
```
编译后的文件位于 `dist-firefox` 目录。

如需打包成 XPI：
```bash
bun run package:firefox
```
生成的 XPI 包位于 `dist-firefox/u2-assistant-7.0.0.xpi`。

### 安装说明

#### Chrome
1. 打开 `chrome://extensions/`
2. 启用 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择 `dist` 目录

#### Firefox

**方式一：临时加载（推荐开发时使用，无需签名）**
1. 打开 `about:debugging#/runtime/this-firefox`
2. 点击 **临时载入附加组件**
3. 选择 `dist-firefox/manifest.json` 文件

**方式二：安装 XPI（需禁用签名验证）**
1. 地址栏输入 `about:config`
2. 搜索 `xpinstall.signatures.required`，设置为 `false`
3. 按 `Ctrl+Shift+A` 打开附加组件管理
4. 齿轮图标 → **从文件安装附加组件**
5. 选择 `dist-firefox/u2-assistant-7.0.0.xpi`

**方式三：使用签名版本（正式发布）**
1. 在 [Firefox 开发者中心](https://addons.mozilla.org/developers/) 注册账号
2. 提交扩展获取签名版本
3. 安装签名后的 XPI（可在 [AMO](https://addons.mozilla.org/) 公开或自行分发）

---

## 🎨 样式定制

### 种子标题换行
扩展自动注入样式，使长标题自然换行（在单词边界处断行，避免截断）。

### 收藏按钮美化
原生收藏图标被替换为 FontAwesome 星星：
- 已收藏：🟡 金色 (`#f39c12`)
- 未收藏：⚪ 灰色 (`#95a5a6`)
- 悬停：放大 15% 动画

### 魔法工具栏
- 灰色背景 (#f0f0f0)
- 蓝色批量施放按钮
- 悬停动画效果

---

## ⚠️ 注意事项

### Firefox 支持
- 需要 Firefox 109 或更高版本（支持 Manifest V3）
- 使用 `bun run build:firefox` 构建 Firefox 版本
- Firefox 版本与 Chrome 版本功能相同

### 魔法施放
- 施放魔法需要足够的魔力值
- 批量施放前请确认范围设置（恢复系/地图炮）
- 建议使用确认对话框防止误操作
- 已有免费优惠的种子无法施放魔法（按钮会禁用）

### 其他
- 本扩展专为 **U2 次元 (u2.dmhy.org)** 设计
- 需要 qBittorrent >= 4.1（支持 Web API v2）
- 默认连接地址为 `http://localhost:18000`，可在 Options 中修改
- 如遇到跨域问题，请在 qB 设置中：
  1. 启用 **Web UI**
  2. 勾选 **启用跨站请求伪造 (CORS) 支持**
  3. 在 **Bypass authentication for localhost** 中添加 `u2.dmhy.org`

---

## 📄 许可证

MIT License

---

## 🙏 致谢

- 一键施放魔法功能源自 [U2-OneKeyFree](https://greasyfork.org/zh-CN/scripts/372442) 用户脚本
