(function () {
  var APP_ID = 'tug5y300';
  var API_BASE = 'https://api-iam.eu.intercom.io';
  var MATCH = { home: 'RSC Anderlecht', away: 'Club Brugge', date: '2026-11-09T18:30', venue: 'Lotto Park', competition: 'Jupiler Pro League · Matchday 14' };

  // Personas match the mock order-lookup API Fin calls server-side (transaction number → response).
  var PERSONAS = {
    thomas: {
      key: 'thomas', user_id: '1052377', mauve_id: '1052377', email: 'thomas.dubois@example.be', name: 'Thomas Dubois', initials: 'TD', short: 'paid, no tickets',
      lang: 'fr', verified: 'itsme', since: 2019, membership: { tier: 'Mauve+', name: 'Mauve+ Silver', renews: '2027-07-01', benefits: ['Priority access to ticket sales', 'Mauve TV included', 'Member pricing for European matches'] },
      story: 'Paid €62 for Club Brugge tickets, nothing in the app',
      orders: [
        { txn: '2611-48377', at: '2026-11-04T12:15', match: 'RSC Anderlecht vs Club Brugge', match_date: '2026-11-09T18:30', amount: 62, status: 'failed', payment: 'captured', issue: 'payment_captured_tickets_not_issued', tickets: [] },
        { txn: '2610-31904', at: '2026-10-02T09:40', match: 'RSC Anderlecht vs KRC Genk', match_date: '2026-10-05T13:30', amount: 31, status: 'completed', payment: 'captured', tickets: [
          { seat: 'Tribune 2, Block 214, Row 8, Seat 5', mauve_id: '1052377', name: 'Thomas Dubois', in_app: true, used: true } ] }
      ],
      friends: []
    },
    sophie: {
      key: 'sophie', user_id: '1048213', mauve_id: '1048213', email: 'sophie.janssens@example.be', name: 'Sophie Janssens', initials: 'SJ', short: 'one of two tickets',
      lang: 'nl', verified: 'itsme', since: 2016, membership: { tier: 'Mauve+', name: 'Mauve+ Gold', renews: '2027-07-01', benefits: ['First priority on every ticket sale', 'Mauve TV included', 'Exclusive Gold events and Lotto Park tours'] },
      story: 'Bought two tickets, only one shows in her app',
      orders: [
        { txn: '2611-48213', at: '2026-11-03T19:42', match: 'RSC Anderlecht vs Club Brugge', match_date: '2026-11-09T18:30', amount: 74, status: 'completed', payment: 'captured', tickets: [
          { seat: 'Tribune 3, Block 312, Row 14, Seat 22', mauve_id: '1048213', name: 'Sophie Janssens', in_app: true },
          { seat: 'Tribune 3, Block 312, Row 14, Seat 23', mauve_id: '1093377', name: 'Lucas Peeters', in_app: false } ] }
      ],
      friends: [{ name: 'Lucas Peeters', mauve_id: '1093377', initials: 'LP' }]
    },
    emma: {
      key: 'emma', user_id: '1061455', mauve_id: '1061455', email: 'emma.claes@example.be', name: 'Emma Claes', initials: 'EC', short: 'payment hold',
      lang: 'en', verified: 'onfido', since: 2026, membership: { tier: 'Membership', name: 'Mauve TV', renews: '2027-09-14', benefits: ['Live friendlies, Futures and Women matches', 'Inside Neerpede and all documentaries', 'No ticket priority (upgrade to Mauve+)'] },
      story: 'Card shows €37 pending but the purchase failed',
      orders: [
        { txn: '2611-48455', at: '2026-11-04T15:20', match: 'RSC Anderlecht vs Club Brugge', match_date: '2026-11-09T18:30', amount: 37, status: 'cancelled', payment: 'authorisation_released', issue: 'payment_not_captured', tickets: [] }
      ],
      friends: []
    }
  };

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var BASE = { app_id: APP_ID, api_base: API_BASE, alignment: 'right', horizontal_padding: 24, vertical_padding: 24 };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function longDate(iso) { var p = iso.slice(0, 10).split('-'); return +p[2] + ' ' + MONTHS[+p[1] - 1] + ' ' + p[0]; }
  function timeOf(iso) { return iso.length > 10 ? iso.slice(11, 16) : ''; }
  function euro(n) { return '€' + Number(n).toFixed(2).replace('.00', '').replace('.', ','); }

  function settingsFor(key) {
    var s = {}; for (var k in BASE) s[k] = BASE[k];
    var p = key && PERSONAS[key];
    if (p) {
      s.user_id = p.user_id; s.email = p.email; s.name = p.name;
      s.mauve_id = p.mauve_id; s.membership = p.membership.name; s.identity_verified_via = p.verified; s.preferred_language = p.lang;
      // Fin only trusts profile attributes for verified users; persona_jwt.js holds the signed tokens.
      if (window.PERSONA_JWTS && window.PERSONA_JWTS[key]) s.intercom_user_jwt = window.PERSONA_JWTS[key];
    }
    return s;
  }
  function jwtSigned(key) { return !!(window.PERSONA_JWTS && window.PERSONA_JWTS[key]); }
  function currentPersona() { var k = localStorage.getItem('rsca_persona'); return (k && PERSONAS[k]) ? k : null; }
  function isAccount() { return /\/account\.html$/i.test(location.pathname); }
  function setIdentity(key) { localStorage.setItem('rsca_messenger_identity', key || 'visitor'); }
  function parsePersonaParam(search) {
    var m = /[?&]persona=([^&]+)/.exec(search || '');
    var key = m && decodeURIComponent(m[1]);
    return (key && PERSONAS[key]) ? key : null;
  }
  function cleanUrl() {
    var u = new URL(location.href);
    u.searchParams.delete('persona');
    // In test mode the Messenger only activates on URLs carrying intercomTest=true; harmless when live.
    u.searchParams.set('intercomTest', 'true');
    return u.toString();
  }
  function reloadClean() { location.replace(cleanUrl()); }

  // Intercom sets cookies with a Domain attribute on real hostnames; a host-only delete never matches them.
  function clearIntercomCookies() {
    var parts = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n.indexOf('intercom-') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }
  function clearMessengerStorage() {
    [localStorage, sessionStorage].forEach(function (store) {
      Object.keys(store).forEach(function (k) { if (k.indexOf('intercom.') === 0) store.removeItem(k); });
    });
  }
  // Storage is cleared on the next load, not here: the Messenger re-saves its screen and drafts while this page unloads.
  function endSession() {
    if (window.Intercom) window.Intercom('shutdown');
    clearIntercomCookies();
    localStorage.setItem('rsca_reset_messenger', '1');
  }
  // One identity for the whole site, applied by the page load that follows: header, presenter bar and Fin always agree.
  function signIn(key) {
    if (!PERSONAS[key]) return;
    endSession();
    localStorage.setItem('rsca_persona', key);
    setIdentity(key);
    location.href = 'account.html?intercomTest=true';
  }
  function signOut() {
    endSession();
    ['rsca_persona', 'rsca_pending_prompt'].forEach(function (k) { localStorage.removeItem(k); });
    setIdentity(null);
    location.href = 'index.html?intercomTest=true';
  }
  function newConversation() {
    endSession();
    reloadClean();
  }

  function composer() {
    try {
      var f = document.querySelector('iframe[name="intercom-messenger-frame"]');
      return (f && f.contentDocument && f.contentDocument.querySelector('[contenteditable="true"]')) || null;
    } catch (e) { return null; }
  }
  function composerHas(text) { var el = composer(); return !!el && el.textContent.indexOf(text) >= 0; }
  // The composer is a Lexical editor: it only picks up a programmatic selection on the next
  // selectionchange event, so the edit that relies on it has to wait a tick.
  function replaceComposer(el, text, cb) {
    var doc = el.ownerDocument;
    el.focus();
    doc.execCommand('selectAll', false, null);
    setTimeout(function () {
      if (text) doc.execCommand('insertText', false, text); else doc.execCommand('delete', false, null);
      setTimeout(cb, 250);
    }, 120);
  }

  // Starts a NEW conversation. showNewMessage is dropped while the Messenger boots and ignored over a draft, hence clear + retry.
  function say(text, cb) {
    var retries = 0;
    function fire() {
      if (window.Intercom) window.Intercom('showNewMessage', text);
      var polls = 0;
      (function poll() {
        if (composerHas(text)) return cb && cb(true);
        if (++polls < 8) return setTimeout(poll, 200);
        if (++retries < 6) return prepare();
        if (cb) cb(false);
      })();
    }
    function prepare() {
      var el = composer();
      if (el && el.textContent.trim() && !composerHas(text)) replaceComposer(el, '', fire); else fire();
    }
    prepare();
  }
  // Types a follow-up into the OPEN conversation (showNewMessage would start a new one); false when there is no composer.
  function reply(text, cb) {
    var el = composer();
    if (!el) return cb && cb(false);
    replaceComposer(el, text, function () {
      if (window.Intercom) window.Intercom('show');
      if (cb) cb(composerHas(text));
    });
  }
  function show() { if (window.Intercom) window.Intercom('show'); }

  // The Messenger shows a blank panel when it rejects a signed-in user (user traffic off, bad JWT); the ping says why.
  var identityResult = null, identityWaiters = [];
  function identityStatus(cb) {
    var key = currentPersona();
    if (!key) return cb({ level: 'visitor', who: 'Visitor · logged out', detail: 'Fin sees an anonymous visitor. Sign in to run the My RSCA prompts.' });
    var p = PERSONAS[key];
    var who = p.name + ' · logged in';
    if (!jwtSigned(key)) return cb({ level: 'warn', who: who, detail: 'Identity JWT unsigned: Fin will not trust this profile or call the order lookup. Ask Intercom for a fresh persona_jwt.js.' });
    if (identityResult) return cb(identityResult);
    identityWaiters.push(cb);
    if (identityWaiters.length > 1) return;
    var s = window.intercomSettings || {};
    var fd = new URLSearchParams();
    fd.append('app_id', s.app_id);
    fd.append('referer', location.href);
    fd.append('user_data', JSON.stringify({ user_id: s.user_id, email: s.email }));
    fd.append('intercom_user_jwt', s.intercom_user_jwt);
    fetch(s.api_base + '/messenger/web/ping', { method: 'POST', body: fd }).then(function (r) {
      if (r.status === 403) return { level: 'bad', who: who, detail: 'Identity rejected (403): the Messenger refuses signed-in users. Turn on "Enable user traffic" under Settings, Fin Messenger, Security and reload. If it still fails, re-check the Web identity verification secret.' };
      if (r.ok) return { level: 'ok', who: who, detail: 'Identity JWT accepted: Fin knows this fan and can call the order lookup.' };
      return { level: 'warn', who: who, detail: 'The Messenger ping answered ' + r.status + '. Reload and check the drawer footer again.' };
    }).catch(function () {
      return { level: 'warn', who: who, detail: 'Could not reach the Messenger API to check the identity.' };
    }).then(function (res) {
      identityResult = res;
      identityWaiters.splice(0).forEach(function (f) { f(res); });
    });
  }

  function buildPresenterBar() {
    var key = currentPersona();
    var bar = document.createElement('div');
    bar.className = 'presenter-bar';
    bar.id = 'presenter-bar';
    bar.innerHTML = '<span class="pb-label">Presenter</span>' +
      '<select id="presenter-persona" title="Who the whole site, and Fin, treat you as">' +
        '<option value="">Visitor · logged out</option>' +
        Object.keys(PERSONAS).map(function (k) { var p = PERSONAS[k]; return '<option value="' + k + '">' + esc(p.name) + ' · ' + esc(p.short) + '</option>'; }).join('') +
      '</select>' +
      '<span class="pb-status" id="pb-status"><span class="dot"></span><span class="pb-text">checking identity…</span></span>' +
      (key ? '<button id="presenter-logout" type="button">Log out</button>' : '') +
      '<button id="presenter-new-conv" type="button" title="Forget the Messenger session and reload as the same identity">New conversation</button>' +
      '<button id="presenter-hide-messenger" type="button">Hide Messenger</button>' +
      '<span class="kbd">h hides</span>';
    document.body.appendChild(bar);

    var select = bar.querySelector('#presenter-persona');
    select.value = key || '';
    select.addEventListener('change', function (e) { if (e.target.value) signIn(e.target.value); else signOut(); });
    var logout = bar.querySelector('#presenter-logout');
    if (logout) logout.addEventListener('click', signOut);
    bar.querySelector('#presenter-new-conv').addEventListener('click', newConversation);
    bar.querySelector('#presenter-hide-messenger').addEventListener('click', function () { if (window.Intercom) window.Intercom('hide'); });
    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (e.key === 'h' && !e.metaKey && !e.ctrlKey && !e.altKey) bar.classList.toggle('hidden');
    });

    var status = bar.querySelector('#pb-status');
    var LABEL = { visitor: 'anonymous to Fin', ok: 'identity verified', warn: 'JWT unsigned', bad: 'identity rejected' };
    identityStatus(function (st) {
      status.className = 'pb-status ' + st.level;
      status.title = st.detail;
      status.querySelector('.pb-text').textContent = LABEL[st.level] || st.level;
    });
  }

  window.rscaDemo = { APP_ID: APP_ID, MATCH: MATCH, PERSONAS: PERSONAS, settingsFor: settingsFor, jwtSigned: jwtSigned, currentPersona: currentPersona,
    isAccount: isAccount, signIn: signIn, signOut: signOut, newConversation: newConversation, say: say, reply: reply, show: show, composer: composer,
    identityStatus: identityStatus, clearIntercomCookies: clearIntercomCookies, reloadClean: reloadClean, parsePersonaParam: parsePersonaParam,
    esc: esc, longDate: longDate, timeOf: timeOf, euro: euro };

  if (!/[?&]intercomTest=true\b/.test(location.search)) history.replaceState(null, '', cleanUrl());

  var urlPersona = parsePersonaParam(location.search);
  if (urlPersona) { localStorage.setItem('rsca_persona', urlPersona); history.replaceState(null, '', cleanUrl()); }

  var bootPersona = currentPersona();
  if (isAccount() && !bootPersona) { location.replace('index.html?intercomTest=true'); return; }
  var identityChanged = localStorage.getItem('rsca_messenger_identity') !== (bootPersona || 'visitor');
  if (identityChanged) clearIntercomCookies();
  if (identityChanged || localStorage.getItem('rsca_reset_messenger')) {
    localStorage.removeItem('rsca_reset_messenger');
    clearMessengerStorage();
  }
  setIdentity(bootPersona);
  window.intercomSettings = settingsFor(bootPersona);
  (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/'+APP_ID;var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else{w.addEventListener('load',l,false);}}})();

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildPresenterBar); else buildPresenterBar();
})();
