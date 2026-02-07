# OPML 文件导入功能 - 完善实施方案

> **版本**: v2.0  
> **日期**: 2026-02-07  
> **状态**: 方案设计完成，待实施

---

## 一、需求概述

### 1.1 背景

当前 Simple RSS 插件只能在设置界面逐条手动添加/编辑 RSS 订阅。当用户从其他 RSS 阅读器（Feedly、Inoreader、Reeder 等）迁移到 Obsidian 时，需要将大量订阅源逐一手动输入，体验极差。

### 1.2 目标

在插件设置界面增加 **OPML 文件导入** 和 **OPML 文件导出** 功能，实现：

1. **一键导入**：用户选择 OPML 文件 → 自动解析 → 合并到现有订阅列表
2. **一键导出**：将当前订阅列表导出为标准 OPML 文件，方便备份或迁移到其他阅读器
3. **分类保留**：OPML 中的文件夹层级 → 映射为插件的 `path` 字段（子目录）
4. **智能去重**：导入时自动识别已存在的订阅（按 URL 匹配），避免重复
5. **导入预览**：导入前展示预览，让用户确认导入内容

---

## 二、数据格式分析

### 2.1 OPML 格式结构

```xml
<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>RSS Subscriptions</title>
  </head>
  <body>
    <!-- 分类节点：有子 outline，自身无 xmlUrl -->
    <outline text="深度科技与极客文化" title="深度科技与极客文化">
      <!-- 订阅节点：有 xmlUrl 属性 -->
      <outline 
        type="rss" 
        text="Hacker News (精选)" 
        title="Hacker News (精选)" 
        xmlUrl="https://hnrss.org/frontpage" 
        htmlUrl="https://news.ycombinator.com/"
        description="HN 首页热门"/>
    </outline>
    <!-- 无分类的顶层订阅 -->
    <outline type="rss" text="独立博客" xmlUrl="https://example.com/feed"/>
  </body>
</opml>
```

**关键属性映射**：

| OPML 属性 | 用途 | 映射目标 |
|-----------|------|---------|
| `text` / `title` | 订阅源名称 | `SimpleRSSFeed.name` |
| `xmlUrl` | RSS 订阅地址 | `SimpleRSSFeed.url` |
| `htmlUrl` | 网站主页 | 不映射（可考虑扩展） |
| `description` | 订阅描述 | 不映射（可考虑扩展） |
| 父级 `text` | 分类文件夹名 | `SimpleRSSFeed.path` |

### 2.2 插件数据模型

```typescript
// src/models/SimpleRSSFeed.ts
interface SimpleRSSFeed {
  name: string;          // 订阅名称
  url: string;           // RSS 地址
  title?: string;        // 文章标题模板
  path?: string;         // 子目录路径（相对于 basePath 的子目录）
  template?: string;     // 内容模板
  feedTypeId?: string;   // 关联的 FeedType ID
}
```

### 2.3 转换规则

```
OPML 分类嵌套结构 → 扁平化 feeds 数组，分类名 → path 字段

OPML:                          JSON:
├── 深度科技与极客文化     →    { path: "深度科技与极客文化" }
│   ├── Hacker News        →    { name: "Hacker News", url: "...", path: "深度科技与极客文化" }
│   └── The Verge          →    { name: "The Verge", url: "...", path: "深度科技与极客文化" }
├── 商业与战略洞察         →    { path: "商业与战略洞察" }
│   └── TechCrunch         →    { name: "TechCrunch", url: "...", path: "商业与战略洞察" }
└── 无分类的订阅           →    { name: "独立博客", url: "...", path: "" }
```

**多级嵌套处理**：

```
OPML:                                  path:
├── 技术                        →
│   ├── 前端                    →
│   │   ├── React Blog          →      "技术/前端"
│   │   └── Vue Blog            →      "技术/前端"
│   └── 后端                    →
│       └── Golang Blog         →      "技术/后端"
```

---

## 三、技术方案

### 3.1 架构设计

