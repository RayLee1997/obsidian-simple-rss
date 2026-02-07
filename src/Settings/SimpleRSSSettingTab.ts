import { App, PluginSettingTab, SearchComponent, Setting, Notice } from "obsidian";

import SimpleRSSPlugin from "main";
import { FolderSuggest } from "src/Library/FolderSuggestor";
import SimpleRSSFeedPanel from "./SimpleRSSFeddPanel";
import SimpleRSSFeedTypePanel from "./SimpleRSSFeddTypePanel";
import { OPMLParser } from "src/opml/OPMLParser";
import { OPMLExporter } from "src/opml/OPMLExporter";
import { OPMLImportModal } from "src/opml/OPMLImportModal";

export default class SimpleRSSSettingTab extends PluginSettingTab {
	plugin: SimpleRSSPlugin;
	feedPanel: SimpleRSSFeedPanel;
	feedTypePanel: SimpleRSSFeedTypePanel;

	constructor(app: App, plugin: SimpleRSSPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.feedPanel = new SimpleRSSFeedPanel(app, plugin);
		this.feedTypePanel = new SimpleRSSFeedTypePanel(app, plugin);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", { text: "Synchronisation" });

		// Pull toogle
		new Setting(containerEl)
			.setName("Pull")
			.setDesc("Pull the feeds on periodic basis. (Restart required)")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoPull)
					.onChange(async (value) => {
						this.plugin.settings.autoPull = value;
						await this.plugin.saveSettings();
					})
			);

		// Time Interval number field
		new Setting(containerEl)
			.setName("Time interval")
			.setDesc(
				"Time interval between each pull in minutes. (Restart required)"
			)
			.addText((text) =>
				text
					.setPlaceholder("Time Interval")
					.setValue(this.plugin.settings.timeInterval.toString())
					.onChange(async (value) => {
						this.plugin.settings.timeInterval = parseInt(value);
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h1", { text: "Defaults" });

		// Base Path text field
		new Setting(containerEl)
			.setName("Base path")
			.setDesc("Base directory for all feeds. Each feed's path will be relative to this directory.")
			.addSearch((search) =>
				search
					.setPlaceholder("/")
					.setValue(this.plugin.settings.basePath)
					.onChange(async (value) => {
						this.plugin.settings.basePath = value;
						await this.plugin.saveSettings();
					})
			);

		// Default Template text field
		new Setting(containerEl)

			.setName("Default template")
			.setDesc("This is the default template for all feed.")
			.addTextArea((text) => {
				text
					.setPlaceholder("{{{item.title}}}")
					.setValue(this.plugin.settings.defaultTemplate)
					.onChange(async (value) => {
						this.plugin.settings.defaultTemplate = value;
						await this.plugin.saveSettings();
					});
				// 设置文本框大小
				text.inputEl.rows = 15;
				text.inputEl.cols = 60;
				text.inputEl.style.width = "100%";
				text.inputEl.style.minHeight = "300px";
				text.inputEl.style.fontFamily = "monospace";
			});

		// Import / Export section
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
								new Notice("Failed to parse OPML file: " + (e as Error).message);
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

		this.feedPanel.display(containerEl.createEl("div", { cls: "Feeds" }));

		this.feedTypePanel.display(
			containerEl.createEl("div", { cls: "FeedTypes" })
		);
	}
}
