# Simple RSS - 让 Obsidian 成为你的 AI 驱动信息中心

**Product Requirements & Marketing Document**  
**Version**: 1.0 | **Date**: 2026-02-07 | **Plugin Version**: v0.5.0

---

## 📥 立即下载

[![GitHub Release](https://github.com/RayLee1997/obsidian-simple-rss/tree/master/release)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/RayLee1997/obsidian-simple-rss)

**最新版本**: [simple-rss-v0.5.0.zip](https://github.com/RayLee1997/obsidian-simple-rss/tree/master/release)

**原项目**: [Monnierant/obsidian-simple-rss](https://github.com/monnierant/obsidian-simple-rss)

---

## 🎬 效果展示

### 🤖 AI 驱动的每日简报工作流

Simple RSS + Gemini Scribe = **自动化信息管理新体验**

![RSS + Gemini Scribe 工作流](./RSS%20+%20Gemini%20Scribe%20总结和归档今日简报.png)

**工作流程**：

```
📥 Step 1: RSS 自动收集 (Simple RSS)
每日同步订阅 → 创建文章文件（带日期前缀）→ 保存到 00_Inbox/00_RSS_News/
                                              ↓
🤖 Step 2: AI 智能总结 (Gemini Scribe)  
批量阅读文章 → 按主题分类 → 提炼核心要点 → 生成每日简报
                                              ↓
📊 Step 3: 知识归档
日程简报 → 主题标记 → 链接保留 → 周期回顾
```

**实际效果**：

- ✅ 自动读取 `00_RSS_News` 目录的所有文章
- ✅ 生成结构化简报：`2026-02-07_Daily_Brief.md`
- ✅ 按主题智能分类：AI/商业/产品/软件工具等
- ✅ 每篇文章 1-2 句精华总结，附原文链接
- ✅ 10 分钟掌握全天重点资讯

### 📊 文章时间自动排序

```
📁 深度科技与极客文化/
  📄 2026-02-07 Waymo's New "World Model" with Genie 3.md    ← 最新
  📄 2026-02-07 Claude's Compilation Experiment.md
  📄 2026-02-06 OpenAI Agents Working Together.md
  📄 2026-02-05 Brendan Gregg Joins OpenAI.md
  📄 2026-02-04 Google's MCP Server Launch.md
```

**零配置，开箱即用** - 最新文章自动显示在顶部！

---

## 🎯 产品定位

**Simple RSS** 是一款为 Obsidian 用户精心打造的 RSS 订阅管理插件，让知识工作者能够：

- 📥 **自动收集** - 将互联网上的优质内容自动导入你的知识库
- 📊 **智能整理** - 按时间和分类自然组织，最新内容始终在前
- 🔄 **轻松迁移** - 从其他 RSS 阅读器一键导入，无缝切换
- 🤖 **深度整合** - 与 AI 助手（如 Gemini Scribe）完美配合，实现信息的自动总结与归档

### 核心理念

> **从信息收集到知识沉淀，让 Obsidian 成为你的个人信息中心**

在信息爆炸的时代，我们不缺信息来源，缺的是**高效的信息处理流程**。Simple RSS 不仅是一个 RSS 阅读器，更是连接**信息收集**与**知识管理**的桥梁。

---

## 🌟 核心功能

### 1. OPML 导入/导出 - 一键迁移，零门槛

#### 问题场景

- 从 Feedly、Inoreader、NewsBlur 等阅读器切换到 Obsidian
- 想要备份几百个订阅源，手动添加太繁琐
- 担心导入的订阅源失效，浪费时间

#### 解决方案

✨ **智能 OPML 导入**

```
选择 OPML 文件 → 自动解析 → 预览订阅列表 → 并发校验 URL → 仅导入有效源
              ↓                    ↓                    ↓
          支持多层嵌套        自动标记重复           实时显示状态
```

**首创功能：自动 URL 校验**

- 🔍 导入前自动并发检测所有订阅源的有效性
- ✅ 只导入验证通过的源，避免"僵尸订阅"
- ⚡ 3 并发 + 10秒超时，平衡速度与可靠性
- 💬 友好提示：`404`、`Domain not found`、`SSL error` 等

**使用体验**

1. 点击 "Choose File..." 选择 OPML
2. 预览窗口显示统计：100 个订阅，5 个重复，3 个分类
3. 点击 "Validate & Import" → 实时校验（⏳→✅/❌）
4. 90 秒后校验完成：90 个有效 ✅，5 个重复 ⚠️，5 个失效 ❌
5. 点击 "Import Selected" → 仅导入 90 个有效源
6. 通知：成功导入 90 个订阅，跳过 10 个无效/重复源

📤 **一键 OPML 导出**

- 随时导出当前订阅为 OPML 文件
- 自动下载，文件名含日期：`simple-rss-export-2026-02-07.opml`
- 完整保留分类结构
- 兼容所有主流 RSS 阅读器

---

### 2. 文章时间自动排序 - 最新内容，一目了然

#### 问题场景

- RSS 文章在文件夹中杂乱无章
- 想找最新文章要翻到底部
- 无法直观看到文章发布日期

#### 解决方案

📅 **自动日期前缀**

```
同步 RSS → 自动添加日期前缀 → 文件名格式：YYYY-MM-DD 标题.md
```

**效果展示**

```
📁 深度科技与极客文化/
  📄 2026-02-07 Waymo's New "World Model" with Genie 3.md    ← 最新
  📄 2026-02-07 Claude's Compilation Experiment.md
  📄 2026-02-06 OpenAI Agents Working Together.md
  📄 2026-02-05 Brendan Gregg Joins OpenAI.md
  📄 2026-02-04 Google's MCP Server Launch.md
```

**核心特性**

- ⚡ **零配置** - 自动生效，无需设置
- 📊 **自然排序** - 按文件名排序时，最新文章自动在顶部
- 🏷️ **日期可见** - 文件名即可看到发布日期
- 🔄 **智能容错** - RSS 源无日期时优雅降级，不影响功能

**使用方法**

1. 正常同步 RSS（无需额外操作）
2. 新文章文件名自动有日期前缀
3. 设置文件夹排序为 "File name (A to Z)"
4. 完成！最新文章始终在顶部

---

### 3. UI 优化 - 舒适的编辑体验

🎨 **扩大的模板编辑器**

- 高度：300px（约 15 行）
- 宽度：100%（充分利用空间）
- 字体：等宽字体（monospace）
- 适合编辑复杂的 RSS 文章模板

---

## 💡 典型使用场景

### 🤖 场景 1: RSS + Gemini Scribe - AI 驱动的每日简报

**工作流程**：信息收集 → AI 总结 → 知识归档

#### Step 1: RSS 自动收集（Simple RSS）

```
每日同步 RSS 订阅
  ↓
自动创建文章文件（带日期前缀）
  ↓
保存到: 00_Inbox/00_RSS_News/00_Daily_Brief/
```

#### Step 2: AI 智能总结（Gemini Scribe）

通过 Obsidian Agent（如 Gemini Scribe），对当天的 RSS 文章进行：

1. **自动阅读** - 批量读取当天所有 RSS 文章
2. **智能分类** - 按主题分组（AI/科技/商业/产品等）
3. **提炼要点** - 每篇文章生成 1-2 句精华总结
4. **生成简报** - 创建结构化的每日简报文档

**Agent 任务示例**：

```
我已经读取了 00_Inbox/00_RSS_News 目录下今天（2026-02-07）更新的内容。
总结结果已写入：2026-02-07_Daily_Brief。

今天2月7日 更新要点摘要：

1. AI 与自动驾驶系统
   • Waymo 推出 "World Model"（Genie 3）：用于模拟现实场景...
   • Claude 的"智能化"实验：Anthropic 内部在探讨...

2. 商业与战略调整
   • 谷歌专 OpenAI 实验：著名专家 Brendan Gregg 加入 OpenAI...
   • 开发者 API 发布：Google 推出 Developer Knowledge API...

3. 软件与化工具
   • OpenCiv3：经典游戏《文明 III》的约调源重现...
```

#### Step 3: 知识归档

- **日程简报**：按日期归档（`2026-02-07_Daily_Brief.md`）
- **主题整理**：AI 帮助标记主题标签（`#ai`、`#business`、`#tech`）
- **链接保留**：每个要点链接回原始 RSS 文章
- **周期回顾**：周末可用 AI 生成周报、月报

---

### 📚 场景 2: 学术研究 - 追踪领域最新动态

**目标用户**：研究人员、PhD 学生、技术专家

**工作流程**：

1. **订阅领域 RSS**：
   - arXiv 各领域 RSS
   - Google Scholar 搜索 RSS
   - GitHub Trending RSS
   - 学术期刊 RSS

2. **自动整理**：
   - 每日同步最新论文/代码
   - 按时间倒序排列，最新内容在前
   - 分类保存：`Research/Papers/2026-02-07 论文标题.md`

3. **深度阅读**：
   - 在 Obsidian 中标注重点
   - 添加笔记和想法
   - 链接到相关文献

4. **构建知识图谱**：
   - 使用 Obsidian Graph View 可视化领域知识
   - 发现论文之间的关联

---

### 🌐 场景 3: 内容创作 - 灵感收集与素材库

**目标用户**：博主、作家、内容创作者

**工作流程**：

1. **订阅灵感源**：
   - Medium 热门文章
   - HackerNews 讨论
   - Product Hunt 新产品
   - Twitter 大 V 动态

2. **快速筛选**：
   - 浏览 RSS 文章列表（按时间排序）
   - 标记感兴趣的内容
   - 添加 tag：`#inspiration`、`#case-study`

3. **素材积累**：
   - 在 Obsidian 中建立素材库
   - 分类整理：案例、观点、数据
   - 创作时快速搜索和引用

---

## 🎯 目标用户

### 主要用户群

1. **知识工作者**
   - 需要持续学习和信息更新
   - 使用 Obsidian 作为第二大脑
   - 希望信息收集自动化

2. **研究人员/学术界**
   - 需要追踪领域最新进展
   - 大量订阅学术期刊/arXiv
   - 需要构建知识网络

3. **内容创作者**
   - 需要持续获取灵感和素材
   - 订阅多个信息源
   - 需要快速筛选和归档

4. **效率工具爱好者**
   - 从其他 RSS 阅读器迁移
   - 追求 All-in-One 工作流
   - 希望打通信息收集→整理→应用

---

## 🚀 产品优势

### 对比其他方案

| 对比维度 | 传统 RSS 阅读器 | Simple RSS | Simple RSS + AI |
|----------|----------------|------------|-----------------|
| **信息收集** | ✅ 优秀 | ✅ 优秀 | ✅ 优秀 |
| **知识沉淀** | ❌ 无法积累 | ✅ Markdown 笔记 | ✅ Markdown + 结构化 |
| **内容整理** | ⚠️ 手动标签 | ✅ 自动按时间排序 | ✅ AI 智能分类 |
| **深度阅读** | ❌ 阅读后即忘 | ✅ 标注+链接 | ✅ 标注+AI总结 |
| **迁移成本** | ❌ 锁定生态 | ✅ OPML 导入/导出 | ✅ OPML + AI 迁移 |
| **信息质量** | ⚠️ 僵尸订阅多 | ✅ 导入时 URL 校验 | ✅ 校验 + AI 过滤 |
| **每日回顾** | ❌ 无 | ⚠️ 手动浏览 | ✅ AI 自动生成简报 |

### 核心竞争力

1. **零新增依赖** - 复用现有库，轻量高效
2. **首创 URL 校验** - 导入时自动过滤无效源
3. **文章时间排序** - 最新内容始终在前，零配置
4. **AI 工作流集成** - 与 Gemini Scribe 等 AI 助手完美配合
5. **开源透明** - 代码开源，社区驱动

---

## 📊 技术亮点

### 架构设计

```
Simple RSS 插件
├── 订阅管理
│   ├── RSS 源配置
│   ├── 分类/路径管理
│   └── 自定义模板
│
├── OPML 导入/导出 ⭐️
│   ├── OPMLParser（支持多层嵌套）
│   ├── OPMLExporter（保留结构）
│   └── FeedValidator（并发 URL 校验）
│
├── 内容同步
│   ├── RSS 解析（rss-parser）
│   ├── 文章创建（日期前缀） ⭐️
│   └── 去重检测
│
└── UI 设置
    ├── 订阅配置界面
    ├── Import/Export 区域 ⭐️
    └── 模板编辑器（300px）⭐️
```

### 关键技术

1. **并发 URL 校验**
   - 3 并发 worker
   - 10 秒超时控制
   - 实时 UI 更新

2. **日期前缀生成**
   - 解析 `item.isoDate` / `item.pubDate`
   - 格式化为 `YYYY-MM-DD`
   - 容错处理（无日期时优雅降级）

3. **OPML 递归解析**
   - 支持无限层级嵌套
   - 路径拼接（`父分类/子分类`）
   - 智能去重

---

## 💻 使用数据

### 性能指标

- **OPML 导入速度**: 50 个订阅 ~30-60 秒（含 URL 校验）
- **文章同步速度**: 每个 RSS 源 ~1-3 秒
- **日期解析开销**: \u003c 1ms / 文章
- **插件包体积**: 88 KB

### 用户反馈（模拟）

> "从 Feedly 迁移了 200+ 订阅，URL 校验帮我过滤掉 30 个失效源，省了不少时间！"  
> — 知识管理爱好者

> "每天早上用 Gemini Scribe 自动生成简报，10 分钟看完今天的重点内容，效率翻倍！"  
> — AI 研究员

> "文章按时间排序太实用了，最新的文章一眼就能看到，不用翻到底部。"  
> — 独立博主

---

## 🎓 快速开始

### 5 分钟上手

**第一步**：安装插件

```bash
1. 下载 simple-rss-v0.5.0.zip
2. 解压到 .obsidian/plugins/simple-rss/
3. 重启 Obsidian
4. 在设置中启用插件
```

**第二步**：导入订阅

- 如果有 OPML 文件：设置 → Simple RSS → Import OPML
- 如果没有：手动添加几个 RSS 源试试

**第三步**：同步内容

- 点击侧边栏 RSS 图标
- 自动创建文章文件（带日期前缀）

**第四步**（可选）：配合 AI 助手

- 安装 Gemini Scribe 或其他 AI 助手
- 创建每日简报自动化任务
- 享受 AI 驱动的信息管理流程

---

## 🌈 未来规划

### v0.6.0 计划

- [ ] 配置化日期格式（支持自定义前缀格式）
- [ ] 订阅源健康度监控（自动检测失效源）
- [ ] 文章去重优化（同标题同日自动编号）
- [ ] 批量操作（批量启用/禁用订阅）

### v1.0.0 愿景

- [ ] 内置 AI 摘要（无需外部助手）
- [ ] 知识图谱可视化（文章关系网络）
- [ ] 多语言支持（i18n）
- [ ] 移动端优化

---

## 📞 联系与支持

- **GitHub**: [RayLee1997/obsidian-simple-rss](https://github.com/RayLee1997/obsidian-simple-rss)
- **原作者**: [Monnierant/obsidian-simple-rss](https://github.com/monnierant/obsidian-simple-rss)
- **文档**: 查看 `release/` 和 `docs/` 目录

---

## 🎊 开始你的信息管理新旅程

**Simple RSS v0.5.0** 不仅是一个 RSS 订阅插件，更是连接**信息收集**与**知识沉淀**的桥梁。

### 三步打造你的 AI 驱动信息流

1. **收集** - Simple RSS 自动同步 RSS 订阅
2. **整理** - 文章按时间倒序，自动分类
3. **沉淀** - AI 助手生成每日简报，知识归档

### 立即下载

📥 **[下载 simple-rss-v0.5.0.zip](./release/simple-rss-v0.5.0.zip)**

### 完整文档

- 📖 [Release Notes](./release/RELEASE-NOTES-v0.5.0.md) - 功能详解
- 📦 [Installation Guide](./release/INSTALL-v0.5.0.md) - 安装指南
- 🔧 [Technical Docs](./docs/) - 技术方案

---

**让 Obsidian 成为你的个人信息中心，开启知识管理新纪元！** 🚀

---

_Generated: 2026-02-07_  
_Version: 1.0_  
_Plugin Version: v0.5.0_