```
┌──────────────────────────────────────────────────┐
│                  Settings Tab                     │
│  ┌─────────────┐  ┌───────────┐                  │
│  │ Import OPML │  │ Export    │                   │
│  │   Button    │  │  Button   │                   │
│  └──────┬──────┘  └─────┬─────┘                  │
│         │               │                         │
│  ┌──────▼──────┐  ┌─────▼─────┐                  │
│  │ File Dialog │  │ OPMLExport│                   │
│  │ (系统选择)   │  │  Service  │                   │
│  └──────┬──────┘  └───────────┘                   │
│         │                                         │
│  ┌──────▼──────┐                                  │
│  │ OPMLParser  │                                  │
│  │  Service    │                                  │
│  └──────┬──────┘                                  │
│         │                                         │
│  ┌──────▼──────┐                                  │
│  │ Import Modal│  ← 预览、去重                    │
│  │  (Preview)  │                                  │
│  └──────┬──────┘                                  │
│         │ 用户点击 "Validate & Import"             │
│  ┌──────▼──────┐                                  │
│  │  Feed       │  ← 并发校验每个 URL 的可达性     │
│  │  Validator  │  ← 实时更新 UI 状态              │
│  └──────┬──────┘                                  │
│         │                                         │
│  ┌──────▼──────┐                                  │
│  │ Settings    │  ← 仅导入校验通过的 feeds        │
│  │  Update     │                                  │
│  └─────────────┘                                  │
└──────────────────────────────────────────────────┘
```

### 3.2 新增文件清单

```
src/
├── opml/
│   ├── OPMLParser.ts          # OPML 解析器（XML → SimpleRSSFeed[]）
│   ├── OPMLExporter.ts        # OPML 导出器（SimpleRSSFeed[] → XML）
│   ├── FeedValidator.ts       # 订阅源有效性校验器（并发 URL 校验）
│   └── OPMLImportModal.ts     # 导入预览弹窗（Modal）
```

### 3.3 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `src/Settings/SimpleRSSSettingTab.ts` | 添加 Import/Export 按钮到设置页 |
| `src/Settings/SimpleRSSFeddPanel.ts` | 导入后刷新 feeds 面板 |
| `main.ts` | 无需修改（通过 settings 层级联动） |
| `package.json` | 无需新增依赖（使用已有的 `fast-xml-parser`） |

---

## 四、详细设计

### 4.1 OPMLParser - OPML 解析器

**文件**: `src/opml/OPMLParser.ts`

```typescript
import { XMLParser } from "fast-xml-parser";
import SimpleRSSFeed from "src/models/SimpleRSSFeed";

export interface OPMLParseResult {
  title: string;                    // OPML 标题
  feeds: SimpleRSSFeed[];           // 解析出的订阅列表
  categories: string[];             // 发现的分类列表
  totalCount: number;               // 总条目数
  skippedCount: number;             // 跳过的条目数（无 URL）
}

export class OPMLParser {
  /**
   * 解析 OPML 字符串为 SimpleRSSFeed 数组
   * 支持多级嵌套，将文件夹层级拼接为 path
   */
  static parse(opmlContent: string): OPMLParseResult {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    
    const parsed = parser.parse(opmlContent);
    const body = parsed.opml?.body;
    const title = parsed.opml?.head?.title || "Imported Feeds";
    
    if (!body) throw new Error("Invalid OPML: missing <body> element");
    
    const feeds: SimpleRSSFeed[] = [];
    const categories = new Set<string>();
    let skippedCount = 0;
    
    // 递归处理 outline 节点
    const processOutlines = (outlines: any, parentPath: string = "") => {
      // 确保 outlines 是数组
      if (!Array.isArray(outlines)) outlines = [outlines];
      
      for (const outline of outlines) {
        const xmlUrl = outline["@_xmlUrl"];
        const text = outline["@_text"] || outline["@_title"] || "";
        
        if (xmlUrl) {
          // 叶子节点：有 xmlUrl → 这是一个订阅源
          feeds.push({
            name: text,
            url: xmlUrl,
            path: parentPath || undefined,
          });
          if (parentPath) categories.add(parentPath);
        } else if (outline.outline) {
          // 文件夹节点：有子 outline → 递归处理
          const currentPath = parentPath 
            ? `${parentPath}/${text}` 
            : text;
          if (text) categories.add(currentPath);
          processOutlines(outline.outline, currentPath);
        } else {
          // 无 URL 且无子节点 → 跳过
          skippedCount++;
        }
      }
    };
    
    if (body.outline) {
      processOutlines(body.outline);
    }
    
    return {
      title,
      feeds,
      categories: Array.from(categories),
      totalCount: feeds.length,
      skippedCount,
    };
  }
}
```

