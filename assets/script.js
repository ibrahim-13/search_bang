const BASE_URL = '/search_bang';
const storageKey = "bangs";
const default_bangs = [
    { key: "bing",    name: "Bing",              url: "https://www.bing.com/search?q={{{s}}}" },
    { key: "brave",   name: "Brave",             url: "https://search.brave.com/search?q={{{s}}}", default: true },
    { key: "google",  name: "Google",            url: "https://www.google.com/search?q={{{s}}}" },
    { key: "github",  name: "GitHub",            url: "https://github.com/search?q={{{s}}}" },
    { key: "rotten",  name: "Rotten Tomatoes",   url: "https://www.rottentomatoes.com/search?search={{{s}}}" },
    { key: "imdb",    name: "IMDB",              url: "https://www.imdb.com/find/?q={{{s}}}" },
    { key: "maps",    name: "Google Maps",       url: "https://www.google.com/maps/search/{{{s}}}/" },
    { key: "reddit",  name: "Reddit",            url: "https://www.reddit.com/search/?q={{{s}}}" },
    { key: "wiki",    name: "Wikipedia",         url: "https://en.wikipedia.org/w/index.php?search={{{s}}}&profile=advanced&fulltext=1&ns0=1" },
    { key: "yt",      name: "YouTube",           url: "https://www.youtube.com/results?search_query={{{s}}}" },
];

const stored_bangs = localStorage.getItem(storageKey);
let bangs = !!stored_bangs ? JSON.parse(stored_bangs) : default_bangs;

const __query_url = new URL("?q=%s", window.location.href);

function makeProxy(elements, schema) {
    return new Proxy(elements, {
        get(target, prop) {
            if (prop in schema && schema[prop].get) {
                return schema[prop].get(target);
            }
        },
        set(target, prop, value) {
            if (prop in schema && schema[prop].set) {
                schema[prop].set(target, value);
            }
            return true;
        },
    });
}

const appView = makeProxy(
    { el: document.getElementById('app') },
    {
        visible: {
            get(els)       { return els.el.style.display !== 'none'; },
            set(els, show) { els.el.style.display = show ? '' : 'none'; },
        },
    }
);

const urlDisplay = makeProxy(
    { el: document.getElementById('urlInput') },
    {
        value: {
            get(els)    { return els.el.value; },
            set(els, v) { els.el.value = v; },
        },
    }
);

const copyIcon = makeProxy(
    { el: document.getElementById('copyIcon') },
    {
        src: {
            get(els)    { return els.el.src; },
            set(els, v) { els.el.src = v; },
        },
    }
);

function bangRowHtml(i) {
    return `
        <tr>
            <td>${i.name}</td>
            <td>${i.key}</td>
            <td>
                <input type="checkbox"
                    onclick="doDefault('${i.key}')"
                    ${i.default ? "checked" : ""}>
            </td>
            <td>
                <div class="item-row">
                    <button class="icon-button" onclick="doEdit('${i.key}')">
                        <img src="assets/pen-to-square.svg" alt="Edit" />
                    </button>
                    <button class="icon-button" onclick="doDelete('${i.key}')">
                        <img src="assets/xmark.svg" alt="Delete" />
                    </button>
                </div>
            </td>
        </tr>`;
}

const bangsTable = makeProxy(
    { el: document.getElementById('bangsTable') },
    {
        bangs: {
            set(els, bangsList) {
                els.el.innerHTML = bangsList.map(bangRowHtml).join('');
            },
        },
    }
);

const addForm = makeProxy(
    {
        nameEl: document.getElementById('addName'),
        keyEl:  document.getElementById('addKey'),
        urlEl:  document.getElementById('addUrl'),
        btn:    document.getElementById('addBangBtn'),
    },
    {
        values: {
            get(els) {
                return {
                    name: els.nameEl.value,
                    key:  els.keyEl.value.toLowerCase(),
                    url:  els.urlEl.value,
                };
            },
            set(els, { name, key, url }) {
                els.nameEl.value = name;
                els.keyEl.value  = key;
                els.urlEl.value  = url;
            },
        },
        mode: {
            set(els, editing) { els.btn.textContent = editing ? 'Update' : 'Add'; },
        },
        clear: {
            set(els) {
                els.nameEl.value = '';
                els.keyEl.value  = '';
                els.urlEl.value  = '';
                els.btn.textContent = 'Add';
            },
        },
    }
);

let editingKey = null;

document.getElementById('copyButton').addEventListener('click', async () => {
    await navigator.clipboard.writeText(urlDisplay.value);
    copyIcon.src = BASE_URL + '/assets/clipboard-check.svg';
    setTimeout(() => {
        copyIcon.src = BASE_URL + '/assets/clipboard.svg';
    }, 2000);
});

document.getElementById('addBangBtn').addEventListener('click', () => doAdd());
document.getElementById('clearFormBtn').addEventListener('click', () => { editingKey = null; addForm.clear = true; });
document.getElementById('resetBtn').addEventListener('click', () => doReset());
document.getElementById('updateSwBtn').addEventListener('click', () => doUpdate());

function noSearchDefaultPageRender() {
    urlDisplay.value = __query_url.href;
    bangsTable.bangs = bangs;
    appView.visible = true;
}

const defaultBang = bangs.find((b) => !!b.default);

function getBangredirectUrl() {
    const url = new URL(window.location.href);
    const query = url.searchParams.get("q")?.trim() ?? "";
    if (!query) {
        noSearchDefaultPageRender();
        return null;
    }

    const match = query.match(/!(\S+)/i);
    const bangCandidate = match?.[1]?.toLowerCase();
    const selectedBang = bangs.find((b) => b.key === bangCandidate) ?? defaultBang;

    const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

    const searchUrl = selectedBang?.url.replace(
        "{{{s}}}",
        encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
    );
    if (!searchUrl) return null;

    return searchUrl;
}

function doRedirect() {
    const searchUrl = getBangredirectUrl();
    if (!searchUrl) return;
    window.location.replace(searchUrl);
}

window.doDelete = function(key) {
    bangs = bangs.filter(i => i.key != key);
    localStorage.setItem(storageKey, JSON.stringify(bangs));
    noSearchDefaultPageRender();
}

window.doDefault = function(key) {
    bangs = bangs.map(i =>
        i.key == key
            ? ({ key: i.key, name: i.name, url: i.url, default: true })
            : ({ key: i.key, name: i.name, url: i.url })
    );
    localStorage.setItem(storageKey, JSON.stringify(bangs));
    noSearchDefaultPageRender();
}

window.doEdit = function(key) {
    const bang = bangs.find(i => i.key === key);
    if (!bang) return;
    editingKey = key;
    addForm.values = { name: bang.name, key: bang.key, url: bang.url };
    addForm.mode = true;
}

function doAdd() {
    const { name, key, url } = addForm.values;
    if (editingKey !== null) {
        bangs = bangs.map(i =>
            i.key === editingKey
                ? { key, name, url, ...(i.default ? { default: true } : {}) }
                : i
        );
        editingKey = null;
    } else {
        bangs.push({ key, name, url });
    }
    localStorage.setItem(storageKey, JSON.stringify(bangs));
    addForm.clear = true;
    noSearchDefaultPageRender();
}

function doReset() {
    bangs = default_bangs;
    localStorage.removeItem(storageKey);
    noSearchDefaultPageRender();
}

function doUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.update();
        });
    }
}

doRedirect();
