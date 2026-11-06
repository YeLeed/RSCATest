RSC Anderlecht demo site for the Fin evaluation. Static files only, nothing to build or install. RSCA hosts this folder on its own infrastructure; Intercom does not host it.

## Hosting on GitHub Pages (RSCA's GitHub)

1. Create a new **private** repository in the RSC Anderlecht GitHub organisation (any name; an unguessable one is better, see the visibility note below).
2. Copy the contents of this folder to the repository root, so `index.html`, `account.html`, `persona_jwt.js`, the `assets` folder and `.nojekyll` sit at the top level. Commit to `main`.
3. In the repository: Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)` → Save.
4. Wait one to two minutes. The site is at `https://<org>.github.io/<repo>/`. Open it; the demo guide on the left lists the questions to try, in demo order, with what to watch for in each answer. Press `?` to hide or show the guide and `h` to hide the presenter bar at the bottom.
5. Two pages. `index.html` is the public FAQ page: a visitor who is not logged in. `account.html` is **My RSCA**: a signed-in fan. Sign in from the **Login** button, from the presenter bar, or by clicking a question in the guide marked "Sign in as …", which signs in as that fan, opens My RSCA and asks the question for you. Three demo fans: Thomas Dubois (paid €62 for Club Brugge, no tickets in his app), Sophie Janssens (bought two tickets, sees one), Emma Claes (€37 pending on her card after a failed purchase). Each fan's card in the guide says what My RSCA shows them, what Fin's order lookup returns and how the conversation ends. **Log out** returns to the FAQ page as a visitor. Every switch reloads the page, which is how a real site behaves on login.

Visibility: a GitHub Pages site is reachable by anyone with the URL, even from a private repository, unless the organisation is on GitHub Enterprise Cloud and the site is set to **Private** under Settings → Pages → Visibility. Use that setting if available. The files contain no passwords or API secrets, but `persona_jwt.js` holds signed identity tokens for the three demo fans (valid until 5 November 2027): anyone who finds the URL can open the Messenger as one of them and create conversations in the evaluation workspace. Delete the repository or disable Pages when the evaluation ends.

Other static hosts work the same way (an internal nginx `root`, an S3 or blob static site, or `python3 -m http.server 8790` on a laptop). All paths are relative, so the site works at the domain root or under a sub-path.

## What the page calls out to

- The Intercom Messenger script from `https://widget.intercom.io/widget/tug5y300` and the EU Messenger API at `https://api-iam.eu.intercom.io` (workspace tug5y300, hosted in the EU).
- Google Fonts (Inter). The crest and wordmark are local files in `assets/`.
- The FAQ section links on the first page point to the real `www.rsca.be` FAQ pages; nothing is loaded from there.

Nothing else. The order data Fin quotes comes from a mock order-lookup API that Fin calls server-side; the page never talks to it, so there is nothing to allow-list on the RSCA side.

## Caveats for the hosted copy

- The pages add `?intercomTest=true` to their own URLs. That is harmless and can be ignored.
- Signed-in fans are identified by the tokens in `persona_jwt.js`. Without that file the pages still work, but Fin treats the fan as unverified: it does not use the profile and does not run the order lookup. Fresh tokens after 5 November 2027 have to come from Intercom; they are signed with a secret that stays with the workspace.
- Fin's content (the imported rsca.be FAQ pages), the missing-tickets procedure, the order-lookup connector, the guidance rules and the hand-off live in the tug5y300 workspace, not in these files; the pages only open the Messenger with the right identity and pre-fill the questions.
- A hand-off creates a case in Intercom's demo Salesforce org, which RSCA cannot see. Fin asks the fan for an email address before it opens the case, so have one ready. There is no live-agent hand-off in this demo.
- The test data is fixed: the next match is RSC Anderlecht vs Club Brugge on 9 November 2026 at Lotto Park, and the three orders (2611-48377 payment captured but tickets not issued, 2611-48213 completed with seat 23 assigned to Lucas Peeters, 2611-48455 authorisation released, nothing charged) are anchored to early November 2026 and will read as stale over time.
- The guide's shortcuts (`⌥1`–`⌥9` ask a question in a new conversation, `⌥0` types the next reply into the open one, `⇧click` on a reply copies it) are for the presenter. Nothing is sent until you press send in the Messenger.