**设计要点**：

1. **复用已有依赖**：使用项目已安装的 `fast-xml-parser`，无需引入新依赖
2. **递归处理多级嵌套**：支持任意深度的 OPML 文件夹结构
3. **健壮性**：处理 `outline` 可能是对象或数组的情况
4. **返回丰富的元数据**：用于预览弹窗展示统计信息

### 4.2 OPMLExporter - OPML 导出器

**文件**: `src/opml/OPMLExporter.ts`

```typescript
import SimpleRSSFeed from "src/models/SimpleRSSFeed";

export class OPMLExporter {
  /**
   * 将 SimpleRSSFeed 数组导出为 OPML XML 字符串
   * 按 path 分组重建文件夹层级
   */
  static export(feeds: SimpleRSSFeed[], title: string = "Simple RSS Subscriptions"): string {
    // 按 path 分组
    const grouped = new Map<string, SimpleRSSFeed[]>();
    
    for (const feed of feeds) {
      const path = feed.path || "";
      if (!grouped.has(path)) grouped.set(path, []);
      grouped.get(path)!.push(feed);
    }
    
    // 构建 XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<opml version="2.0">\n';
    xml += '  <head>\n';
    xml += `    <title>${escapeXml(title)}</title>\n`;
    xml += `    <dateCreated>${new Date().toUTCString()}</dateCreated>\n`;
    xml += '  </head>\n';
    xml += '  <body>\n';
    
    for (const [path, pathFeeds] of grouped) {
      if (path) {
        // 有分类的订阅
        xml += `    <outline text="${escapeXml(path)}" title="${escapeXml(path)}">\n`;
        for (const feed of pathFeeds) {
          xml += `      <outline type="rss" text="${escapeXml(feed.name)}" `;
          xml += `title="${escapeXml(feed.name)}" `;
          xml += `xmlUrl="${escapeXml(feed.url)}"/>\n`;
        }
        xml += '    </outline>\n';
      } else {
        // 无分类的订阅
        for (const feed of pathFeeds) {
          xml += `    <outline type="rss" text="${escapeXml(feed.name)}" `;
          xml += `title="${escapeXml(feed.name)}" `;
          xml += `xmlUrl="${escapeXml(feed.url)}"/>\n`;
        }
      }
    }
    
    xml += '  </body>\n';
    xml += '</opml>\n';
    
    return xml;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### 4.3 FeedValidator - 订阅源有效性校验器

**文件**: `src/opml/FeedValidator.ts`

**设计思路**：复用项目已有的 `rss-parser` 库，对每个 URL 发起实际的 RSS 解析请求。如果能成功解析出 RSS 内容则视为有效，否则记录错误原因。使用并发控制（限制同时请求数）避免网络拥塞。

```typescript
import Parser from "rss-parser";

export type ValidationStatus = "pending" | "validating" | "valid" | "invalid" | "duplicate";

export interface FeedValidationResult {
  index: number;               // 对应 parseResult.feeds 的下标
  status: ValidationStatus;
  error?: string;              // 失败原因（如 404、SSL错误、超时等）
}

export class FeedValidator {
  private concurrency: number;
  private timeout: number;

  constructor(concurrency = 3, timeout = 10000) {
    this.concurrency = concurrency;  // 最大并发数
    this.timeout = timeout;          // 单个请求超时（ms）
  }

  /**
   * 校验单个 feed URL 的有效性
   * 复用项目已有的 rss-parser，与实际同步逻辑一致
   */
  async validateOne(url: string): Promise<{ valid: boolean; error?: string }> {
    // 处理 feed:// 协议（与 Feeds.ts 逻辑保持一致）
    if (url.startsWith("feed://")) {
      url = "http://" + url.substring(7);
    } else if (url.startsWith("feed:")) {
      url = "http://" + url.substring(5);
    }

    const parser = new Parser({
      timeout: this.timeout,
    });

    try {
      const feed = await parser.parseURL(url);
      // 校验是否返回了有效的 feed 结构
      if (!feed || !feed.title) {
        return { valid: false, error: "Not a valid RSS/Atom feed" };
      }
      return { valid: true };
    } catch (e: any) {
      // 提取简洁的错误信息
      let error = "Unknown error";
      if (e.message?.includes("Status code 404")) {
        error = "404 Not Found";
      } else if (e.message?.includes("Status code 403")) {
        error = "403 Forbidden";
      } else if (e.message?.includes("unable to verify")) {
        error = "SSL certificate error";
      } else if (e.message?.includes("ENOTFOUND")) {
        error = "Domain not found";
      } else if (e.message?.includes("ETIMEDOUT") || e.message?.includes("timeout")) {
        error = "Connection timeout";
      } else if (e.message?.includes("Protocol")) {
        error = "Unsupported protocol";
      } else {
        error = e.message?.substring(0, 60) || "Parse error";
      }
      return { valid: false, error };
    }
  }

