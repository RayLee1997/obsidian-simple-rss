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
