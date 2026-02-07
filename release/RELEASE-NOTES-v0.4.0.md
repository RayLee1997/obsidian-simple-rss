# Simple RSS v0.4.0 Release Notes

**Release Date**: 2026-02-07  
**Version**: 0.4.0

---

## 🎉 Major Features

### ✨ OPML Import/Export with URL Validation

This release introduces a comprehensive **OPML import and export system** with built-in feed URL validation, making it effortless to migrate between RSS readers or back up your subscriptions.

#### Key Features

1. **📥 OPML Import with Smart Preview**
   - One-click file selection through native file picker
   - Preview modal showing all feeds before import
   - Automatic duplicate detection and flagging
   - Support for unlimited nested categories
   - Choice between "Merge" and "Replace" import modes

2. **🔍 Feed URL Validation (New!)**
   - **Automatic concurrent validation** of all feed URLs before import
   - Real-time status updates for each feed:
     - ⏳ Validating...
     - ✅ Valid RSS/Atom feed
     - ❌ Invalid (with specific error message)
     - ⚠️ Duplicate (already exists)
   - User-friendly error messages:
     - "404 Not Found"
     - "Domain not found"
     - "SSL certificate error"
     - "Connection timeout"
   - **Only valid feeds are imported**, ensuring a clean subscription list
   - Concurrent validation with throttling (3 requests at a time) to avoid overwhelming servers

3. **📤 OPML Export**
   - Export current subscriptions as standard OPML file
   - Automatic browser download
   - File naming: `simple-rss-export-YYYY-MM-DD.opml`
   - Preserves folder/category structure
   - Compatible with all major RSS readers (Feedly, Inoreader, NewsBlur, etc.)

4. **🎯 Smart Selection Tools**
   - "Select All" - Select all feeds
   - "Select Valid Only" - Auto-select only validated feeds
   - Manual toggle for each individual feed
   - Invalid feeds auto-deselected after validation

---

## 🔧 Improvements

### UI Enhancements

- **Larger Template Editor**: Default template text area now has:
  - 300px minimum height (15 rows)
  - 100% width for better visibility
  - Monospace font for easier template editing
  - Much more comfortable for editing complex templates

---

## 📁 File Structure Changes

### New Files Added

```
src/opml/
├── OPMLParser.ts           # OPML XML parser with recursive nesting support
├── OPMLExporter.ts         # OPML XML generator
├── FeedValidator.ts        # Concurrent URL validation service
└── OPMLImportModal.ts      # Import preview modal with validation UI
```

### Modified Files

- `src/Settings/SimpleRSSSettingTab.ts` - Added Import/Export section
- `manifest.json` - Version bump to 0.4.0

---

## 🎓 How to Use

### Importing OPML

1. Go to **Settings → Simple RSS → Import / Export**
2. Click **"Choose File..."** button
3. Select your `.opml` file
4. Review the preview (shows statistics, categories, and duplicate detection)
5. Click **"Validate & Import"** to check all feed URLs
6. Wait for validation to complete (real-time progress updates)
7. Adjust selections if needed (invalid feeds auto-deselected)
8. Click **"Import Selected"** to import valid feeds
9. See confirmation notice with import results

### Exporting OPML

1. Go to **Settings → Simple RSS → Import / Export**
2. Click **"Export"** button
3. OPML file downloads automatically
4. Use this file to backup or migrate to another RSS reader

---

## 🔄 Migration from External Script

If you previously used the external Python script for OPML import, you can now:

1. **Delete the Python script** - No longer needed
2. Use the built-in import feature instead
3. Enjoy automatic validation and duplicate detection
4. Get instant feedback without command-line operations

### Comparison

| Feature | External Script | Built-in (v0.4.0) |
|---------|-----------------|-------------------|
| **Location** | Separate Python script | Plugin settings |
| **Operation** | Command line + manual JSON editing | Click buttons in UI |
| **Validation** | ❌ None | ✅ Concurrent URL validation |
| **Duplicate Detection** | ❌ None | ✅ Automatic |
| **Import Modes** | Replace only | Merge / Replace |
| **Error Handling** | Console errors | User-friendly messages |
| **Requirements** | Python environment | None (zero dependencies) |

---

## 🐛 Known Issues

None reported for this release.

---

## 📊 Technical Details

### Dependencies

- ✅ **Zero new dependencies added**
- Reuses existing `fast-xml-parser` (v4.3.3) for OPML parsing
- Reuses existing `rss-parser` (v3.13.0) for URL validation
  - Ensures validation matches actual sync behavior

### Validation Strategy

- **Concurrency**: 3 parallel requests (configurable)
- **Timeout**: 10 seconds per feed (configurable)
- **Protocol Handling**: Automatic `feed://` → `http://` conversion
- **Error Categorization**: Detailed error codes → user-friendly messages

### Performance

- Typical validation time for 50 feeds: ~30-60 seconds
- UI remains responsive during validation
- Real-time progress updates for each feed

---

## 💡 Tips

1. **Always validate before import** - Use the "Validate & Import" button to avoid importing broken feeds
2. **Backup before replace mode** - Export your current subscriptions before using "Replace all" mode
3. **Review duplicates** - Duplicate feeds are flagged with ⚠️ and unchecked by default
4. **Check validation errors** - Hover over ❌ icons to see specific error messages

---

## 🙏 Credits

- **Original Plugin**: [Monnierant/obsidian-simple-rss](https://github.com/monnierant/obsidian-simple-rss)
- **OPML Import Feature**: Developed by Ray with Antigravity AI
- **Built with**: Obsidian Plugin API, TypeScript

---

## 📝 Changelog Summary

```
v0.4.0 (2026-02-07)
-------------------
[Added]
- OPML import with preview modal
- Feed URL validation with concurrent checking
- Real-time validation status indicators
- Smart duplicate detection
- "Merge" and "Replace" import modes  
- OPML export functionality
- "Select All" and "Select Valid Only" buttons

[Improved]
- Default template text area now 300px tall with monospace font
- Settings UI organization with new Import/Export section

[Technical]
- Added OPMLParser, OPMLExporter, FeedValidator modules
- Added OPMLImportModal with validation integration
- Version bump: 0.3.12 → 0.4.0
```

---

## 🚀 Upgrade Instructions

1. **Backup your data** (optional but recommended):
   - Export OPML before upgrading: Settings → Simple RSS → Export
2. **Install v0.4.0**:
   - Download `simple-rss-v0.4.0.zip` from releases
   - Extract to `.obsidian/plugins/simple-rss/`
   - Restart Obsidian or reload plugin
3. **Verify installation**:
   - Go to Settings → Simple RSS
   - Check for "Import / Export" section
   - Version should show 0.4.0

---

Enjoy the new OPML import/export features! 🎊