  /**
   * 批量校验，使用并发控制，通过回调实时通知每个结果
   */
  async validateAll(
    urls: { index: number; url: string }[],
    onProgress: (result: FeedValidationResult) => void
  ): Promise<FeedValidationResult[]> {
    const results: FeedValidationResult[] = [];
    const queue = [...urls];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift()!;
        onProgress({ index: item.index, status: "validating" });

        const result = await this.validateOne(item.url);
        const validation: FeedValidationResult = {
          index: item.index,
          status: result.valid ? "valid" : "invalid",
          error: result.error,
        };
        results.push(validation);
        onProgress(validation);
      }
    };

    // 启动 N 个并发 worker
    const workers = Array.from(
      { length: Math.min(this.concurrency, urls.length) },
      () => worker()
    );
    await Promise.all(workers);

    return results;
  }
}
```

**设计要点**：

1. **复用 rss-parser**：与 `Feeds.ts` 中 `getUrlContent` 使用相同的解析库，校验结果与实际同步行为一致
2. **并发控制**：默认 3 个并发请求，避免同时发起大量网络请求导致阻塞
3. **超时机制**：单个请求 10 秒超时，避免长时间无响应
4. **实时回调**：每校验完一条即通过 `onProgress` 通知 UI 更新状态
5. **友好错误信息**：将技术性错误（如 `ENOTFOUND`）转换为用户可理解的描述
6. **feed:// 协议兼容**：与 `Feeds.ts` 保持一致的协议转换逻辑

### 4.4 OPMLImportModal - 导入预览弹窗

**文件**: `src/opml/OPMLImportModal.ts`

```typescript
import { App, Modal, Setting, Notice } from "obsidian";
import SimpleRSSPlugin from "main";
import SimpleRSSFeed from "src/models/SimpleRSSFeed";
import { OPMLParseResult } from "./OPMLParser";
import { FeedValidator, FeedValidationResult, ValidationStatus } from "./FeedValidator";

export class OPMLImportModal extends Modal {
  plugin: SimpleRSSPlugin;
  parseResult: OPMLParseResult;
  selectedFeeds: Map<number, boolean>;       // index → selected
  validationStatus: Map<number, ValidationStatus>;  // index → validation status
  validationErrors: Map<number, string>;     // index → error message
  importMode: "merge" | "replace";
  onImportDone: () => void;
  isValidating: boolean;                     // 是否正在校验中
  validationComplete: boolean;               // 校验是否已完成

