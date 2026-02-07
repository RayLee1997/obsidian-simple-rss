# Simple RSS v0.5.0 安装说明

## 📦 发布包内容

- **文件**: `simple-rss-v0.5.0.zip`
- **大小**: 88 KB
- **包含**:
  - `main.js` - 插件主程序
  - `manifest.json` - 插件元数据（v0.5.0）
  - `styles.css` - 样式文件

---

## 🚀 安装方法

### 方法 1: 手动安装（推荐）

1. **下载发布包**

   ```
   release/simple-rss-v0.5.0.zip
   ```

2. **定位插件目录**
   - 打开你的 Obsidian vault
   - 进入 `.obsidian/plugins/` 目录
   - 如果目录不存在，创建它

3. **安装插件**
   - 在 `plugins/` 目录下创建 `simple-rss/` 文件夹（如果已存在则覆盖）
   - 解压 `simple-rss-v0.5.0.zip` 到 `simple-rss/` 文件夹
   - 确保文件结构如下：

     ```
     .obsidian/
     └── plugins/
         └── simple-rss/
             ├── main.js
             ├── manifest.json
             └── styles.css
     ```

4. **启用插件**
   - 重启 Obsidian 或执行 "Reload app without saving"
   - 进入 设置 → 第三方插件
   - 找到 "Simple RSS" 并启用

5. **验证安装**
   - 进入 设置 → Simple RSS
   - 检查是否存在 "Import / Export" 区域
   - 版本应显示为 **0.5.0**

---

## 🔄 从旧版本升级

### 从 v0.4.0 升级

**主要新增**: 文章时间自动排序功能

1. **备份（可选）**
   - 设置 → Simple RSS → Export OPML

2. **替换文件**
   - 删除或备份现有的 `.obsidian/plugins/simple-rss/` 文件
   - 解压新版本到该目录

3. **重启 Obsidian**

4. **验证新功能**
   - 同步一个 RSS 订阅
   - 检查新文章文件名是否有日期前缀（如 `2026-02-07 文章标题.md`）
   - 设置文件夹排序为 "File name (A to Z)"
   - 验证最新文章在顶部

### 从 v0.3.12 或更早版本升级

**主要新增**:

1. OPML 导入/导出 + URL 校验
2. 文章时间自动排序

3. **必须备份**
   - 如果有 v0.3.12，先安装 v0.4.0 导出 OPML
   - 或手动备份 `.obsidian/plugins/simple-rss/data.json`

4. **升级步骤**
   - 停用旧版本（设置 → 第三方插件 → 禁用 Simple RSS）
   - 替换插件文件
   - 重启 Obsidian
   - 启用插件

5. **验证**
   - 检查设置页面中的两个新功能区域
   - 你的现有订阅数据会自动保留

---

## ✨ 新功能快速上手

### Feature 1: OPML 导入

1. 设置 → Simple RSS → Import / Export
2. 点击 "Choose File..." 选择 `.opml` 文件
3. 预览窗口会显示所有订阅源和统计信息
4. 点击 "Validate & Import" 开始自动校验
5. 等待校验完成（实时显示每个源的状态）
   - ⏳ 校验中...
   - ✅ 有效
   - ❌ 无效（附错误信息）
   - ⚠️ 重复
6. 点击 "Import Selected" 完成导入（仅导入有效源）

### Feature 2: OPML 导出

1. 设置 → Simple RSS → Import / Export
2. 点击 "Export" 按钮
3. 浏览器会自动下载 `.opml` 文件

### Feature 3: 文章时间排序

**自动生效，无需配置！**

1. **同步 RSS 订阅**（正常操作）
   - 新文章文件名会自动添加日期前缀
   - 格式：`YYYY-MM-DD 文章标题.md`
   - 示例：`2026-02-07 Why I Joined OpenAI.md`

2. **设置文件夹排序**
   - 点击文件夹右上角 **...** 菜单
   - 选择 **Sort by** → **File name (A to Z)**

3. **享受自动排序**
   - 最新文章自动显示在顶部
   - 历史文章按时间轴自然排列

---

## 🔧 故障排除

### 问题：安装后看不到新功能

**解决方案**：

1. 确认版本号是 **0.5.0**（设置 → 第三方插件 → Simple RSS）
2. 完全重启 Obsidian（不是刷新）
3. 检查控制台是否有错误（Ctrl/Cmd + Shift + I）

### 问题：导入 OPML 时校验失败

**可能原因**：

- 网络连接问题
- Feed URL 已失效
- 服务器暂时不可用

**解决方案**：

- 检查网络连接
- 等待一段时间后重试
- 手动取消选择失败的源，仅导入成功的源

### 问题：文章文件名没有日期前缀

**可能原因**：

- RSS 源没有提供日期字段（`pubDate` 或 `isoDate`）
- 日期解析失败

**解决方案**：

1. 检查 RSS 源是否提供日期
2. 查看控制台是否有日期解析警告
3. 验证该 RSS 源的 XML 是否包含日期字段

### 问题：导入后订阅数据丢失

**解决方案**：

- 检查是否误用了 "Replace all" 模式
- 从备份的 OPML 文件重新导入
- 检查 `.obsidian/plugins/simple-rss/data.json` 是否存在

---

## 📋 系统要求

- **Obsidian**: v0.15.0 或更高版本
- **平台**: Desktop (macOS, Windows, Linux)
- **网络**: OPML 导入时需要网络连接（用于 URL 校验）

---

## 📚 相关文档

- [Release Notes](./RELEASE-NOTES-v0.5.0.md) - 完整的发布说明
- [Release Summary](./RELEASE-SUMMARY-v0.5.0.md) - 发布总览
- [OPML 功能方案](../docs/增加%20rss%20订阅的%20poml%20文件导入功能.md) - 技术设计
- [文章排序方案](../docs/文章时间倒序排列方案.md) - 排序功能说明

---

## 💬 反馈与支持

如遇到问题或有功能建议，请：

1. 检查 [故障排除](#-故障排除) 部分
2. 查看 [发布说明](./RELEASE-NOTES-v0.5.0.md)
3. 提交 Issue 或联系开发者

---

**安装完成后，享受两大新功能带来的全新体验！** 🎉

### 两大亮点

1. **OPML 导入/导出** - 轻松迁移订阅，自动校验 URL 有效性
2. **文章时间排序** - 最新文章始终在前，零配置自动生效
