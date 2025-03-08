const storageKey = "bangs";
const default_bangs = [
    {
      key: "bing",
      name: "Bing",
      url: "https://www.bing.com/search?q={{{s}}}",
    },
    {
      key: "brave",
      name: "Brave",
      url: "https://search.brave.com/search?q={{{s}}}",
      default: true,
    },
    {
      key: "google",
      name: "Google",
      url: "https://www.google.com/search?q={{{s}}}",
    },
    {
      key: "github",
      name: "GitHub",
      url: "https://github.com/search?q={{{s}}}",
    },
    {
        key: "imdb",
        name: "IMDB",
        url: "https://www.imdb.com/find/?q={{{s}}}"
    },
    {
        key: "maps",
        name: "Google Maps",
        url: "https://www.google.com/maps/search/{{{s}}}/"
    },
    {
      key: "reddit",
      name: "Reddit",
      url: "https://www.reddit.com/search/?q={{{s}}}",
    },
    {
      key: "wiki",
      name: "Wikipedia",
      url: "https://en.wikipedia.org/w/index.php?search={{{s}}}&profile=advanced&fulltext=1&ns0=1",
    },
    {
      key: "yt",
      name: "YouTube",
      url: "https://www.youtube.com/results?search_query={{{s}}}",
    },
  ];

const stored_bangs = localStorage.getItem(storageKey);
let bangs = !!stored_bangs ? JSON.parse(stored_bangs) : default_bangs;

const __query_url = new URL("?q=%s", window.location.href);

function noSearchDefaultPageRender() {
    const app = document.querySelector("#app");
    app.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
        <div class="content-container">
          <h1>Search!</h1>
          <p>Search on websites with DuckDuckGo's bangs.</p>
          <div class="url-container"> 
            <input 
              type="text" 
              class="url-input"
              value="${__query_url.href}"
              readonly 
            />
            <button class="copy-button">
              <img src="/search_bang/assets/clipboard.svg" alt="Copy" />
            </button>
          </div>
          <div class="info_container">
            <h2>Bangs:</h2>
            <table>
              ${bangs.map(i => `<tr><td>${i.name}</td><td>${i.key}</td><td><input type="checkbox" onclick="doDefault('${i.key}')"${i.default ? " checked" : ""}></td><td><button onclick="doDelete('${i.key}')">Delete</button></td></tr>`).join("")}
            </table>
            <table>
              <tr><td>Name</td><td>Key</td><td>Url</td><td></td></tr>
              <tr><td><input id="addName" type="text"></td><td><input id="addKey" type="text"></td><td><input id="addUrl" type="text"></td><td><button onclick="doAdd()">Add</button></td></tr>
            </table>
            <p>Search Url Format: <code>https://example.com/search?q={{{s}}}</code></p>
            <button onclick="doReset()"><u>Reset To Default</u></button>
            <button onclick="doUpdate()"><u>Trigger SW Update</u></button>
          </div>
        </div>
        <footer class="footer">
          <a href="https://github.com/ibrahim-13/search_bang" target="_blank">ibrahim-13/search_bang</a>
          •
          <a href="https://github.com/irsyadpage/unduck/tree/dark-mode" target="_blank">irsyadpage/unduck</a>
          •
          <a href="https://github.com/t3dotgg/unduck" target="_blank">t3dotgg/unduck</a>
        </footer>
      </div>
    `;
  
    const copyButton = app.querySelector(".copy-button");
    const copyIcon = copyButton.querySelector("img");
    const urlInput = app.querySelector(".url-input");
  
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(urlInput.value);
      copyIcon.src = "/search_bang/assets/clipboard-check.svg";
  
      setTimeout(() => {
        copyIcon.src = "/search_bang/assets/clipboard.svg";
      }, 2000);
    });
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
  
    // Remove the first bang from the query
    const cleanQuery = query.replace(/!\S+\s*/i, "").trim();
  
    // Format of the url is:
    // https://www.google.com/search?q={{{s}}}
    const searchUrl = selectedBang?.url.replace(
      "{{{s}}}",
      // Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
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

  window.doAdd = function() {
    const name = document.getElementById('addName').value;
    const key = document.getElementById('addKey').value.toLowerCase();
    const url = document.getElementById('addUrl').value;
    bangs.push({ key, name, url });
    localStorage.setItem(storageKey, JSON.stringify(bangs));
    noSearchDefaultPageRender();
  }

  window.doReset = function(key) {
    bangs = default_bangs;
    localStorage.removeItem(storageKey);
    noSearchDefaultPageRender();
  }

  window.doDefault = function(key) {
    bangs = bangs.map(i =>
	  i.key == key
	    ? ({ key: i.key, name: i.name, url: i.url, default: true })
		: ({ key: i.key, name: i.name, url: i.url})
	);
    localStorage.setItem(storageKey, JSON.stringify(bangs));
    noSearchDefaultPageRender();
  }
  
  window.doUpdate = function() {
    if ('serviceWorker' in navigator) {
	  navigator.serviceWorker.ready.then((registration) => {
	    registration.update();
	  });
	}
  }
  
  doRedirect();