  constructor(
    app: App, 
    plugin: SimpleRSSPlugin, 
    parseResult: OPMLParseResult,
    onImportDone: () => void
  ) {
    super(app);
    this.plugin = plugin;
    this.parseResult = parseResult;
    this.selectedFeeds = new Map();
    this.validationStatus = new Map();
    this.validationErrors = new Map();
    this.importMode = "merge";
    this.onImportDone = onImportDone;
    this.isValidating = false;
    this.validationComplete = false;
    
    // 默认全选，但标记重复项；初始化校验状态
    const existingUrls = new Set(
      plugin.settings.feeds.map(f => f.url.toLowerCase())
    );
    parseResult.feeds.forEach((feed, i) => {
      const isDuplicate = existingUrls.has(feed.url.toLowerCase());
      this.selectedFeeds.set(i, !isDuplicate);
      this.validationStatus.set(i, isDuplicate ? "duplicate" : "pending");
    });
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("simple-rss-import-modal");
    
    // 标题
    contentEl.createEl("h2", { text: "Import OPML" });
    
    // 统计信息
    const existingUrls = new Set(
      this.plugin.settings.feeds.map(f => f.url.toLowerCase())
    );
    const duplicateCount = this.parseResult.feeds.filter(
      f => existingUrls.has(f.url.toLowerCase())
    ).length;
    const newCount = this.parseResult.feeds.length - duplicateCount;
    
    const statsEl = contentEl.createEl("div", { cls: "import-stats" });
    statsEl.createEl("p", { 
      text: `📊 Found ${this.parseResult.totalCount} feeds in "${this.parseResult.title}"` 
    });
    statsEl.createEl("p", { 
      text: `✅ New: ${newCount} | ⚠️ Duplicate: ${duplicateCount} | 📁 Categories: ${this.parseResult.categories.length}` 
    });
    if (this.parseResult.skippedCount > 0) {
      statsEl.createEl("p", { 
        text: `⏭️ Skipped ${this.parseResult.skippedCount} entries (no RSS URL)` 
      });
    }
    
    // 导入模式选择
    new Setting(contentEl)
      .setName("Import mode")
      .setDesc("Merge: add new feeds to existing list. Replace: clear existing feeds first.")
      .addDropdown(dropdown => dropdown
        .addOption("merge", "Merge (recommended)")
        .addOption("replace", "Replace all")
        .setValue(this.importMode)
        .onChange(value => this.importMode = value as "merge" | "replace")
      );
    
    // 订阅列表预览
    contentEl.createEl("h3", { text: "Feeds to import" });
    
    const listEl = contentEl.createEl("div", { cls: "import-feed-list" });
    
    // 每条 feed 显示校验状态图标
    const statusIcon = (index: number): string => {
      const s = this.validationStatus.get(index);
      switch (s) {
        case "valid":       return "✅";
        case "invalid":     return "❌";
        case "validating":  return "⏳";
        case "duplicate":   return "⚠️";
        default:            return "⬜";  // pending
      }
    };

    const statusLabel = (index: number): string => {
      const s = this.validationStatus.get(index);
      const err = this.validationErrors.get(index);
      if (s === "invalid" && err) return ` ❌ ${err}`;
      if (s === "duplicate") return " ⚠️ (duplicate)";
      if (s === "valid") return " ✅ valid";
      if (s === "validating") return " ⏳ checking...";
      return "";
    };

    let currentCategory = "";
    this.parseResult.feeds.forEach((feed, index) => {
      const category = feed.path || "(No category)";
      
      if (category !== currentCategory) {
        currentCategory = category;
        listEl.createEl("h4", { text: `📁 ${category}` });
      }
      
      const isSelected = this.selectedFeeds.get(index) ?? true;
      
      new Setting(listEl)
        .setName(`${statusIcon(index)} ${feed.name}${statusLabel(index)}`)
        .setDesc(feed.url)
        .addToggle(toggle => toggle
          .setValue(isSelected)
          .onChange(value => this.selectedFeeds.set(index, value))
        );
    });
    
    // 操作按钮
    const buttonEl = contentEl.createEl("div", { cls: "import-buttons" });
    
    new Setting(buttonEl)
      .addButton(btn => btn
        .setButtonText("Select All")
        .setDisabled(this.isValidating)
        .onClick(() => {
          this.parseResult.feeds.forEach((_, i) => this.selectedFeeds.set(i, true));
          this.onOpen();
        })
      )
      .addButton(btn => btn
        .setButtonText("Select Valid Only")
        .setDisabled(!this.validationComplete)
        .onClick(() => {
          this.parseResult.feeds.forEach((_, i) => {
            this.selectedFeeds.set(i, this.validationStatus.get(i) === "valid");
          });
          this.onOpen();
        })
      )
      .addButton(btn => btn
        .setButtonText(this.validationComplete ? "Import Selected" : "Validate & Import")
        .setCta()
        .setDisabled(this.isValidating)
        .onClick(async () => {
          if (!this.validationComplete) {
            await this.runValidation();
          } else {
            await this.doImport();
            this.close();
          }
        })
      );
  }

