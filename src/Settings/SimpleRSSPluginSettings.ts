import { v4 as randomUUID } from "uuid";
import SimpleRSSFeed from "src/models/SimpleRSSFeed";
import SimpleRSSFeedType from "src/models/SimpleRSSFeedType";

export interface SimpleRSSPluginSettings {
	basePath: string;
	defaultTemplate: string;
	autoPull: boolean;
	timeInterval: number;
	feeds: SimpleRSSFeed[];
	feedTypes: SimpleRSSFeedType[];
}

export const DEFAULT_SETTINGS: SimpleRSSPluginSettings = {
	basePath: "",
	defaultTemplate: "# {{{item.title}}}\n\n**Author:** {{{item.creator}}}\n**Published:** {{{item.pubDate}}}\n**Link:** {{{item.link}}}\n**GUID:** {{{item.guid}}}\n**Tags:** {{item.categories}}\n\n---\n\n## Summary\n\n{{{item.contentSnippet}}}\n\n---\n\n## Content\n\n{{{item.content}}}\n\n---\n\n**ISO Date:** {{{item.isoDate}}}",
	autoPull: false,
	timeInterval: 60,
	feeds: [],
	feedTypes: [
		{
			name: "Youtube",
			feed: ["yt:channelId"],
			item: ["yt:videoId", "yt:channelId", "media:group"],
			id: randomUUID(),
		},
	],
};
