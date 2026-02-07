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
                case "valid": return "✅";
                case "invalid": return "❌";
                case "validating": return "⏳";
                case "duplicate": return "⚠️";
                default: return "⬜";  // pending
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
