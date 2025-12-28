# Gripper - DevTools for Designers

专为开发人员和设计师设计的浏览器扩展工具。

## 功能特性

- 🎯 **Floating Inspector** - 悬停显示元素属性（位置、大小、字体、颜色）
- 📐 **Layout Grid Overlay** - 可自定义的列网格叠加层，检查设计对齐和间距
- ♿ **Accessibility Issues** - 自动检测 WCAG 对比度问题并给出建议
- 📱 **Responsive Mode** - 交互式设备模拟器，测试不同视口设计
- 🎨 **Box Shadow Visualization** - 多层盒阴影的分解可视化
- 🎬 **Animation Analysis** - CSS 动画时间曲线可视化
- 📦 **Asset Extraction** - 提取下载网页中的图片、SVG 等资源
- 🌈 **Color Extraction** - 从选中元素提取颜色调色板
- 🔤 **Typography Analysis** - 分析和提取排版样式
- 🔍 **CSS Selector Search** - 使用 CSS 选择器查找和高亮元素
- 🔬 **X-Ray Mode** - 轮廓显示页面底层结构
- 🛠️ **Technology Detection** - 识别网站使用的框架和库

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式系统
- **Vite** - 构建工具
- **Zustand** - 状态管理
- **Lucide React** - 图标库
- **Vitest** - 单元测试

## 开发

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建

```bash
pnpm build
```

### 测试

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage
```

## 项目结构

```
src/
├── content/           # Content Script（注入到网页）
│   ├── ui/           # UI 组件
│   │   ├── Toolbar/  # 底部工具栏
│   │   └── SidePanel/# 侧边栏面板
│   ├── features/     # 功能模块
│   └── icons/        # 自定义图标
├── popup/            # 弹出窗口
├── sidepanel/        # 浏览器侧边栏
├── background/       # 后台服务
├── hooks/            # 自定义 Hooks
├── stores/           # 状态管理
├── lib/              # 工具函数
└── types/            # 类型定义
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| V | 检查器模式 |
| H | 平移模式 |
| G | 网格叠加 |
| X | X-Ray 模式 |
| M | 测量工具 |
| S | 侧边栏 |
| P | 暂停动画 |
| A | 标注模式 |
| F | CSS 选择器搜索 |
| R | 响应式模式 |

## 安装扩展

1. 运行 `pnpm build` 构建扩展
2. 打开 Chrome，访问 `chrome://extensions/`
3. 启用「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `dist` 目录

## License

MIT
