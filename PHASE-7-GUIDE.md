# FaithPresenter Phase 7 — Offline Bible library

Version 0.7.0. Cumulative desktop development release, including Phase 6.

## Upgrade your VS Code project

1. In the existing app, back up the database and its matching `.media` folder. Close all FaithPresenter windows.
2. Keep your Phase 6 project as a recovery copy. Extract the Phase 7 Source archive into a NEW folder, such as `C:\WEB DEV\FaithPresenter-0.7.0`. Do not copy `node_modules` or `dist` from Phase 6 into it.
3. Open the new folder in VS Code. With Node.js 24 or newer installed, run `npm ci`, then `npm start`.
4. The start command rebuilds and launches the desktop app. Check the status bar for v0.7.0.
5. Existing services, songs, themes and managed media should appear. This development app uses the same Electron user-data location as the previous build, so only run one version at a time.

No need to uninstall Node.js or VS Code. Keep local changes you made separately; this source is based on the saved Phase 6 release, not unseen edits on your computer.

## Run the portable Windows build

Extract the Windows Portable ZIP into a new folder and open `FaithPresenter.exe`. Keep all accompanying files together. The `examples` folder contains the optional Bible import example; the app does not automatically import it. This is an unsigned portable build, not a Setup installer. Physical Windows execution remains to be tested by you.

## Try the Bible module

1. Click **Bible** in the top toolbar. Its resource dock expands.
2. Click **Import Bible JSON** and select `examples/Psalm-117-WEBP-Example.json`.
3. Select the imported translation. The example contains ONLY Psalms 117:1–2, not a complete Bible.
4. Search `Psalms 117:1-2` or a phrase such as `loving kindness`.
5. Set **Book**, **Chapter**, **From** and **To** to the passage you want. Click **Preview passage** to inspect its words.
6. Click **Add passage to service**. A new service item and independently editable slides appear. Autosave uses the existing service workflow.
7. Select the new slide, open the audience display if needed, then **Take Live**. Search and browsing never send scripture live by themselves.
8. Use Phase 6's Design and Themes tools to restyle the scripture slides. Apply a theme to the whole item if desired.

Clicking a search-result reference selects that single verse in the passage controls. The controls, not the entire keyword result list, determine what Add passage inserts. Verse ranges stay within one chapter; add another passage for another chapter.

## Import format

UTF-8 JSON (optional UTF-8 BOM), maximum 20 MiB:

```json
{
  "format": "faithpresenter-bible-v1",
  "name": "Your translation name",
  "abbreviation": "YOUR-ID",
  "license": "Permission and source details for this edition",
  "verses": [
    {"book": "John", "chapter": 3, "verse": 16, "text": "Insert the actual licensed verse text here"}
  ]
}
```

The text above demonstrates the structure only; it is not a verse to present. Import a translation you have permission to use. A PDF, Word file, USFM file or arbitrary Bible JSON is not supported directly. No complete translation, online download service or automatic format converter is included in Phase 7.

Required values:

- Translation name: 1–100 characters; abbreviation: 1–24; permission/source information: 1–2,000.
- 1–50,000 verse records, each with a book name of 1–60 characters, chapter and verse integers from 1–200, and text of 1–10,000 characters.
- Use consistent full book names and supply verses in canonical book order. Chapter navigation follows the imported book order. In a passage, verses are ordered numerically.
- Duplicate book/chapter/verse records are rejected. An already imported abbreviation is rejected; use a distinct abbreviation for a distinct edition.
- Import validates before writing and runs in one database transaction. A malformed import or database write failure leaves existing records intact.

You may import more than one translation. The source/permission text remains visible under the translation selector. Partial excerpts are accepted and must be clearly labelled; the library displays the number of imported verses. Selecting a missing verse causes an error rather than silently omitting it.

## Search and slides

- Reference searches use the full imported book name: `John 3:16`, `1 John 1:1`, or `John 3:16-18`. Both hyphen and en dash ranges work.
- Other input performs a literal phrase search across that translation's verse text. SQL wildcard characters do not act as wildcards. ASCII case differences are ignored; Unicode case-folding is not implemented.
- Keyword search shows at most 200 results with an explicit notice when more exist. Refine the query to find a particular result.
- Select up to 100 verses per passage. Slide generation is capped at 100 slides per service item.
- Each verse starts on a new slide. Text longer than 450 characters splits at a word boundary where possible. Each part includes the book, chapter, verse, translation abbreviation and part number. Review readability on the actual projector.
- Bible text uses the same existing text renderer and fitting controls as other slides. Footnotes and alternate readings should not be mixed into the verse text unless you want them projected.
- Generated slides are independent copies. They retain reference labels as editable text; later editing can change those words, so review edited scripture carefully.
- The module has no translation deletion/replacement UI, side-by-side translation comparison, verse styling automation or Bible transfer/export yet.

## Storage and backups

Bible records use additional SQLite tables in the existing profile database. This release does not rewrite the existing service, song, theme or media data formats. **Back up database** includes Bible text and its source metadata as well as the existing content. Keep the backup `.sqlite` and matching `.media` folder together. Avoid alternating versions against the same working profile.

## Windows acceptance checklist

- Confirm v0.7.0 opens with existing services, songs, themes and media.
- Import the Psalm example and find both verses using the reference and keyword searches.
- Attempt the same import again: it should report the duplicate abbreviation without changing the first import.
- Search an unavailable verse such as Psalms 117:3: it should report missing content.
- Add verses 1–2, save, close, reopen and confirm both the translation and service slides remain.
- Take verse 1 live, then browse verse 2: the audience must stay on verse 1 until Take Live.
- Check long passages and styling on your real projector, including the reference/translation line.
- Create a database backup; keep its matching media folder.

## Verification and limits

74 automated data/desktop tests passed, including Bible persistence, atomic import rollback, duplicate detection, missing verses, numbered-book references, bounded search, long-verse splitting, independent service copies and backup content. The existing service/song/audience integration suite plus the new Bible workflow passed with real SQLite and simulated Electron windows. TypeScript and production compilation passed.

These checks do not establish native Windows startup, physical projector behaviour or visual layout. The visual browser download timed out in this environment; please use the Windows checklist. Existing dependency warnings have not been resolved by this feature update. A signed, security-reviewed public installer remains later work.

## Example source

The optional two-verse example faithfully transcribes the main verse text of [Psalms 117 in WEBP](https://ebible.org/engwebp/PSA117.htm). [The World English Bible publisher](https://worldenglish.bible/) identifies this translation as public domain and permits copying; its name identifies faithful copies. Source footnotes explain the LORD rendering. Retrieved September 3, 2026. The excerpt is labelled as partial and does not claim to be a complete translation.
