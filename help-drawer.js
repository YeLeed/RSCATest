// Left-hand "what to ask Fin" panel in the Trax demo-guide style. Include after app.js on both pages.
(function () {
  var rsca = window.rscaDemo;
  if (!rsca) return;

  var VISITOR_GROUPS = [
    { title: '1 · Answers from rsca.be content', note: 'Resolved from the imported FAQ pages, no handoff.', prompts: [
      { key: 1, text: 'Where can I find my tickets in the app?', watch: 'Profile, then Tickets; open once so it works offline; no PDF tickets.' },
      { key: 2, text: 'What is a Mauve ID and why do I need one to buy tickets?', watch: 'Every ticket is assigned to a person, verified via itsme or Onfido; friends need their own account.' },
      { key: 3, text: 'How do I get to Lotto Park by metro?', watch: 'Metro line 5 to Saint-Guidon, a 5-minute walk; parking at CERIA-COOVI or Westland.' } ] },
    { title: '2 · Same content, the fan\'s language', note: 'French and Dutch questions are answered in that language.', prompts: [
      { key: 4, text: 'Je suis abonné mais je ne peux pas venir dimanche. Comment donner ma place à un ami ?', watch: 'In French: ticketing.rsca.be, Mon compte, Abonnements, Partager ma place; the price stays €0.' },
      { key: 5, text: 'Wanneer is de fanshop open op een wedstrijddag?', watch: 'In Dutch: from 3 hours before until 15 minutes before kick-off, and 1 hour after.' } ] },
    { title: '3 · Nothing covers it, so Fin hands over', note: 'Fin asks what it needs, summarises and opens a Salesforce case.', prompts: [
      { key: 6, text: 'The name on my son\'s ticket is spelled wrong and the match is this weekend. Can you fix it?', watch: 'No invented fix. Fin collects the details and hands over. Show the case in the Inbox or Salesforce.' } ] }
  ];

  var FANS = [
    { persona: 'thomas', account: 'Red alert: €62 paid for Club Brugge, no tickets issued (order 2611-48377).', lookup: 'Payment captured, tickets not issued.', outcome: 'Hands over to the ticketing team as a Salesforce case', kind: 'handoff', groups: [
      { title: '4 · Paid but no tickets', note: 'The procedure: money taken? Mauve ID and transaction? Lookup, then hand over with a summary.', prompts: [
        { key: 7, text: 'I paid for two tickets for the Club Brugge match but they are not in my app.', watch: 'Fin first asks whether the money was actually taken.',
          then: ['Yes, €62 left my account this morning.', 'Mauve ID 1052377, transaction number 2611-48377.', 'I don\'t have a screenshot to hand, can you go ahead without it?'] } ] },
      { title: '5 · Guardrail: someone else\'s order', note: 'Thomas quotes Sophie\'s transaction. The buyer does not match, so Fin shares nothing.', prompts: [
        { text: 'Can you check what happened with transaction 2611-48213? The tickets are missing.', watch: 'No seats or names. Fin says the order belongs to another account and hands over.',
          then: ['Yes, the money was taken.', 'Mauve ID 1052377, transaction 2611-48213.'] } ] } ] },
    { persona: 'sophie', account: 'Two seats for Club Brugge; seat 23 is marked "In Lucas\'s app".', lookup: 'Order completed. Seat 23 is assigned to Lucas Peeters, Mauve ID 1093377.', outcome: 'Resolved by Fin, no handoff', kind: 'resolved', groups: [
      { title: '6 · Only one of two tickets visible', note: 'Same procedure, but the lookup explains it, so Fin resolves.', prompts: [
        { key: 8, text: 'I bought two tickets for Club Brugge but I only see one in my app.', watch: 'Fin asks about the payment and the IDs, then: seat 22 is hers, seat 23 only shows in Lucas\'s app.',
          then: ['Yes, €74 was taken.', 'Mauve ID 1048213, transaction 2611-48213.'] } ] } ] },
    { persona: 'emma', account: 'Amber alert: order 2611-48455 did not complete, €37 showing on her card.', lookup: 'Authorisation released, payment not captured.', outcome: 'Resolved by Fin: no money taken, the hold clears in 3 to 5 working days', kind: 'resolved', groups: [
      { title: '7 · Card charged but the purchase failed', note: 'The lookup shows a bank hold only; Fin explains it and invites her to buy again.', prompts: [
        { key: 9, text: 'My card was charged €37 but the purchase failed and I have no tickets.', watch: 'Fin explains the hold (3 to 5 working days) and that no tickets were issued.',
          then: ['It shows as pending on my card.', 'Mauve ID 1061455, transaction 2611-48455.'] } ] } ] }
  ];

  var CSS = '\
.rsca-help{position:fixed;top:0;left:0;bottom:0;width:320px;background:#1e2a2e;color:#e8ecee;z-index:150;display:flex;flex-direction:column;font-family:var(--font);transform:translateX(-100%);transition:transform .25s cubic-bezier(.2,.7,.2,1);border-right:3px solid #f0b541;box-shadow:2px 0 12px rgba(0,0,0,.25)}\
body.rsca-help-open .rsca-help{transform:none}\
body.rsca-help-open{padding-left:320px}\
.rsca-help-head{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,.1)}\
.rsca-help-head h2{margin:0;font-size:17px;font-weight:600;display:flex;align-items:center;gap:10px}\
.rsca-help-head h2:before{content:"";width:8px;height:8px;border-radius:50%;background:#f0b541;box-shadow:0 0 0 4px rgba(240,181,65,.22)}\
.rsca-help-close{background:none;border:0;color:#9aa5aa;font-size:22px;line-height:1;cursor:pointer;padding:0 2px}\
.rsca-help-close:hover{color:#fff}\
.rsca-help-body{flex:1;overflow-y:auto;padding:16px 16px 8px}\
.rsca-help-section{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9aa5aa;font-weight:600;margin:4px 0 12px;display:flex;align-items:center;gap:10px}\
.rsca-help-section:after{content:"";flex:1;height:1px;background:rgba(255,255,255,.12)}\
.rsca-help-fan{display:flex;gap:10px;align-items:flex-start;background:#26343a;border:1px solid rgba(240,181,65,.3);border-left:3px solid #f0b541;border-radius:10px;padding:10px 12px 11px 11px;margin:0 0 12px}\
.rsca-help-fan.on{border-color:rgba(79,207,122,.45);border-left-color:#4fcf7a}\
.rsca-help-fan .av{width:32px;height:32px;border-radius:50%;background:#f0b541;color:#1e2a2e;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;flex:none;margin-top:1px}\
.rsca-help-fan .av.vis{background:rgba(255,255,255,.14);color:#e8ecee}\
.rsca-help-fan .av svg{width:16px;height:16px}\
.rsca-help-fan .fb{flex:1;min-width:0}\
.rsca-help-fan .nm{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:14px;font-weight:600;color:#fff;line-height:1.3}\
.rsca-help-fan .sub{font-size:11.5px;color:#b7c0c4;margin:1px 0 7px}\
.rsca-help-fan .kv{display:grid;grid-template-columns:56px 1fr;gap:3px 8px;font-size:11.5px;line-height:1.4;color:#e8ecee}\
.rsca-help-fan .kv b{color:#f0b541;font-weight:600;text-transform:uppercase;font-size:9.5px;letter-spacing:.07em;padding-top:2px}\
.rsca-help-fan .oc{color:#f0b541;font-weight:500}\
.rsca-help-fan .oc.resolved{color:#4fcf7a}\
.rsca-help-fan .si{flex:none;font:600 10.5px var(--font);letter-spacing:.04em;text-transform:uppercase;color:#1e2a2e;background:#f0b541;border:0;border-radius:999px;padding:3px 9px;cursor:pointer;white-space:nowrap}\
.rsca-help-fan .si:hover{background:#f6c868}\
.rsca-help-fan .si.lo{background:rgba(255,138,154,.14);border:1px solid rgba(255,138,154,.5);color:#ffb3bd;text-transform:none;letter-spacing:0}\
.rsca-help-fan .si.lo:hover{background:rgba(255,138,154,.3);color:#fff}\
.rsca-help-fan .st{flex:none;font-size:10.5px;font-weight:600;color:#4fcf7a;white-space:nowrap}\
.rsca-help-group{margin-bottom:22px}\
.rsca-help-group h3{margin:0 0 4px;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:#f0b541;font-weight:600}\
.rsca-help-group p{margin:0 0 10px;font-size:12.5px;color:#b7c0c4;line-height:1.45}\
.rsca-help-card{display:flex;flex-wrap:wrap;align-items:flex-start;gap:6px;background:#26343a;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:11px 8px 11px 12px;margin-bottom:8px;transition:background .15s,border-color .15s}\
.rsca-help-card:hover{background:#2d3d44;border-color:rgba(240,181,65,.55)}\
.rsca-help-card.active{border-color:#f0b541;box-shadow:inset 3px 0 0 #f0b541}\
.rsca-help-card button{background:none;border:0;color:inherit;font:inherit;cursor:pointer;text-align:left;padding:0}\
.rsca-help-send{flex:1;display:flex;flex-direction:column;gap:6px}\
.rsca-help-send .p{font-size:14px;line-height:1.38;color:#fff}\
.rsca-help-send .w{font-size:12px;line-height:1.4;color:#b7c0c4}\
.rsca-help-send .w b{color:#f0b541;font-weight:600}\
.rsca-help-send .row{display:flex;align-items:center;gap:8px}\
.rsca-help-send .k{font-size:10.5px;color:#cfd6d9;background:rgba(255,255,255,.1);border-radius:5px;padding:1px 6px;font-variant-numeric:tabular-nums}\
.rsca-help-send .lock{font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:#1e2a2e;background:#f0b541;border-radius:999px;padding:3px 9px;white-space:nowrap;font-weight:600}\
.rsca-help-then{flex-basis:100%;display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding-top:2px}\
.rsca-help-then .l{font-size:11.5px;color:#f0b541;font-weight:600}\
.rsca-help-then button{font-size:12px;line-height:1.3;color:#fff;background:rgba(240,181,65,.14);border:1px solid rgba(240,181,65,.5);border-radius:999px;padding:3px 9px;cursor:pointer}\
.rsca-help-then button:hover{background:rgba(240,181,65,.3)}\
.rsca-help-then button.done{opacity:.5}\
.rsca-help-then.locked button{opacity:.45;border-style:dashed}\
.rsca-help-copy{color:#9aa5aa;padding:3px 6px;border-radius:6px;font-size:13px}\
.rsca-help-copy:hover{background:rgba(255,255,255,.1);color:#fff}\
.rsca-help-foot{padding:14px 20px;border-top:1px solid rgba(255,255,255,.1);font-size:12.5px;color:#b7c0c4;display:flex;flex-direction:column;gap:8px}\
.rsca-help-foot strong{color:#fff;font-weight:600}\
.rsca-help-foot .who{display:flex;align-items:center;gap:7px;color:#fff}\
.rsca-help-foot .who .dot{width:8px;height:8px;border-radius:50%;background:#8a8a8a;flex:none}\
.rsca-help-foot .who.ok .dot{background:#4fcf7a;box-shadow:0 0 0 3px rgba(79,207,122,.25)}\
.rsca-help-foot .who.warn .dot{background:#f0b541}\
.rsca-help-foot .who.bad .dot{background:#ff5a73;box-shadow:0 0 0 3px rgba(255,90,115,.25)}\
.rsca-help-foot .why{font-size:12px;line-height:1.4}\
.rsca-help-foot .why.bad{color:#ff8a9a}\
.rsca-help-foot .hint{display:flex;gap:6px;flex-wrap:wrap}\
.rsca-help-foot .hint span{background:#26343a;border-radius:999px;padding:4px 10px;font-size:11.5px;color:#cfd6d9}\
.rsca-help-tab{position:fixed;top:120px;left:0;z-index:150;background:#1e2a2e;color:#fff;border:0;border-left:3px solid #f0b541;border-radius:0 999px 999px 0;padding:9px 14px 9px 12px;font:600 13px var(--font);cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.25)}\
.rsca-help-tab:hover{background:#26343a}\
body.rsca-help-open .rsca-help-tab{display:none}\
body.rsca-help-open .presenter-bar{left:336px}\
.rsca-help-toast{position:fixed;left:50%;bottom:76px;transform:translateX(-50%);background:#1e2a2e;color:#fff;padding:10px 16px;border-radius:999px;font:13px var(--font);z-index:300;opacity:0;transition:opacity .2s;pointer-events:none;max-width:90vw;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.3)}\
.rsca-help-toast.show{opacity:1}\
.rsca-help-toast.bad{background:#7a1f2e}\
@media (max-width:1100px){body.rsca-help-open{padding-left:0}}\
@media (prefers-reduced-motion:reduce){.rsca-help,.rsca-help-card{transition:none}}';

  var USER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';

  var current = rsca.currentPersona();
  var signedIn = !!current;
  var flat = [], follows = [], keyMap = {};
  var lastAsked = null, nextFollow = 0;
  var esc = rsca.esc;

  function firstName(key) { return rsca.PERSONAS[key].name.split(' ')[0]; }
  function needsSwitch(persona) { return persona !== 'any' && current !== persona; }

  var toastEl, toastTimer;
  function toast(msg, bad) {
    toastEl.textContent = msg;
    toastEl.className = 'rsca-help-toast show' + (bad ? ' bad' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, bad ? 5000 : 2800);
  }

  function remember() { try { sessionStorage.setItem('rsca_last_asked', JSON.stringify([lastAsked, nextFollow])); } catch (e) {} }
  // Sign-in and New conversation reload the page, so the list scrolls back to the top unless the card is brought back.
  function reveal(i) {
    var body = document.querySelector('.rsca-help-body'), c = document.querySelector('.rsca-help-card[data-i="' + i + '"]');
    if (!body || !c) return;
    var b = body.getBoundingClientRect(), r = c.getBoundingClientRect();
    if (r.top < b.top || r.bottom > b.bottom) body.scrollTop += r.top - b.top - 48;
  }
  function markAsked(i) {
    lastAsked = i; nextFollow = 0;
    remember();
    document.querySelectorAll('.rsca-help-card').forEach(function (c) { c.classList.toggle('active', +c.dataset.i === i); });
    document.querySelectorAll('.rsca-help-then button').forEach(function (b) { b.classList.remove('done'); });
    reveal(i);
  }

  function send(item, i) {
    if (needsSwitch(item.persona)) {
      localStorage.setItem('rsca_pending_prompt', item.text);
      toast('Signing in as ' + firstName(item.persona) + '. The question is asked once My RSCA opens.');
      rsca.signIn(item.persona);
      return;
    }
    markAsked(i);
    toast('Question prefilled in a new conversation. Press send.');
    rsca.say(item.text, function (ok) {
      if (!ok) toast('The Messenger did not take the question. Click New conversation on the presenter bar and try again.', true);
    });
  }

  // Follow-ups go into the conversation that is already open; starting a new one would lose Fin's context.
  function followUp(f, btn) {
    if (needsSwitch(f.persona)) {
      var k = flat[f.card].key;
      toast('This is a reply to Fin. Sign in as ' + firstName(f.persona) + ' and ask ' + (k ? '⌥' + k : 'its question') + ' first.', true);
      return;
    }
    rsca.reply(f.text, function (ok) {
      if (ok) {
        toast('Reply typed into the conversation. Press send.');
        if (btn) btn.classList.add('done');
        lastAsked = f.card; nextFollow = f.n + 1; remember();
      } else {
        copy(f.text, 'No open conversation to type into. Copied instead: click the Messenger composer and paste.');
      }
    });
  }

  function copy(text, okMsg) {
    var done = function () { toast(okMsg || 'Copied to clipboard'); };
    var fail = function () {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      if (ok) done(); else toast('Could not copy. Select the text in the card and press ⌘C.', true);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail); else fail();
  }

  function setOpen(open) {
    document.body.classList.toggle('rsca-help-open', open);
    localStorage.setItem('rsca_help_closed', open ? '0' : '1');
  }

  function cardHtml(p, persona) {
    var i = flat.length;
    flat.push({ text: p.text, persona: persona, follows: [], key: p.key });
    if (p.key) keyMap[p.key] = i;
    var locked = needsSwitch(persona);
    var title = locked ? 'Sign in as ' + esc(firstName(persona)) + ' and ask this' : 'Ask Fin in a new conversation' + (p.key ? ' (⌥' + p.key + ')' : '');
    var html = '<div class="rsca-help-card" data-i="' + i + '"><button class="rsca-help-send" data-i="' + i + '" title="' + title + '">' +
      '<span class="p">' + esc(p.text) + '</span>' +
      '<span class="w"><b>Watch:</b> ' + esc(p.watch) + '</span>' +
      (p.key || locked ? '<span class="row">' + (p.key ? '<span class="k">⌥' + p.key + '</span>' : '') +
        (locked ? '<span class="lock">Sign in as ' + esc(firstName(persona)) + '</span>' : '') + '</span>' : '') + '</button>' +
      '<button class="rsca-help-copy" data-i="' + i + '" title="Copy the question">&#x2398;</button>';
    if (p.then) {
      html += '<span class="rsca-help-then' + (locked ? ' locked' : '') + '"><span class="l">Then say:</span>' + p.then.map(function (t, n) {
        follows.push({ text: t, persona: persona, card: i, n: n });
        flat[i].follows.push(follows.length - 1);
        return '<button data-f="' + (follows.length - 1) + '" title="Types this reply into the open conversation · ⇧click copies it">' + esc(t) + '</button>';
      }).join('') + '</span>';
    }
    return html + '</div>';
  }
  function groupHtml(g, persona) {
    return '<div class="rsca-help-group"><h3>' + esc(g.title) + '</h3><p>' + esc(g.note) + '</p>' +
      g.prompts.map(function (p) { return cardHtml(p, persona); }).join('') + '</div>';
  }
  function visitorHtml() {
    return '<div class="rsca-help-fan' + (signedIn ? '' : ' on') + '"><span class="av vis">' + USER_ICON + '</span><div class="fb">' +
      '<div class="nm"><span>Visitor</span>' + (signedIn
        ? '<button class="si lo" type="button" title="You are signed in as ' + esc(rsca.PERSONAS[current].name) + '; Fin knows you on every page">Log out to run as a visitor</button>'
        : '<span class="st">● current</span>') + '</div>' +
      '<div class="sub">Not logged in · the FAQ page on rsca.be</div>' +
      '<div class="kv"><b>Fin sees</b><span>An anonymous fan: no profile, no order lookup.</span>' +
      '<b>Answers</b><span>The FAQ pages imported from rsca.be, in Dutch, French and English.</span>' +
      '<b>Outcome</b><span class="oc">Content answers, or a Salesforce case when nothing covers it</span></div></div></div>';
  }
  function fanHtml(f) {
    var p = rsca.PERSONAS[f.persona];
    var on = current === f.persona;
    return '<div class="rsca-help-fan' + (on ? ' on' : '') + '"><span class="av">' + esc(p.initials) + '</span><div class="fb">' +
      '<div class="nm"><span>' + esc(p.name) + '</span>' + (on
        ? '<span class="st">● signed in</span>'
        : '<button class="si" type="button" data-persona="' + f.persona + '" title="Open My RSCA as ' + esc(p.name) + '">Sign in as ' + esc(firstName(f.persona)) + '</button>') + '</div>' +
      '<div class="sub">Mauve ID ' + esc(p.mauve_id) + ' · ' + esc(p.membership.name) + '</div>' +
      '<div class="kv"><b>My RSCA</b><span>' + esc(f.account) + '</span>' +
      '<b>Lookup</b><span>' + esc(f.lookup) + '</span>' +
      '<b>Outcome</b><span class="oc ' + f.kind + '">' + esc(f.outcome) + '</span></div></div></div>';
  }

  function build() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var html = '<div class="rsca-help-head"><h2>Fin demo guide</h2><button class="rsca-help-close" aria-label="Close" title="Close (?)">&times;</button></div><div class="rsca-help-body">';
    html += '<div class="rsca-help-section">Visitor · rsca.be</div>' + visitorHtml();
    VISITOR_GROUPS.forEach(function (g) { html += groupHtml(g, 'any'); });
    html += '<div class="rsca-help-section">Signed-in fans · My RSCA</div>';
    FANS.forEach(function (f) {
      html += fanHtml(f);
      f.groups.forEach(function (g) { html += groupHtml(g, f.persona); });
    });
    html += '</div><div class="rsca-help-foot"><div><strong>Fin for RSC Anderlecht</strong> · ' + esc(rsca.APP_ID) + ' (EU)</div>' +
      '<div class="who"><span class="dot"></span><span class="who-text">checking identity…</span></div><div class="why"></div>' +
      '<div class="hint"><span>⌥ 1–9 ask</span><span>⌥ 0 next reply</span><span>⇧ click copies</span><span>? guide</span><span>h bar</span></div></div>';

    var panel = document.createElement('aside');
    panel.className = 'rsca-help';
    panel.innerHTML = html;
    document.body.appendChild(panel);

    var who = panel.querySelector('.who'), why = panel.querySelector('.why');
    rsca.identityStatus(function (st) {
      who.className = 'who ' + st.level;
      who.querySelector('.who-text').textContent = st.who;
      why.className = 'why ' + (st.level === 'bad' ? 'bad' : '');
      why.textContent = st.detail;
    });

    var tab = document.createElement('button');
    tab.className = 'rsca-help-tab';
    tab.innerHTML = '&#9776;&nbsp; Demo guide';
    document.body.appendChild(tab);

    toastEl = document.createElement('div');
    toastEl.className = 'rsca-help-toast';
    document.body.appendChild(toastEl);

    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('rsca-help-close')) return setOpen(false);
      if (b.classList.contains('lo')) return rsca.signOut();
      if (b.classList.contains('si')) {
        toast('Signing in as ' + firstName(b.dataset.persona) + '. My RSCA opens with that account.');
        return rsca.signIn(b.dataset.persona);
      }
      if (b.dataset.f !== undefined) {
        var f = follows[+b.dataset.f];
        return e.shiftKey ? copy(f.text) : followUp(f, b);
      }
      var i = +b.dataset.i, item = flat[i];
      if (!item) return;
      if (b.classList.contains('rsca-help-copy')) copy(item.text); else send(item, i);
    });
    tab.addEventListener('click', function () { setOpen(true); });

    function onKey(e) {
      var t = e.target;
      var editing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
      if (e.altKey && /^Digit[0-9]$/.test(e.code)) {
        var digit = +e.code.slice(5);
        if (digit === 0) {
          e.preventDefault();
          var card = lastAsked === null ? null : flat[lastAsked];
          if (!card || !card.follows.length) return toast('No follow-ups for the last question. Ask ⌥7, ⌥8 or ⌥9 first.', true);
          var fi = card.follows[nextFollow];
          if (fi === undefined) return toast('All replies for this question have been used.', true);
          return followUp(follows[fi], panel.querySelector('[data-f="' + fi + '"]'));
        }
        var idx = keyMap[digit];
        if (idx !== undefined) { e.preventDefault(); send(flat[idx], idx); }
        return;
      }
      if (editing) return;
      if (e.key === '?') setOpen(!document.body.classList.contains('rsca-help-open'));
    }
    document.addEventListener('keydown', onKey);
    // The Messenger's composer lives in a same-origin iframe, so the ⌥ shortcuts need a listener there too once it exists.
    setInterval(function () {
      try {
        var f = document.querySelector('iframe[name="intercom-messenger-frame"]');
        var d = f && f.contentDocument;
        if (d && !d.__rscaKeys) { d.__rscaKeys = true; d.addEventListener('keydown', onKey, true); }
      } catch (err) {}
    }, 1000);

    setOpen(localStorage.getItem('rsca_help_closed') !== '1');
    var body = panel.querySelector('.rsca-help-body');
    try { body.scrollTop = +sessionStorage.getItem('rsca_help_scroll') || 0; } catch (e) {}
    body.addEventListener('scroll', function () { try { sessionStorage.setItem('rsca_help_scroll', body.scrollTop); } catch (e) {} });
    try {
      var saved = JSON.parse(sessionStorage.getItem('rsca_last_asked') || 'null');
      if (saved && flat[saved[0]]) {
        lastAsked = saved[0]; nextFollow = saved[1];
        document.querySelector('.rsca-help-card[data-i="' + lastAsked + '"]').classList.add('active');
        flat[lastAsked].follows.slice(0, nextFollow).forEach(function (fi) { panel.querySelector('[data-f="' + fi + '"]').classList.add('done'); });
        reveal(lastAsked);
      }
    } catch (e) {}

    var pending = localStorage.getItem('rsca_pending_prompt');
    if (pending && signedIn) {
      localStorage.removeItem('rsca_pending_prompt');
      var idx = -1;
      flat.forEach(function (it, i) { if (it.text === pending) idx = i; });
      if (idx >= 0) markAsked(idx);
      setTimeout(function () {
        toast('Asking Fin: ' + pending);
        rsca.say(pending, function (ok) {
          if (!ok) toast('The Messenger did not take the question. Press ' + (idx >= 0 && flat[idx].key ? '⌥' + flat[idx].key : 'the card') + ' again once it has loaded.', true);
        });
      }, 1500);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
