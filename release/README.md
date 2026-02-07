# Simple RSS Release Files

这个目录包含 Simple RSS 插件的发布文件。

---

## 📦 v0.5.0 (2026-02-07) - Latest

### 发布文件

| 文件 | 大小 | 描述 |
|------|------|------|
| `simple-rss-v0.5.0.zip` | 88 KB | **⭐ 可直接安装的插件包** |
| `RELEASE-NOTES-v0.5.0.md` | - | 完整的发布说明 |

### 主要更新

✨ **两大重磅功能**

#### 1. OPML 导入/导出 + URL 校验

- 📥 从 OPML 文件导入订阅（支持无限层级嵌套）
- 📤 导出当前订阅为 OPML 文件
- 🔍 导入前自动校验所有 Feed URL 有效性
- ⚠️ 智能去重检测
- ✅ 仅导入验证通过的有效订阅源

#### 2. 文章时间自动排序

- � RSS 文章自动按发布时间倒序排列
- 🏷️ 文件名自动添加 `YYYY-MM-DD` 日期前缀
- 📊 最新文章始终在文件夹顶部
- ⚡ 零配置，开箱即用

�🔧 **UI 改进**

- 📝 Default template 编辑框扩大（300px 高度 + 等宽字体）

---

## � v0.4.0 (2026-02-07) - Superseded

### 发布文件

| 文件 | 大小 | 描述 |
|------|------|------|
| `simple-rss-v0.4.0.zip` | 88 KB | OPML 导入/导出功能（已被 v0.5.0 取代） |
| `RELEASE-NOTES-v0.4.0.md` | - | v0.4.0 发布说明 |
| `CHANGELOG-v0.4.0.md` | - | v0.4.0 详细变更 |
| `INSTALL-v0.4.0.md` | - | v0.4.0 安装指南 |
| `RELEASE-SUMMARY.md` | - | v0.4.0 发布总览 |

**注意**: v0.4.0 已被 v0.5.0 取代，请使用最新版本。

---

## 📖 快速安装

### 安装 v0.5.0

```bash
# 解压到 Obsidian 插件目录
unzip simple-rss-v0.5.0.zip -d /path/to/vault/.obsidian/plugins/simple-rss/

# 重启 Obsidian
```

### 验证安装

1. 设置 → 第三方插件 → Simple RSS
2. 版本应显示 **0.5.0**
3. 检查 Import / Export 区域是否存在

---

## 🔄 版本历史

| 版本 | 日期 | 主要更新 |
|------|------|----------|
| **0.5.0** | 2026-02-07 | OPML 导入/导出 + URL 校验 + 文章时间排序 ⭐ |
| 0.4.0 | 2026-02-07 | OPML 导入/导出 + URL 校验 |
| 0.3.12 | - | 之前的版本 |

---

## 📋 文件清单

```
release/
├── README.md                      # 本文件
├── simple-rss-v0.5.0.zip         # ⭐ 最新可安装包
├── RELEASE-NOTES-v0.5.0.md       # 最新发布说明
│
# v0.4.0 归档文件
├── simple-rss-v0.4.0.zip         
├── RELEASE-NOTES-v0.4.0.md       
├── CHANGELOG-v0.4.0.md           
├── INSTALL-v0.4.0.md             
└── RELEASE-SUMMARY.md            
```

---

## ✅ 验证发布包完整性

```bash
# 检查 ZIP 包内容
unzip -l simple-rss-v0.5.0.zip

# 应该包含：
# - main.js
# - manifest.json (version: 0.5.0)
# - styles.css
```

---

## 🚀 使用建议

### 新用户

1. 下载 `simple-rss-v0.5.0.zip`
2. 解压到 `.obsidian/plugins/simple-rss/`
3. 重启 Obsidian
4. 在设置中配置 RSS 订阅

### 升级用户（从 v0.4.0）

1. 建议导出 OPML 备份
2. 替换插件文件
3. 重启 Obsidian
4. 测试新功能：
   - 文章时间排序（自动生效）
   - 确保文件夹按文件名排序

### 升级用户（从 v0.3.12 或更早）

1. **必须**导出 OPML 备份
2. 替换插件文件
3. 重启 Obsidian
4. 验证所有新功能

---

## 📚 相关文档

### v0.5.0

- [Release Notes](./RELEASE-NOTES-v0.5.0.md) - 完整功能说明

### v0.4.0 归档

- [Release Notes](./RELEASE-NOTES-v0.4.0.md)
- [Changelog](./CHANGELOG-v0.4.0.md)
- [Install Guide](./INSTALL-v0.4.0.md)

### 开发文档

- [OPML 功能方案](../docs/增加%20rss%20订阅的%20poml%20文件导入功能.md)
- [文章时间排序方案](../docs/文章时间倒序排列方案.md)
- [测试清单](../docs/OPML功能测试清单.md)

---

**Ready to install?** 📥 下载 `simple-rss-v0.5.0.zip` 开始使用两大新功能！
