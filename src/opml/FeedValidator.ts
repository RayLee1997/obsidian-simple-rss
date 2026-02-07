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
