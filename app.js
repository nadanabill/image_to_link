/* Image to Link — upload images to your own GitHub repo and get a direct
 * GitHub Pages link. Runs entirely in the browser; no server. */
(() => {
  'use strict';

  const API = 'https://api.github.com';
  const MAX_BYTES = 1000 * 1000;      // FCM notification image limit is 1 MB
  const MAX_DIM = 2048;               // longest side when re-encoding
  const IMG_DIR = 'images';
  const STORE = 'img2link.v1';

  // ---------------------------------------------------------------- i18n
  const T = {
    ar: {
      title: 'صورة ← لينك',
      logout: 'خروج',
      setupTitle: 'الإعداد لأول مرة',
      setupIntro: 'الصور هتترفع على حساب GitHub بتاعك إنت، في repo عام. مفيش أي سيرفر في النص، والـ token بيتحفظ في المتصفح ده بس.',
      step1: 'اختار اسم للـ repo (هيتعمل لوحده لو مش موجود):',
      step2: 'اعمل token من GitHub:',
      classicBtn: 'الطريقة السريعة (Classic token) ↗',
      fineSummary: 'الطريقة الأكثر أمانًا (Fine-grained token)',
      fineSteps:
        '<li>اعمل الـ repo الأول: <a id="newRepoLink" target="_blank" rel="noopener">github.com/new</a> (خليه Public).</li>' +
        '<li>افتح <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">صفحة الـ Fine-grained token</a>.</li>' +
        '<li>في Repository access اختار <b>Only select repositories</b> واختار الـ repo ده بس.</li>' +
        '<li>في Permissions اختار: <code>Contents</code> = Read and write، <code>Pages</code> = Read and write، <code>Administration</code> = Read and write.</li>' +
        '<li>اعمل Generate وانسخ الـ token.</li>',
      step3: 'الصق الـ token هنا:',
      connect: 'اتصال وتجهيز',
      connectedAs: 'متصل بـ',
      pagesWarn: 'GitHub Pages مش مفعّل على الـ repo، فاللينكات مش هتشتغل. فعّله من الإعدادات: Source = Deploy from a branch، Branch = main و /(root).',
      openSettings: 'فتح الإعدادات ↗',
      recheck: 'فعّلته، اتأكد تاني',
      dropText: 'اختار صورة، أو اسحبها هنا، أو الصقها (Ctrl+V)',
      dropHint: 'لو أكبر من 1 ميجا هتتضغط تلقائيًا عشان تشتغل في إشعارات Firebase',
      nameLabel: 'اسم الملف (اختياري)',
      upload: 'رفع',
      cancel: 'إلغاء',
      copy: 'نسخ',
      copied: 'اتنسخ ✓',
      waitingLive: '⏳ GitHub بينشر الصورة... اللينك هيشتغل خلال دقيقة تقريبًا',
      live: '✅ اللينك شغال وجاهز تحطه في الإشعار',
      liveTimeout: '⚠️ النشر أخد وقت أطول من العادي. جرّب تفتح اللينك بعد شوية.',
      myImages: 'صوري',
      refresh: 'تحديث',
      noImages: 'مفيش صور لسه.',
      footer: 'مفتوح المصدر — صورك على حسابك إنت.',
      del: 'حذف',
      confirmDel: 'تحذف الصورة دي؟ أي إشعار بيستخدم اللينك ده الصورة مش هتظهر فيه.',
      deleted: 'اتحذفت',
      confirmLogout: 'هتمسح الـ token من المتصفح ده. الصور هتفضل على GitHub. تكمل؟',
      // progress / errors
      pChecking: 'بتأكد من الـ token...',
      pHello: 'أهلًا {login}',
      pRepoFound: 'الـ repo موجود: {repo}',
      pRepoCreating: 'بعمل الـ repo: {repo}...',
      pRepoInit: 'بجهّز الـ repo...',
      pPages: 'بفعّل GitHub Pages...',
      pPagesOk: 'GitHub Pages شغال',
      pPagesFail: 'معرفتش أفعّل Pages تلقائيًا، هتحتاج تفعّله يدوي (هيظهرلك زرار).',
      pDone: 'تمام! جاهز للرفع.',
      eToken: 'الـ token غلط أو منتهي.',
      eNoToken: 'الصق الـ token الأول.',
      eRepoName: 'اسم الـ repo مينفعش فيه غير حروف إنجليزي وأرقام و - و _ و .',
      eCreate: 'معرفتش أعمل الـ repo. لو بتستخدم Fine-grained token اعمل الـ repo بنفسك الأول.',
      ePrivate: 'الـ repo ده Private. لازم يكون Public عشان اللينكات تشتغل مجانًا.',
      eNotImage: 'الملف ده مش صورة.',
      eDecode: 'المتصفح مش قادر يقرا الصورة دي. جرّب JPG أو PNG.',
      eTooBig: 'معرفتش أضغط الصورة تحت 1 ميجا.',
      sPreparing: 'بجهّز الصورة...',
      sCompressed: 'اتضغطت من {from} لـ {to}',
      sUploading: 'برفع...',
      sExists: 'فيه صورة بنفس الاسم، غيّر الاسم.',
      eGeneric: 'حصل خطأ: {msg}',
    },
    en: {
      title: 'Image → Link',
      logout: 'Sign out',
      setupTitle: 'First-time setup',
      setupIntro: 'Images are uploaded to YOUR GitHub account, in a public repo. There is no server in between, and your token is stored only in this browser.',
      step1: 'Pick a repo name (created automatically if missing):',
      step2: 'Create a GitHub token:',
      classicBtn: 'Quick way (Classic token) ↗',
      fineSummary: 'More secure way (Fine-grained token)',
      fineSteps:
        '<li>Create the repo first: <a id="newRepoLink" target="_blank" rel="noopener">github.com/new</a> (make it Public).</li>' +
        '<li>Open the <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Fine-grained token page</a>.</li>' +
        '<li>Under Repository access choose <b>Only select repositories</b> and pick just that repo.</li>' +
        '<li>Under Permissions set: <code>Contents</code> = Read and write, <code>Pages</code> = Read and write, <code>Administration</code> = Read and write.</li>' +
        '<li>Generate and copy the token.</li>',
      step3: 'Paste the token here:',
      connect: 'Connect & set up',
      connectedAs: 'Connected to',
      pagesWarn: 'GitHub Pages is not enabled on this repo, so links won\'t work. Enable it in settings: Source = Deploy from a branch, Branch = main and /(root).',
      openSettings: 'Open settings ↗',
      recheck: 'I enabled it, check again',
      dropText: 'Choose an image, drag it here, or paste it (Ctrl+V)',
      dropHint: 'Images over 1 MB are compressed automatically so they work in Firebase notifications',
      nameLabel: 'File name (optional)',
      upload: 'Upload',
      cancel: 'Cancel',
      copy: 'Copy',
      copied: 'Copied ✓',
      waitingLive: '⏳ GitHub is publishing the image... the link will work in about a minute',
      live: '✅ Link is live — ready to use in your notification',
      liveTimeout: '⚠️ Publishing is taking longer than usual. Try the link again in a bit.',
      myImages: 'My images',
      refresh: 'Refresh',
      noImages: 'No images yet.',
      footer: 'Open source — your images stay on your account.',
      del: 'Delete',
      confirmDel: 'Delete this image? Any notification using this link will lose its image.',
      deleted: 'Deleted',
      confirmLogout: 'This removes the token from this browser. Your images stay on GitHub. Continue?',
      pChecking: 'Checking token...',
      pHello: 'Hi {login}',
      pRepoFound: 'Repo found: {repo}',
      pRepoCreating: 'Creating repo: {repo}...',
      pRepoInit: 'Initializing repo...',
      pPages: 'Enabling GitHub Pages...',
      pPagesOk: 'GitHub Pages is on',
      pPagesFail: 'Could not enable Pages automatically — you\'ll need to enable it manually (a button will show).',
      pDone: 'All set! Ready to upload.',
      eToken: 'Token is invalid or expired.',
      eNoToken: 'Paste a token first.',
      eRepoName: 'Repo name may only contain letters, digits, -, _ and .',
      eCreate: 'Could not create the repo. With a Fine-grained token, create the repo yourself first.',
      ePrivate: 'This repo is private. It must be public for free links to work.',
      eNotImage: 'That file is not an image.',
      eDecode: 'Your browser can\'t read this image. Try JPG or PNG.',
      eTooBig: 'Could not compress the image under 1 MB.',
      sPreparing: 'Preparing image...',
      sCompressed: 'Compressed from {from} to {to}',
      sUploading: 'Uploading...',
      sExists: 'An image with that name exists — change the name.',
      eGeneric: 'Error: {msg}',
    },
  };

  let lang = 'ar';
  const t = (k, vars = {}) =>
    (T[lang][k] ?? T.ar[k] ?? k).replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? '');

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
    $('langBtn').textContent = lang === 'ar' ? 'English' : 'عربي';
    updateSetupLinks();
    if (lastLive) setLive(lastLive);
  }

  // ---------------------------------------------------------------- state
  const $ = id => document.getElementById(id);
  let cfg = load();            // { token, owner, repo, branch, base, pagesOk }
  let pending = null;          // { blob, ext, origSize }
  let lastLive = null;
  let liveTimer = null;

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(cfg)); } catch { /* private mode */ }
  }
  try { lang = localStorage.getItem(STORE + '.lang') || 'ar'; } catch { /* ignore */ }

  // ---------------------------------------------------------------- GitHub API
  class GhError extends Error {
    constructor(status, msg) { super(msg); this.status = status; }
  }
  async function gh(path, { method = 'GET', body, token = cfg.token } = {}) {
    const res = await fetch(API + path, {
      method,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    if (res.status === 204) return null;
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new GhError(res.status, (data && data.message) || res.statusText);
    return data;
  }
  const enc = s => s.split('/').map(encodeURIComponent).join('/');
  const repoPath = () => `/repos/${enc(cfg.owner)}/${enc(cfg.repo)}`;

  function b64Text(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return btoa(bin);
  }
  function b64Blob(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1]);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  }

  function defaultBase(owner, repo) {
    const host = `${owner.toLowerCase()}.github.io`;
    return repo.toLowerCase() === host ? `https://${host}/` : `https://${host}/${repo}/`;
  }

  // ---------------------------------------------------------------- setup
  function updateSetupLinks() {
    const repo = ($('repoInput').value || 'img-links').trim();
    $('classicLink').href =
      'https://github.com/settings/tokens/new?scopes=public_repo&description=' +
      encodeURIComponent('Image to Link (' + repo + ')');
    const nr = $('newRepoLink');
    if (nr) nr.href = 'https://github.com/new?visibility=public&name=' + encodeURIComponent(repo);
  }

  function logLine(text, cls = '') {
    const box = $('setupLog');
    box.classList.remove('hidden');
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    box.appendChild(div);
  }

  async function runSetup() {
    const token = $('tokenInput').value.trim();
    const repo = $('repoInput').value.trim();
    $('setupLog').innerHTML = '';
    if (!token) return logLine(t('eNoToken'), 'err');
    if (!/^[A-Za-z0-9._-]+$/.test(repo)) return logLine(t('eRepoName'), 'err');

    const btn = $('setupBtn');
    btn.disabled = true;
    try {
      logLine(t('pChecking'));
      let user;
      try { user = await gh('/user', { token }); }
      catch (e) { throw new Error(e.status === 401 ? t('eToken') : e.message); }
      const owner = user.login;
      logLine(t('pHello', { login: owner }), 'ok');

      cfg = { token, owner, repo };

      // 1) repo
      let info;
      try {
        info = await gh(repoPath());
        logLine(t('pRepoFound', { repo: `${owner}/${repo}` }));
      } catch (e) {
        if (e.status !== 404) throw e;
        logLine(t('pRepoCreating', { repo: `${owner}/${repo}` }));
        try {
          info = await gh('/user/repos', {
            method: 'POST',
            body: {
              name: repo,
              description: 'Public images for notifications — uploaded with Image to Link',
              private: false,
              auto_init: false,
            },
          });
        } catch (e2) {
          throw new Error(`${t('eCreate')} (${e2.message})`);
        }
      }
      if (info.private) throw new Error(t('ePrivate'));
      cfg.branch = info.default_branch || 'main';

      // 2) make sure the repo has a first commit (+ .nojekyll for faster Pages builds)
      let hasNojekyll = false;
      try { await gh(`${repoPath()}/contents/.nojekyll`); hasNojekyll = true; }
      catch (e) { if (e.status !== 404 && e.status !== 409) throw e; }
      if (!hasNojekyll) {
        logLine(t('pRepoInit'));
        await gh(`${repoPath()}/contents/.nojekyll`, {
          method: 'PUT',
          body: { message: 'Init for GitHub Pages', content: b64Text('Disable Jekyll for faster Pages builds\n'), branch: cfg.branch },
        });
        try {
          await gh(`${repoPath()}/contents/README.md`, {
            method: 'PUT',
            body: {
              message: 'Add README',
              content: b64Text(`# ${repo}\n\nPublic images uploaded with [Image to Link](https://github.com/nadanabill/image_to_link).\n`),
              branch: cfg.branch,
            },
          });
        } catch { /* README already exists — fine */ }
      }

      // 3) GitHub Pages
      logLine(t('pPages'));
      cfg.pagesOk = await ensurePages(true);
      logLine(cfg.pagesOk ? t('pPagesOk') : t('pPagesFail'), cfg.pagesOk ? 'ok' : 'err');

      save();
      logLine(t('pDone'), 'ok');
      $('tokenInput').value = '';
      setTimeout(showApp, 600);
    } catch (e) {
      logLine(e.message || String(e), 'err');
    } finally {
      btn.disabled = false;
    }
  }

  /** Returns true if Pages is (now) enabled; records the site base URL. */
  async function ensurePages(tryCreate) {
    try {
      const p = await gh(`${repoPath()}/pages`);
      cfg.base = p.html_url || defaultBase(cfg.owner, cfg.repo);
      return true;
    } catch (e) {
      if (e.status !== 404 || !tryCreate) return false;
    }
    try {
      const p = await gh(`${repoPath()}/pages`, {
        method: 'POST',
        body: { build_type: 'legacy', source: { branch: cfg.branch, path: '/' } },
      });
      cfg.base = (p && p.html_url) || defaultBase(cfg.owner, cfg.repo);
      return true;
    } catch (e) {
      if (e.status === 409) { cfg.base = defaultBase(cfg.owner, cfg.repo); return true; } // already exists
      return false;
    }
  }

  // ---------------------------------------------------------------- views
  function showSetup() {
    $('setupView').classList.remove('hidden');
    $('appView').classList.add('hidden');
    $('logoutBtn').classList.add('hidden');
    if (cfg.repo) $('repoInput').value = cfg.repo;
    updateSetupLinks();
  }
  function showApp() {
    $('setupView').classList.add('hidden');
    $('appView').classList.remove('hidden');
    $('logoutBtn').classList.remove('hidden');
    const link = $('repoLink');
    link.textContent = `${cfg.owner}/${cfg.repo}`;
    link.href = `https://github.com/${cfg.owner}/${cfg.repo}`;
    $('pagesSettingsLink').href = `https://github.com/${cfg.owner}/${cfg.repo}/settings/pages`;
    $('pagesWarn').classList.toggle('hidden', !!cfg.pagesOk);
    if (!cfg.base) cfg.base = defaultBase(cfg.owner, cfg.repo);
    loadGallery();
  }

  // ---------------------------------------------------------------- image processing
  const fmtSize = n => n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(2)} MB`;

  function decode(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(t('eDecode'))); };
      img.src = url;
    });
  }
  const toBlob = (canvas, type, q) => new Promise(r => canvas.toBlob(r, type, q));

  /** Keep small JPG/PNG as-is; otherwise re-encode to JPEG under MAX_BYTES. */
  async function prepare(file) {
    if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) throw new Error(t('eNotImage'));
    const okType = { 'image/jpeg': 'jpg', 'image/png': 'png' }[file.type];
    if (okType && file.size <= MAX_BYTES) return { blob: file, ext: okType, origSize: file.size };

    const { img, url } = await decode(file);
    try {
      let scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      for (let round = 0; round < 8; round++) {
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        ctx.fillStyle = '#fff';                       // JPEG has no transparency
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for (const q of [0.9, 0.82, 0.74, 0.65]) {
          const blob = await toBlob(canvas, 'image/jpeg', q);
          if (blob && blob.size <= MAX_BYTES) return { blob, ext: 'jpg', origSize: file.size };
        }
        scale *= 0.8;
      }
      throw new Error(t('eTooBig'));
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function pick(file) {
    if (!file) return;
    resetResult();
    setStatus(t('sPreparing'));
    try {
      pending = await prepare(file);
      const prevUrl = URL.createObjectURL(pending.blob);
      const pi = $('previewImg');
      if (pi.dataset.url) URL.revokeObjectURL(pi.dataset.url);
      pi.src = prevUrl; pi.dataset.url = prevUrl;
      const base = file.name.replace(/\.[^.]+$/, '');
      $('nameInput').value = slug(base);
      let meta = `${pending.ext.toUpperCase()} · ${fmtSize(pending.blob.size)}`;
      if (pending.blob !== file) meta += ` — ${t('sCompressed', { from: fmtSize(file.size), to: fmtSize(pending.blob.size) })}`;
      $('previewMeta').textContent = meta;
      $('preview').classList.remove('hidden');
      $('drop').classList.add('hidden');
      clearStatus();
    } catch (e) {
      pending = null;
      setStatus(e.message, true);
    }
  }

  const slug = s => s.normalize('NFKD').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

  function fileName(ext) {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const rnd = Math.random().toString(36).slice(2, 6);
    const base = slug($('nameInput').value) || 'img';
    return `${base}-${stamp}-${rnd}.${ext}`;
  }

  // ---------------------------------------------------------------- upload
  async function upload() {
    if (!pending) return;
    const btn = $('uploadBtn');
    btn.disabled = true;
    setStatus(t('sUploading'));
    try {
      const name = fileName(pending.ext);
      const path = `${IMG_DIR}/${name}`;
      const content = await b64Blob(pending.blob);
      await gh(`${repoPath()}/contents/${enc(path)}`, {
        method: 'PUT',
        body: { message: `Upload ${name}`, content, branch: cfg.branch },
      });
      const url = cfg.base.replace(/\/?$/, '/') + path;
      clearStatus();
      $('preview').classList.add('hidden');
      $('drop').classList.remove('hidden');
      pending = null;
      showResult(url);
      loadGallery();
    } catch (e) {
      setStatus(e.status === 422 ? t('sExists') : t('eGeneric', { msg: e.message }), true);
    } finally {
      btn.disabled = false;
    }
  }

  function showResult(url) {
    $('resultUrl').value = url;
    $('result').classList.remove('hidden');
    setLive('pending');
    watchLive(url);
  }
  function resetResult() {
    clearTimeout(liveTimer);
    lastLive = null;
    $('result').classList.add('hidden');
  }
  function setLive(state) {
    lastLive = state;
    const el = $('liveState');
    el.className = 'live ' + (state === 'live' ? 'ok' : state === 'timeout' ? 'err' : 'pending');
    el.textContent = t(state === 'live' ? 'live' : state === 'timeout' ? 'liveTimeout' : 'waitingLive');
  }
  /** Poll the Pages URL until it serves the image (Pages builds take ~30-90s). */
  function watchLive(url) {
    clearTimeout(liveTimer);
    const started = Date.now();
    const tick = async () => {
      if ($('resultUrl').value !== url) return;
      const ok = await new Promise(resolve => {
        const probe = new Image();
        probe.onload = () => resolve(true);
        probe.onerror = () => resolve(false);
        probe.src = url + '?check=' + Date.now();
      });
      if (ok) return setLive('live');
      if (Date.now() - started > 5 * 60 * 1000) return setLive('timeout');
      liveTimer = setTimeout(tick, 6000);
    };
    liveTimer = setTimeout(tick, 8000);
  }

  // ---------------------------------------------------------------- gallery
  async function loadGallery() {
    const g = $('gallery');
    let items = [];
    try {
      items = await gh(`${repoPath()}/contents/${IMG_DIR}?ref=${encodeURIComponent(cfg.branch)}`);
    } catch (e) {
      if (e.status === 401) { toast(t('eToken')); return; }
      if (e.status !== 404) { toast(t('eGeneric', { msg: e.message })); return; }
    }
    items = (Array.isArray(items) ? items : []).filter(i => i.type === 'file' && /\.(jpe?g|png|gif|webp)$/i.test(i.name));
    const stamp = n => (n.match(/(\d{8}-\d{6})/) || [, ''])[1];
    items.sort((a, b) => stamp(b.name).localeCompare(stamp(a.name)) || a.name.localeCompare(b.name)); // newest first
    g.innerHTML = '';
    $('galleryEmpty').classList.toggle('hidden', items.length > 0);
    for (const it of items) {
      const url = cfg.base.replace(/\/?$/, '/') + it.path;
      const tile = document.createElement('div');
      tile.className = 'tile';
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = it.name;
      img.src = it.download_url;   // raw URL works immediately, before Pages publishes
      const nm = document.createElement('div');
      nm.className = 'name'; nm.dir = 'ltr';
      nm.textContent = `${it.name} · ${fmtSize(it.size)}`;
      const acts = document.createElement('div');
      acts.className = 'acts';
      const cp = document.createElement('button');
      cp.className = 'btn secondary'; cp.type = 'button'; cp.textContent = t('copy');
      cp.onclick = () => copy(url);
      const del = document.createElement('button');
      del.className = 'btn ghost danger'; del.type = 'button'; del.textContent = t('del');
      del.onclick = () => remove(it);
      acts.append(cp, del);
      tile.append(img, nm, acts);
      g.appendChild(tile);
    }
  }

  async function remove(it) {
    if (!confirm(t('confirmDel'))) return;
    try {
      await gh(`${repoPath()}/contents/${enc(it.path)}`, {
        method: 'DELETE',
        body: { message: `Delete ${it.name}`, sha: it.sha, branch: cfg.branch },
      });
      toast(t('deleted'));
      loadGallery();
    } catch (e) {
      toast(t('eGeneric', { msg: e.message }));
    }
  }

  // ---------------------------------------------------------------- misc UI
  function setStatus(msg, err = false) {
    const s = $('status');
    s.textContent = msg;
    s.classList.toggle('err', err);
    s.classList.remove('hidden');
  }
  function clearStatus() { $('status').classList.add('hidden'); }

  let toastTimer;
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    toast(t('copied'));
  }

  // ---------------------------------------------------------------- wire up
  $('langBtn').onclick = () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem(STORE + '.lang', lang); } catch { /* ignore */ }
    applyLang();
    if (!$('appView').classList.contains('hidden')) loadGallery();
  };
  $('logoutBtn').onclick = () => {
    if (!confirm(t('confirmLogout'))) return;
    const repo = cfg.repo;
    cfg = { repo };
    try { localStorage.removeItem(STORE); } catch { /* ignore */ }
    resetResult();
    showSetup();
  };
  $('repoInput').addEventListener('input', updateSetupLinks);
  $('setupBtn').onclick = runSetup;
  $('tokenInput').addEventListener('keydown', e => { if (e.key === 'Enter') runSetup(); });

  $('fileInput').onchange = e => { pick(e.target.files[0]); e.target.value = ''; };
  const drop = $('drop');
  ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => pick(e.dataTransfer.files[0]));
  document.addEventListener('paste', e => {
    if ($('appView').classList.contains('hidden')) return;
    const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
    if (item) { e.preventDefault(); pick(item.getAsFile()); }
  });

  $('uploadBtn').onclick = upload;
  $('cancelBtn').onclick = () => {
    pending = null;
    $('preview').classList.add('hidden');
    $('drop').classList.remove('hidden');
    clearStatus();
  };
  $('copyBtn').onclick = () => copy($('resultUrl').value);
  $('resultUrl').onclick = e => e.target.select();
  $('refreshBtn').onclick = loadGallery;
  $('recheckPagesBtn').onclick = async () => {
    cfg.pagesOk = await ensurePages(false);
    save();
    $('pagesWarn').classList.toggle('hidden', !!cfg.pagesOk);
    if (cfg.pagesOk) toast(t('pPagesOk'));
  };

  applyLang();
  if (cfg.token && cfg.owner && cfg.repo) showApp(); else showSetup();
})();
