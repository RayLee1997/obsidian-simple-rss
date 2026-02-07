import { Notice, Vault, normalizePath, TFolder, TFile } from "obsidian";
import SimpleRSSFeed from "src/models/SimpleRSSFeed";

import SimpleRSSFeedType from "src/models/SimpleRSSFeedType";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import Parser from "rss-parser";

export default class Feeds {
	feeds: SimpleRSSFeed[] = [];
	feedTypes: SimpleRSSFeedType[] = [];
	basePath = "";
	defaultTemplate = "";
	Mustache = require("mustache");

	constructor() {
		this.feeds = [];
		this.feedTypes = [];
	}

	setFeeds(feeds: SimpleRSSFeed[]): Feeds {
		this.feeds = feeds;
		return this;
	}

	setFeedTypes(feedTypes: SimpleRSSFeedType[]): Feeds {
		this.feedTypes = feedTypes;
		return this;
	}

	setDefaultTemplate(defaultTemplate: string): Feeds {
		this.defaultTemplate = defaultTemplate;
		return this;
	}

	setBasePath(basePath: string): Feeds {
		this.basePath = basePath;
		return this;
	}

	syncFeeds(vault: Vault): void {
		this.feeds.forEach((feed) => {
			const feedType = this.feedTypes.find(
				(feedType) => feedType.id === feed.feedTypeId
			);
			this.syncOneFeed(vault, feed, feedType);
		});
	}

	async syncOneFeed(
		vault: Vault,
		feed: SimpleRSSFeed,
		feedType?: SimpleRSSFeedType
	) {
		new Notice("Sync Feed: " + feed.name);

		let url = feed.url;
		if (url.startsWith("feed://")) {
			url = "http://" + url.substring(7);
		} else if (url.startsWith("feed:")) {
			url = "http://" + url.substring(5);
		}

		let content: any;
		try {
			content = await this.getUrlContent(url, feedType);
		} catch (error) {
			console.error("Simple RSS: Failed to fetch " + url, error);
			new Notice("Simple RSS: Failed to fetch " + feed.name);
			return;
		}

		// Concatenate base path with feed-specific path
		let feedSubPath = feed.path || "";
		const path = feedSubPath
			? normalizePath(this.basePath + "/" + feedSubPath)
			: normalizePath(this.basePath);
		await this.ensureFolderExists(vault, path);

		content.items.forEach((item: any) => {
			const title = feed.title
				? this.parseItem(feed.title, item, content)
				: item.title;
			const text = this.parseItem(
				feed.template ?? this.defaultTemplate,
				item,
				content
			);

			// console.log("Item: ", item);
			if (!title) return;

			// Extract and format date for filename prefix
			let datePrefix = "";
			try {
				// Try to get date from isoDate or pubDate
				const dateStr = item.isoDate || item.pubDate;
				if (dateStr) {
					const date = new Date(dateStr);
					// Format as YYYY-MM-DD
					const year = date.getFullYear();
					const month = String(date.getMonth() + 1).padStart(2, '0');
					const day = String(date.getDate()).padStart(2, '0');
					datePrefix = `${year}-${month}-${day} `;
				}
			} catch (e) {
				console.warn("Simple RSS: Could not parse date for item", e);
			}

			// sanitize title
			const sanitizedTitle = title.replace(/[*"\\<>/:|?#\r\n^]/gi, "");

			const filePath = normalizePath(path + "/" + datePrefix + sanitizedTitle + ".md");

			// Create a new file in the vault
			vault
				.create(filePath, text)
				.then((file) => {
					console.log("Note created :" + filePath);
					new Notice("Note created :" + filePath);
				})
				.catch((error) => {
					if (!error.message.includes("File already exists")) {
						console.error(error);
						new Notice("Error creating note :" + error);
					}
				});
		});
	}

	async ensureFolderExists(vault: Vault, path: string) {
		const folders = path.split("/");
		let currentPath = "";
		for (const folder of folders) {
			currentPath = currentPath === "" ? folder : currentPath + "/" + folder;
			const existing = vault.getAbstractFileByPath(currentPath);
			if (!existing) {
				await vault.createFolder(currentPath);
			}
		}
	}

	getUrlContent(url: string, feedType?: SimpleRSSFeedType) {
		const myFeedType = feedType
			? {
				customFields: {
					feed: feedType.feed,
					item: feedType.item,
				},
			}
			: undefined;
		const parser: Parser = new Parser(myFeedType);

		return parser.parseURL(url);
	}

	getValue(data: any, keys: string | string[]): any {
		// If plain string, split it to array
		if (typeof keys === "string") {
			keys = keys.split(".");
		}

		// Get key
		var key: string | undefined = keys.shift();

		// Get data for that key
		var keyData = data[key ?? ""];

		// Check if there is data
		if (!keyData) {
			return undefined;
		}

		// Check if we reached the end of query string
		if (keys.length === 0) {
			return keyData;
		}

		// recusrive call!
		return this.getValue(Object.assign({}, keyData), keys);
	}

	replaceField(template: string, kind: string, values: any): string {
		const regex = new RegExp("{{" + kind + "\\.[^}]+}}", "g");
		let result = template;
		let match;
		match = regex.exec(result);
		match?.forEach((m) => {
			const key = m.replace("{{" + kind + ".", "").replace("}}", "");
			result = result.replaceAll(m, this.getValue(values, key) ?? "");
		});
		return result;
	}

	replaceFieldsMustache(template: string, values: any): string {
		return this.Mustache.render(template, values);
	}

	parseItem(template: string, item: any, feed: any): string {
		let categories = "";
		if (item.categories) {
			item.categories.forEach((category: string) => {
				categories += "- " + category + "\n";
			});
		}
		let result = template.replaceAll("{{item.categories}}", categories);

		// find all {{item.*}} and replace them with the value
		// result = this.replaceField(result, "feed", feed);
		// result = this.replaceField(result, "item", item);
		result = this.replaceFieldsMustache(result, { feed, item });

		return result;
	}
}
