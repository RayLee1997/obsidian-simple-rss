# Simple RSS v0.4.0 安装说明

## 📦 发布包内容

- **文件**: `simple-rss-v0.4.0.zip`
- **大小**: 88 KB
- **包含**:
  - `main.js` - 插件主程序
  - `manifest.json` - 插件元数据
  - `styles.css` - 样式文件

---

## 🚀 安装方法

### 方法 1: 手动安装（推荐）

1. **下载发布包**

   ```
   release/simple-rss-v0.4.0.zip
   ```

2. **定位插件目录**
   - 打开你的 Obsidian vault
   - 进入 `.obsidian/plugins/` 目录
   - 如果目录不存在，创建它

3. **安装插件**
   - 在 `plugins/` 目录下创建 `simple-rss/` 文件夹（如果已存在则覆盖）
   - 解压 `simple-rss-v0.4.0.zip` 到 `simple-rss/` 文件夹
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
   - 版本应显示为 0.4.0

---

## 🔄 从旧版本升级

### 备份（可选但推荐）

在升级前，建议导出当前订阅作为备份：

1. 设置 → Simple RSS → Export OPML
2. 保存 `.opml` 文件到安全位置

### 升级步骤

1. **停用旧版本**（可选）
   - 设置 → 第三方插件 → 禁用 Simple RSS

2. **替换文件**
   - 删除或备份现有的 `.obsidian/plugins/simple-rss/` 文件
   - 解压新版本到该目录

3. **重启 Obsidian**

4. **启用插件**
   - 设置 → 第三方插件 → 启用 Simple RSS

5. **验证**
   - 检查设置页面中的新功能
   - 你的现有订阅数据（保存在 `data.json`）会自动保留

---

## ✨ 新功能快速上手

### OPML 导入

1. 设置 → Simple RSS → Import / Export
2. 点击 "Choose File..." 选择 `.opml` 文件
3. 预览窗口会显示所有订阅源
4. 点击 "Validate & Import" 开始校验
5. 等待校验完成（可实时看到每个源的状态）
6. 点击 "Import Selected" 完成导入

### OPML 导出

1. 设置 → Simple RSS → Import / Export
2. 点击 "Export" 按钮
3. 浏览器会自动下载 `.opml` 文件

---

## 🔧 故障排除

### 问题：安装后看不到新功能

**解决方案**：

1. 确认版本号是 0.4.0（设置 → 第三方插件 → Simple RSS）
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

### 问题：导入后订阅数据丢失

**解决方案**：

- 检查是否误用了 "Replace all" 模式
- 从备份的 OPML 文件重新导入
- 检查 `.obsidian/plugins/simple-rss/data.json` 是否存在

---

## 📋 系统要求

- **Obsidian**: v0.15.0 或更高版本
- **平台**: Desktop (macOS, Windows, Linux)
- **网络**: 导入时需要网络连接（用于 URL 校验）

---

## 📚 相关文档

- [Release Notes](./RELEASE-NOTES-v0.4.0.md) - 完整的发布说明
- [OPML 功能测试清单](../docs/OPML功能测试清单.md) - 功能测试指南
- [OPML 导入功能方案](../docs/增加%20rss%20订阅的%20poml%20文件导入功能.md) - 技术设计文档

---

## 💬 反馈与支持

如遇到问题或有功能建议，请：

1. 检查 [已知问题](./RELEASE-NOTES-v0.4.0.md#-known-issues)
2. 查看 [故障排除](#-故障排除) 部分
3. 提交 Issue 或联系开发者

---

**安装完成后，享受全新的 OPML 导入/导出功能！** 🎉
