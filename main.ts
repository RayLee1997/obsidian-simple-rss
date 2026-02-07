import { Plugin, Notice } from "obsidian";
import SimpleRSSSettingTab from "./src/Settings/SimpleRSSSettingTab";
import {
	DEFAULT_SETTINGS,
	SimpleRSSPluginSettings,
} from "./src/Settings/SimpleRSSPluginSettings";
import Feeds from "src/sources/Feeds";

export default class SimpleRSSPlugin extends Plugin {
	settings: SimpleRSSPluginSettings;
	feeds: Feeds;

	async onload() {
		console.log("Loading Simple RSS Plugin");
		try {
			await this.loadSettings();
			console.log("Simple RSS: Settings loaded successfully");
		} catch (e) {
			console.error("Simple RSS: Failed to load settings", e);
			new Notice("Simple RSS: Failed to load settings. Using defaults.");
			this.settings = Object.assign({}, DEFAULT_SETTINGS);
		}

		// This creates an interval that will sync the feeds every timeInterval minutes.
		if (this.settings && this.settings.autoPull) {
			this.registerInterval(
				window.setInterval(
					() => this.feeds.syncFeeds(this.app.vault),
					1000 * 60 * this.settings.timeInterval
				)
			);
		}

		console.log("Simple RSS: Adding ribbon icon");
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"refresh-cw",
			"Simple RSS",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("Simple RSS: Syncing feeds...");
				this.feeds.syncFeeds(this.app.vault);
			}
		);
		ribbonIconEl.addClass("simple-rss-ribbon-class");

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SimpleRSSSettingTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		this.feeds = new Feeds()
			.setFeeds(this.settings.feeds)
			.setFeedTypes(this.settings.feedTypes)
			.setBasePath(this.settings.basePath)
			.setDefaultTemplate(this.settings.defaultTemplate);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
