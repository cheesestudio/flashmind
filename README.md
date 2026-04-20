# AI 闪卡大师 (FlashMind)

基于艾宾浩斯遗忘曲线的 AI 闪卡学习应用 | React + TypeScript + Tailwind CSS

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 功能特性

### 核心功能
- **卡片管理**: 创建、编辑、删除闪卡库
- **多种学习模式**:
  - 复习模式 - 基于 SM-2 算法的间隔重复学习
  - 听力模式 - TTS 语音朗读单词
  - 测验模式 - 多选题限时答题
- **AI 生成**: 使用 OpenAI API 从文本/PDF 智能生成卡片
- **词汇导入**: 内置 7 套词汇库（英语、日语、韩语、编程入门/中级/高级、生活常识）

### 数据分析
- **学习统计**: 每日/每周学习数量、正确率、连续天数
- **进度可视化**: GitHub 风格学习日历热力图
- **搜索功能**: 快速搜索卡片内容

### 个性化设置
- **主题系统**: 浅色/深色/自动切换
- **复习提醒**: 浏览器桌面通知
- **数据导出**: 支持 CSV 和 Anki 格式

## 项目结构

```
flashmind/
├── src/
│   ├── components/          # React 组件
│   │   ├── AIGenerator.tsx     # AI 生成面板
│   │   ├── CardEditor.tsx      # 卡片编辑器
│   │   ├── CardLibrary.tsx    # 卡库列表
│   │   ├── Header.tsx         # 顶部导航
│   │   ├── ListeningMode.tsx  # 听力模式
│   │   ├── ProgressVisualization.tsx  # 进度可视化
│   │   ├── QuizMode.tsx       # 测验模式
│   │   ├── SearchBar.tsx      # 搜索栏
│   │   ├── Settings.tsx      # 设置面板
│   │   ├── StudyMode.tsx      # 复习模式
│   │   └── VocabularySelector.tsx  # 词汇选择器
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useAI.ts           # AI API 调用
│   │   └── useFlashcards.ts   # 闪卡状态管理
│   ├── types/                # TypeScript 类型
│   │   └── index.ts
│   ├── utils/                # 工具函数
│   │   ├── pdf.ts            # PDF 文本提取
│   │   ├── spacedReview.ts   # SM-2 复习算法
│   │   └── storage.ts        # localStorage 存储
│   ├── App.tsx               # 主应用组件
│   ├── index.css             # 全局样式
│   └── main.tsx              # 入口文件
├── data/
│   └── vocabulary/           # 预置词汇库
│       ├── english.json
│       ├── japanese.json
│       ├── korean.json
│       ├── programming-beginner.json
│       ├── programming-intermediate.json
│       ├── programming-advanced.json
│       └── life-knowledge.json
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

## 技术栈

- **前端框架**: React 18 + TypeScript
- **样式**: Tailwind CSS 3.4
- **构建工具**: Vite 5
- **PDF 解析**: pdfjs-dist
- **存储**: 浏览器 localStorage
- **算法**: SM-2 间隔重复算法

## 学习算法

应用采用 [SM-2 算法](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2) 的变体实现间隔重复复习：

- 初次学习: 间隔 1 天
- 根据记忆质量调整间隔
- 难度因子动态调整 (最小 1.3)

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件

## 致谢

- [SuperMemo](https://www.supermemo.com/) - SM-2 算法原创
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [Vite](https://vitejs.dev/) - 构建工具