  /**
   * 运行校验：对所有非重复的选中 feeds 发起 URL 有效性检查
   */
  async runValidation() {
    this.isValidating = true;
    this.onOpen();  // 刷新 UI 禁用按钮

    // 只校验非重复、被选中的 feeds
    const toValidate = this.parseResult.feeds
      .map((feed, i) => ({ index: i, url: feed.url }))
      .filter(item => {
        const status = this.validationStatus.get(item.index);
        return status !== "duplicate" && this.selectedFeeds.get(item.index);
      });

    const validator = new FeedValidator(3, 10000);

    await validator.validateAll(toValidate, (result) => {
      this.validationStatus.set(result.index, result.status);
      if (result.error) {
        this.validationErrors.set(result.index, result.error);
      }
      // 无效的 feed 自动取消选中
      if (result.status === "invalid") {
        this.selectedFeeds.set(result.index, false);
      }
      this.onOpen();  // 实时刷新 UI
    });

    this.isValidating = false;
    this.validationComplete = true;

    // 统计并通知
    const validCount = [...this.validationStatus.values()]
      .filter(s => s === "valid").length;
    const invalidCount = [...this.validationStatus.values()]
      .filter(s => s === "invalid").length;

    new Notice(
      `Validation complete: ${validCount} valid, ${invalidCount} invalid.`
    );

    this.onOpen();  // 最终刷新
  }

  /**
   * 执行导入：仅导入校验通过（valid）且被选中的 feeds
   */
  async doImport() {
    const selectedFeeds = this.parseResult.feeds.filter(
      (_, i) => this.selectedFeeds.get(i) === true
        && this.validationStatus.get(i) === "valid"
    );
    
    if (selectedFeeds.length === 0) {
      new Notice("No valid feeds selected for import.");
      return;
    }
    
    if (this.importMode === "replace") {
      this.plugin.settings.feeds = [];
    }
    
    for (const feed of selectedFeeds) {
      this.plugin.settings.feeds.push({
        name: feed.name,
        url: feed.url,
        path: feed.path,
      });
    }
    
    await this.plugin.saveSettings();
    await this.plugin.loadSettings();
    
    // 报告导入结果
    const invalidFeeds = this.parseResult.feeds.filter(
      (_, i) => this.validationStatus.get(i) === "invalid"
    );
    let msg = `Imported ${selectedFeeds.length} valid feeds.`;
    if (invalidFeeds.length > 0) {
      msg += ` Skipped ${invalidFeeds.length} invalid feeds.`;
      console.warn("Simple RSS: Skipped invalid feeds:",
        invalidFeeds.map((f, i) => `${f.name}: ${this.validationErrors.get(i)}`)
      );
    }
    new Notice(msg);
    this.onImportDone();
  }

  onClose() {
    this.contentEl.empty();
  }
}
```

### 4.4 SimpleRSSSettingTab 修改

在设置页面的 "Feeds" 区域上方添加导入/导出按钮：

```typescript
// 在 "Defaults" 区域之后、"Feeds" 区域之前 添加：

containerEl.createEl("h1", { text: "Import / Export" });

new Setting(containerEl)
  .setName("Import OPML")
  .setDesc("Import RSS subscriptions from an OPML file exported by other RSS readers.")
  .addButton((button) =>
    button
      .setButtonText("Choose File...")
      .setCta()
      .onClick(async () => {
        // 使用 HTML file input 选择文件
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".opml,.xml";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          
          try {
            const content = await file.text();
            const result = OPMLParser.parse(content);
            
            // 打开预览弹窗
            new OPMLImportModal(
              this.app, 
              this.plugin, 
              result,
              () => this.display()  // 导入完成后刷新设置页
            ).open();
          } catch (e) {
            console.error("OPML parse error:", e);
            new Notice("Failed to parse OPML file: " + e.message);
          }
        };
        input.click();
      })
  );

