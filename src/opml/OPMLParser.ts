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
