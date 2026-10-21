# chialing.chen.highlights

Chia-Ling Chen's portfolio site. Static HTML, CSS and vanilla JS. No build step.

## Writing style

These rules apply to every piece of visible copy on the site.

**Punctuation**

- No en dashes (`–`) anywhere in prose.
- No em dashes (`—`) either, with one exception: **a matched pair** may set off an inline list
  in the middle of a sentence, where the list names the thing just mentioned. A single em dash
  used as a pause is still not allowed. The exception reads like this:

  > Once a flow outgrew the viewport, every incremental edit — finding a node, reading a label,
  > rearranging a branch — compounded, and the effort to work around that friction only grew.

  Everywhere else, use a full stop and start a new sentence, or rephrase.
- No semicolons in prose.
- Keep commas to a minimum. No sentence should carry three or more. If a sentence needs that
  many, split it. Two cases do not count against the limit: simple lists ("product, engineering,
  data, research and content") and the commas inside a matched em dash pair above.
- Hyphens inside compound words are fine ("0-to-1", "edit-to-publish", "post-launch").

**Sentences**

- Short and declarative. One idea per sentence.
- Prefer a full stop over a subordinate clause. "The real problem was size." beats "The problem,
  which turned out to be size, ..."
- No contractions. Write "we would", not "we'd".

**Voice**

- First person for what Chia-Ling did ("I designed", "I ran"). "We" for the team.
- Write from inside the project, as the person who owned the work. Not as an analyst describing
  it from outside.
- Lead with the point, then the supporting data. Not "Usage data revealed X" but "X. The data
  showed ..."
- No marketing or strategy jargon where a plain word exists. Say "the other automation tools",
  not "the category".

**Captions**

- A caption says what the image shows that the body text does not. Never restate the paragraph
  it sits next to.

## Content rules

- Figures and stats must match across pages. Partner flows are **two times bigger** than
  single-account flows, not three.
- Legacy and Classic are the two platform names. Define them before first use in body copy.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Home. Hero, featured work card, experience timeline |
| `about.html` | Full experience, one media item per role |
| `thryv-automation.html` | The Thryv Automation Builder case study |
| `work.html` | Older project list. Nothing links to it |
| `style.css` | All styling. Theme tokens at the top |
| `motion.js` | Scroll reveal, and clips that load only when near the viewport |
| `nav.js` | Sliding nav highlight and the Connect dropdown |
| `lightbox.js` | Full-screen viewer for images and clips |

Bump the `?v=` number on `style.css` (and on a JS file you change) in all four pages whenever
you edit it, otherwise returning visitors keep the cached copy.

## Media

- Clips: H.264 MP4, 30fps, no audio, `preload="none"` and no `autoplay` unless the clip sits
  above the fold. `motion.js` starts them when they come near the viewport.
- Images: keep full resolution so they stay sharp on retina. Compress with
  `ffmpeg -i in.png -q:v 3 out.jpg` rather than scaling down.
- Keep each page's initial load under about 1 MB. The whole site should load in well under five
  seconds.

## Publishing

Work happens on the `multi-page` branch. Push it to two remotes:

```bash
git push origin multi-page
git push https://github.com/chialingchen-portfolio/chialingchen-portfolio.github.io.git multi-page:refs/heads/main
```

The second one is what GitHub Pages builds and serves at
https://chialingchen-portfolio.github.io/

**Only push when Chia-Ling asks.** Make changes, verify them in the local preview, and wait.

GitHub Pages allows roughly 10 builds per hour. Batch edits into one push. Going over the limit
makes every later build fail with a bare "Page build failed" and no explanation.