new Setting(containerEl)
  .setName("Export OPML")
  .setDesc("Export current subscriptions as OPML file for backup or migration.")
  .addButton((button) =>
    button
      .setButtonText("Export")
      .onClick(async () => {
        const opmlContent = OPMLExporter.export(
          this.plugin.settings.feeds,
          "Simple RSS Subscriptions"
        );
        
        // 触发浏览器下载
        const blob = new Blob([opmlContent], { type: "text/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `simple-rss-export-${new Date().toISOString().split('T')[0]}.opml`;
        a.click();
        URL.revokeObjectURL(url);
        
        new Notice("OPML exported successfully.");
      })
  );
```

---

## 五、用户交互流程

### 5.1 导入流程

```text
用户操作                              系统行为
────────                            ────────
1. 进入 Settings                    
2. 点击 "Choose File..."           → 弹出系统文件选择器
3. 选择 .opml 文件                  → OPMLParser 解析
                                    → 打开 Import Modal
4. 查看预览信息                     ← 显示统计、分类、订阅列表
   - 总数 / 新增 / 重复
   - 逐条开关（重复项默认关闭）
   - 导入模式（合并/替换）
   - 每条 feed 显示 ⬜ pending 状态
5. 点击 "Validate & Import"        → FeedValidator 并发校验
                                    ← 实时更新每条状态：
                                       ⏳ checking...
                                       ✅ valid
                                       ❌ 404 Not Found
                                       ❌ SSL certificate error
                                       ❌ Domain not found
                                       ❌ Connection timeout
                                    ← 无效 feed 自动取消选中
6. 校验完成                         ← Notice: "5 valid, 2 invalid"
                                    ← 按钮变为 "Import Selected"
                                    ← 出现 "Select Valid Only" 按钮
7. 用户可调整选择                   ← 可手动勾选/取消任意 feed
8. 点击 "Import Selected"          → 仅导入 ✅ valid 的 feeds
                                    → 保存 + 刷新
9. 看到结果通知                     ← "Imported 5 valid feeds. Skipped 2 invalid."
10. 设置页自动刷新                  ← 显示导入后的完整列表
```

### 5.2 导出流程

```text
用户操作                              系统行为
────────                            ────────
1. 进入 Settings                    
2. 点击 "Export"                   → OPMLExporter 生成 XML
                                    → 触发浏览器下载
3. 保存 .opml 文件                 ← 文件名: simple-rss-export-2026-02-07.opml
```

---

## 六、边界情况处理

### 6.1 OPML 格式兼容性

| 场景 | 处理策略 |
|------|---------|
| 多级嵌套（>2层） | 递归处理，路径用 `/` 拼接 |
| `text` 和 `title` 不一致 | 优先使用 `text`，回退到 `title` |
| 缺少 `xmlUrl` 的 outline | 作为文件夹处理或跳过 |
| `feed://` 协议 URL | 转换逻辑已在 Feeds.ts 中实现 |
| 空文件 / 非 OPML 文件 | 抛出解析错误，Notice 提示 |
| 超大文件（1000+ 订阅） | 正常处理（前端渲染可能稍慢） |
| 重复的 `xmlUrl` | 在导入预览中标记，默认不选中 |
| 编码问题（非 UTF-8） | `fast-xml-parser` 会自动处理常见编码 |

### 6.2 校验相关边界情况

| 场景 | 处理策略 |
|------|--------|
| URL 返回 200 但非 RSS 格式 | `rss-parser` 解析失败，标记为 invalid |
| 需要认证的 feed（如 Stratechery） | 校验失败（403），标记为 invalid |
| DNS 解析失败 | `ENOTFOUND`，显示 "Domain not found" |
| 连接超时（慢速服务器） | 10秒超时后标记为 invalid |
| SSL 证书问题 | 显示 "SSL certificate error" |
| 重定向到非 RSS 页面 | `rss-parser` 解析失败 |
| 大量订阅（50+条）校验耗时长 | 并发 3 个请求，UI 实时更新进度 |
| 校验期间网络断开 | 后续校验全部标记为 timeout |

### 6.3 去重策略

```typescript
// 去重规则：URL 标准化后比较
const normalizeUrl = (url: string): string => {
  return url.toLowerCase()
    .replace(/^https?:\/\//, "")     // 移除协议
    .replace(/\/+$/, "");            // 移除尾部斜杠
};

// 判断是否重复
const isDuplicate = existingFeeds.some(
  existing => normalizeUrl(existing.url) === normalizeUrl(newFeed.url)
);
```

---

## 七、实施计划

### Phase 1: 核心功能（预计 1-2h）

| 步骤 | 任务 | 文件 |
|------|------|------|
| 1 | 创建 `OPMLParser.ts` | `src/opml/OPMLParser.ts` |
| 2 | 创建 `OPMLExporter.ts` | `src/opml/OPMLExporter.ts` |
| 3 | 创建 `FeedValidator.ts` | `src/opml/FeedValidator.ts` |
| 4 | 创建 `OPMLImportModal.ts`（含校验集成） | `src/opml/OPMLImportModal.ts` |
| 5 | 修改 `SimpleRSSSettingTab.ts`，添加导入/导出按钮 | `src/Settings/SimpleRSSSettingTab.ts` |
| 6 | 添加 Modal 样式 | `styles.css` |
| 7 | 编译、部署、测试 | `npm run build` + copy |

### Phase 2: 测试验证

| 测试用例 | 验证项 |
|---------|--------|
| 导入示例 OPML | 正确解析所有订阅 |
| 多级嵌套 OPML | path 正确拼接 |
| 重复订阅检测 | 已有订阅标记为重复 |
| 有效 URL 校验 | 状态显示 ✅ valid |
| 无效 URL 校验（404/超时/SSL） | 状态显示 ❌ + 具体原因 |
| 校验后仅导入有效源 | 无效源不写入 settings |
| 空文件 / 非法文件 | 错误提示友好 |
| 导出后再导入 | 数据一致性 |
| 合并模式 | 保留现有订阅 |
| 替换模式 | 清空后导入 |

### Phase 3: 可选优化

- [ ] 支持拖拽 OPML 文件到设置页
- [ ] 导出时包含自定义模板和 feedType 信息
- [ ] 支持从 URL 导入 OPML（某些服务提供在线 OPML）
- [ ] 添加 OPML 导入的 Command Palette 命令
- [ ] 校验结果缓存（避免重复校验同一 URL）

---

## 八、与原方案的差异对比

| 对比项 | 原方案（v1.0） | 新方案（v2.0） |
|--------|---------------|---------------|
| **实现位置** | 外部 Python 脚本 | 插件内置功能 |
| **操作方式** | 命令行运行脚本 + 手动复制 JSON | 设置页点击按钮 + 弹窗预览 |
| **去重能力** | 无 | 自动检测重复并标记 |
| **有效性校验** | 无 | 并发校验 URL，实时显示结果 |
| **导入模式** | 仅替换 | 合并 / 替换 可选 |
| **多级嵌套** | 仅支持2级 | 支持任意深度 |
| **导出功能** | 无 | 支持导出为标准 OPML |
| **预览确认** | 无 | 弹窗预览，逐条选择 |
| **依赖** | 需要 Python 环境 | 零外部依赖（使用已有 fast-xml-parser） |
| **用户门槛** | 需要技术背景 | 任何用户均可操作 |
| **数据安全** | 手动操作易出错 | 校验 + 备份 + 合并确认 |

---

## 九、技术约束和注意事项

### 9.1 依赖情况

- ✅ `fast-xml-parser` — 已安装（v4.3.3），用于 OPML XML 解析
- ✅ `rss-parser` — 已安装（v3.13.0），用于 feed URL 有效性校验
- ✅ `obsidian` API — `Modal`, `Setting`, `Notice` 等组件
- ❌ 无需新增任何依赖

### 9.2 Obsidian API 约束

- **文件选择**：Obsidian 没有提供文件选择 API，需使用 HTML `<input type="file">` 元素
- **文件下载**：导出使用 `Blob` + `<a>` 标签模拟下载行为
- **Modal**：继承 `obsidian.Modal` 类，提供标准化的弹窗体验

### 9.3 兼容性

- 兼容 Obsidian Desktop（macOS / Windows / Linux）
- 移动端可能不支持文件选择（系统限制）
- 支持主流 RSS 阅读器导出的 OPML 格式（Feedly、Inoreader、Reeder、NewsBlur 等）

---

## 十、总结

本方案将 OPML 导入从**外部脚本**升级为**插件内置功能**，提供了完整的用户交互流程：

1. **一键导入** — 选择文件 → 预览 → 校验 → 确认
2. **有效性校验** — 自动验证每个 URL 的可达性和 RSS 格式
3. **智能去重** — 自动检测已有订阅
4. **安全导入** — 仅导入校验通过的有效订阅源
5. **灵活模式** — 合并或替换
6. **一键导出** — 备份和跨平台迁移
7. **零依赖** — 复用项目已有的 XML 解析库和 RSS 解析库

这是一个面向普通用户的功能，将技术门槛从「需要运行 Python 脚本 + 手动编辑 JSON」降低到「点击按钮 + 选择文件」。
