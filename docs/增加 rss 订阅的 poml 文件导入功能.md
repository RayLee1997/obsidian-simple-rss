# RSS 订阅 OPML 文件导入功能实现文档

本文档记录了将 `src/rss/rss_subscriptions_important.opml` 中的订阅源转换为 Obsidian Simple RSS 插件可识别的 `data.json` 配置格式的过程。

## 背景信息：数据格式说明

在进行转换之前，了解两种数据格式的区别有助于理解整个过程：

* **OPML (Outline Processor Markup Language)**:
  * **定义**: 一种基于 XML 的通用格式，最初设计用于大纲处理程序，现已成为 RSS 阅读器之间交换订阅列表的行业标准。
  * **特点**: 采用树状结构，`<outline>` 标签可以嵌套，非常适合表示带有分类（文件夹）的订阅列表。许多主流 RSS 阅读器（如 Reeder, Feedly, Inoreader）都支持导出为 OPML。
  * **本项目中的用途**: 作为原始订阅源数据的存储格式，方便管理和与其他阅读器同步。

* **Obsidian Simple RSS JSON 配置**:
  * **定义**: Obsidian 插件 `obsidian-simple-rss` 用于存储用户设置的内部数据格式，通常保存在 `data.json` 文件中。
  * **特点**: 一个扁平化的 JSON 结构。虽然它支持“文件夹”概念，但它是通过对象属性 `"path"` 来实现的，而不是像 OPML 那样通过物理嵌套。
  * **转换必要性**: 该插件目前没有内置 OPML 导入功能，因此我们需要通过脚本将 OPML 的层级结构“拍平”为插件所需的 JSON 对象数组，并将 OPML 的父级分类名称映射到 JSON 对象的 `path` 字段中。

## 1. 准备工作

### 源文件 (OPML)

我们的源文件是 OPML 格式，包含多个分类（如“深度科技与极客文化”），每个分类下有多个 RSS 订阅源。
文件路径: `src/rss/rss_subscriptions_important.opml`

### 目标格式 (JSON)

Obsidian Simple RSS 插件的配置文件 `data.json` 中，订阅源存储在 `feeds` 数组中。
每个订阅源对象的结构如下：

```json
{
  "name": "订阅源名称",
  "url": "RSS地址",
  "path": "分类文件夹名称" // 我们将 OPML 的分类映射到这里的 path
}
```

## 2. 编写转换脚本

使用 Python 脚本解析 XML 结构的 OPML 文件，并将其映射为目标 JSON 格式。

**脚本文件**: `convert_opml.py`

```python
import xml.etree.ElementTree as ET
import json
import os

# 定义源文件路径 (根据实际情况调整绝对路径或相对路径)
opml_path = "src/rss/rss_subscriptions_important.opml"

def parse_opml(file_path):
    # 解析 XML
    tree = ET.parse(file_path)
    root = tree.getroot()
    body = root.find('body')
    
    feeds = []
    
    # 遍历顶层分类 (outline节点)
    for category_outline in body.findall('outline'):
        category = category_outline.get('text')
        
        # 检查是否有子节点 (分类下的订阅源)
        children = category_outline.findall('outline')
        
        if children:
            for child in children:
                feed = {
                    "name": child.get('text'),   # 订阅源名称
                    "url": child.get('xmlUrl'),  # RSS 地址
                    "path": category             # 使用分类名作为 Obsidian 中的文件夹路径
                }
                feeds.append(feed)
        else:
            # 处理没有分类的顶层订阅源
            if category_outline.get('xmlUrl'):
                feed = {
                    "name": category_outline.get('text'),
                    "url": category_outline.get('xmlUrl'),
                    "path": "" 
                }
                feeds.append(feed)
                
    return feeds

if __name__ == "__main__":
    if os.path.exists(opml_path):
        feeds = parse_opml(opml_path)
        # 输出格式化的 JSON
        print(json.dumps(feeds, indent=2, ensure_ascii=False))
    else:
        # 如果相对路径找不到，尝试绝对路径
        abs_path = os.path.abspath(opml_path)
        if os.path.exists(abs_path):
            feeds = parse_opml(abs_path)
            print(json.dumps(feeds, indent=2, ensure_ascii=False))
        else:
            print(f"Error: File not found at {opml_path}")
```

## 3. 执行转换

在项目根目录下运行脚本：

```bash
python3 convert_opml.py
```

该命令将输出 JSON 数组，例如：

```json
[
  {
    "name": "Hacker News (精选)",
    "url": "https://hnrss.org/frontpage",
    "path": "深度科技与极客文化"
  },
  {
    "name": "The Verge",
    "url": "https://www.theverge.com/rss/index.xml",
    "path": "深度科技与极客文化"
  },
  ...
]
```

## 4. 应用到插件配置

1. 找到你的 Obsidian 仓库中的插件配置文件：
    `.obsidian/plugins/obsidian-simple-rss/data.json`
2. 备份该文件。
3. 用文本编辑器打开 `data.json`，找到 `"feeds": [...]` 字段。
4. 将脚本生成的 JSON 数组内容复制并替换 `feeds` 数组的内容。
5. 保存文件并重启 Obsidian (或重新加载插件)。

---
*注：此方法通过直接修改配置文件实现批量导入，绕过了插件界面手动添加的繁琐步骤。*
