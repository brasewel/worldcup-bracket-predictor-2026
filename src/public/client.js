"use strict";
(() => {
  // src/client/data.ts
  var GROUPS_DATA = {
    A: [
      { flag: "\u{1F1F2}\u{1F1FD}", name: "Mexico" },
      { flag: "\u{1F1FF}\u{1F1E6}", name: "South Africa" },
      { flag: "\u{1F1F0}\u{1F1F7}", name: "South Korea" },
      { flag: "\u{1F1E8}\u{1F1FF}", name: "Czechia" }
    ],
    B: [
      { flag: "\u{1F1E8}\u{1F1E6}", name: "Canada" },
      { flag: "\u{1F1E7}\u{1F1E6}", name: "Bosnia & Herzegovina" },
      { flag: "\u{1F1F6}\u{1F1E6}", name: "Qatar" },
      { flag: "\u{1F1E8}\u{1F1ED}", name: "Switzerland" }
    ],
    C: [
      { flag: "\u{1F1E7}\u{1F1F7}", name: "Brazil" },
      { flag: "\u{1F1F2}\u{1F1E6}", name: "Morocco" },
      { flag: "\u{1F1ED}\u{1F1F9}", name: "Haiti" },
      { flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", name: "Scotland" }
    ],
    D: [
      { flag: "\u{1F1FA}\u{1F1F8}", name: "USA" },
      { flag: "\u{1F1F5}\u{1F1FE}", name: "Paraguay" },
      { flag: "\u{1F1E6}\u{1F1FA}", name: "Australia" },
      { flag: "\u{1F1F9}\u{1F1F7}", name: "T\xFCrkiye" }
    ],
    E: [
      { flag: "\u{1F1E9}\u{1F1EA}", name: "Germany" },
      { flag: "\u{1F1E8}\u{1F1FC}", name: "Cura\xE7ao" },
      { flag: "\u{1F1E8}\u{1F1EE}", name: "Ivory Coast" },
      { flag: "\u{1F1EA}\u{1F1E8}", name: "Ecuador" }
    ],
    F: [
      { flag: "\u{1F1F3}\u{1F1F1}", name: "Netherlands" },
      { flag: "\u{1F1EF}\u{1F1F5}", name: "Japan" },
      { flag: "\u{1F1F8}\u{1F1EA}", name: "Sweden" },
      { flag: "\u{1F1F9}\u{1F1F3}", name: "Tunisia" }
    ],
    G: [
      { flag: "\u{1F1E7}\u{1F1EA}", name: "Belgium" },
      { flag: "\u{1F1EA}\u{1F1EC}", name: "Egypt" },
      { flag: "\u{1F1EE}\u{1F1F7}", name: "Iran" },
      { flag: "\u{1F1F3}\u{1F1FF}", name: "New Zealand" }
    ],
    H: [
      { flag: "\u{1F1EA}\u{1F1F8}", name: "Spain" },
      { flag: "\u{1F1E8}\u{1F1FB}", name: "Cape Verde" },
      { flag: "\u{1F1F8}\u{1F1E6}", name: "Saudi Arabia" },
      { flag: "\u{1F1FA}\u{1F1FE}", name: "Uruguay" }
    ],
    I: [
      { flag: "\u{1F1EB}\u{1F1F7}", name: "France" },
      { flag: "\u{1F1F8}\u{1F1F3}", name: "Senegal" },
      { flag: "\u{1F1EE}\u{1F1F6}", name: "Iraq" },
      { flag: "\u{1F1F3}\u{1F1F4}", name: "Norway" }
    ],
    J: [
      { flag: "\u{1F1E6}\u{1F1F7}", name: "Argentina" },
      { flag: "\u{1F1E9}\u{1F1FF}", name: "Algeria" },
      { flag: "\u{1F1E6}\u{1F1F9}", name: "Austria" },
      { flag: "\u{1F1EF}\u{1F1F4}", name: "Jordan" }
    ],
    K: [
      { flag: "\u{1F1F5}\u{1F1F9}", name: "Portugal" },
      { flag: "\u{1F1E8}\u{1F1E9}", name: "DR Congo" },
      { flag: "\u{1F1FA}\u{1F1FF}", name: "Uzbekistan" },
      { flag: "\u{1F1E8}\u{1F1F4}", name: "Colombia" }
    ],
    L: [
      { flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", name: "England" },
      { flag: "\u{1F1ED}\u{1F1F7}", name: "Croatia" },
      { flag: "\u{1F1EC}\u{1F1ED}", name: "Ghana" },
      { flag: "\u{1F1F5}\u{1F1E6}", name: "Panama" }
    ]
  };
  function getFlagForTeam(name) {
    for (const teams of Object.values(GROUPS_DATA)) {
      const t = teams.find((t2) => t2.name === name);
      if (t) return t.flag;
    }
    return "\u{1F3F3}";
  }
  var R32_SEEDS = [
    [{ g: "A", p: 1 }, { g: "B", p: 1 }],
    // M73
    [{ g: "E", p: 0 }, { third: ["A", "B", "C", "D", "F"] }],
    // M74
    [{ g: "F", p: 0 }, { g: "C", p: 1 }],
    // M75
    [{ g: "C", p: 0 }, { g: "F", p: 1 }],
    // M76
    [{ g: "I", p: 0 }, { third: ["C", "D", "F", "G", "H"] }],
    // M77
    [{ g: "E", p: 1 }, { g: "I", p: 1 }],
    // M78
    [{ g: "A", p: 0 }, { third: ["C", "E", "F", "H", "I"] }],
    // M79
    [{ g: "L", p: 0 }, { third: ["E", "H", "I", "J", "K"] }],
    // M80
    [{ g: "D", p: 0 }, { third: ["B", "E", "F", "I", "J"] }],
    // M81
    [{ g: "G", p: 0 }, { third: ["A", "E", "H", "I", "J"] }],
    // M82
    [{ g: "K", p: 1 }, { g: "L", p: 1 }],
    // M83
    [{ g: "H", p: 0 }, { g: "J", p: 1 }],
    // M84
    [{ g: "B", p: 0 }, { third: ["E", "F", "G", "I", "J"] }],
    // M85
    [{ g: "J", p: 0 }, { g: "H", p: 1 }],
    // M86
    [{ g: "K", p: 0 }, { third: ["D", "E", "I", "J", "L"] }],
    // M87
    [{ g: "D", p: 1 }, { g: "G", p: 1 }]
    // M88
  ];
  var ROUND_COUNTS = { r32: 16, r16: 8, qf: 4, sf: 2, final: 1 };
  var ROUND_LABELS_SHORT = {
    r32: "R32",
    r16: "R16",
    qf: "QF",
    sf: "SF",
    final: "Final"
  };
  var SCHEDULE = [
    [1, "2026-06-11", "15:00", "Mexico", "South Africa", "A", "Estadio Azteca", "Mexico City"],
    [2, "2026-06-11", "22:00", "South Korea", "Czechia", "A", "Estadio Akron", "Guadalajara"],
    [3, "2026-06-12", "15:00", "Canada", "Bosnia & Herz.", "B", "BMO Field", "Toronto"],
    [4, "2026-06-12", "21:00", "USA", "Paraguay", "D", "SoFi Stadium", "Los Angeles"],
    [5, "2026-06-13", "21:00", "Haiti", "Scotland", "C", "Gillette Stadium", "Boston"],
    [6, "2026-06-13", "00:00", "Australia", "T\xFCrkiye", "D", "BC Place", "Vancouver"],
    [7, "2026-06-13", "18:00", "Brazil", "Morocco", "C", "MetLife Stadium", "New York/NJ"],
    [8, "2026-06-13", "15:00", "Qatar", "Switzerland", "B", "Levi\u2019s Stadium", "San Francisco"],
    [9, "2026-06-14", "19:00", "Ivory Coast", "Ecuador", "E", "Lincoln Financial", "Philadelphia"],
    [10, "2026-06-14", "13:00", "Germany", "Cura\xE7ao", "E", "NRG Stadium", "Houston"],
    [11, "2026-06-14", "16:00", "Netherlands", "Japan", "F", "AT&T Stadium", "Dallas"],
    [12, "2026-06-14", "22:00", "Sweden", "Tunisia", "F", "Estadio BBVA", "Monterrey"],
    [13, "2026-06-15", "18:00", "Saudi Arabia", "Uruguay", "H", "Hard Rock Stadium", "Miami"],
    [14, "2026-06-15", "12:00", "Spain", "Cape Verde", "H", "Mercedes-Benz Stadium", "Atlanta"],
    [15, "2026-06-15", "21:00", "Iran", "New Zealand", "G", "SoFi Stadium", "Los Angeles"],
    [16, "2026-06-15", "15:00", "Belgium", "Egypt", "G", "Lumen Field", "Seattle"],
    [17, "2026-06-16", "15:00", "France", "Senegal", "I", "MetLife Stadium", "New York/NJ"],
    [18, "2026-06-16", "18:00", "Iraq", "Norway", "I", "Gillette Stadium", "Boston"],
    [19, "2026-06-16", "21:00", "Argentina", "Algeria", "J", "Arrowhead Stadium", "Kansas City"],
    [20, "2026-06-16", "00:00", "Austria", "Jordan", "J", "Levi\u2019s Stadium", "San Francisco"],
    [21, "2026-06-17", "19:00", "Ghana", "Panama", "L", "BMO Field", "Toronto"],
    [22, "2026-06-17", "16:00", "England", "Croatia", "L", "AT&T Stadium", "Dallas"],
    [23, "2026-06-17", "13:00", "Portugal", "DR Congo", "K", "NRG Stadium", "Houston"],
    [24, "2026-06-17", "22:00", "Uzbekistan", "Colombia", "K", "Estadio Azteca", "Mexico City"],
    [25, "2026-06-18", "12:00", "Czechia", "South Africa", "A", "Mercedes-Benz Stadium", "Atlanta"],
    [26, "2026-06-18", "15:00", "Switzerland", "Bosnia & Herz.", "B", "SoFi Stadium", "Los Angeles"],
    [27, "2026-06-18", "18:00", "Canada", "Qatar", "B", "BC Place", "Vancouver"],
    [28, "2026-06-18", "21:00", "Mexico", "South Korea", "A", "Estadio Akron", "Guadalajara"],
    [29, "2026-06-19", "21:00", "Brazil", "Haiti", "C", "Lincoln Financial", "Philadelphia"],
    [30, "2026-06-19", "18:00", "Scotland", "Morocco", "C", "Gillette Stadium", "Boston"],
    [31, "2026-06-19", "23:00", "T\xFCrkiye", "Paraguay", "D", "Levi\u2019s Stadium", "San Francisco"],
    [32, "2026-06-19", "15:00", "USA", "Australia", "D", "Lumen Field", "Seattle"],
    [33, "2026-06-20", "16:00", "Germany", "Ivory Coast", "E", "BMO Field", "Toronto"],
    [34, "2026-06-20", "20:00", "Ecuador", "Cura\xE7ao", "E", "Arrowhead Stadium", "Kansas City"],
    [35, "2026-06-20", "13:00", "Netherlands", "Sweden", "F", "NRG Stadium", "Houston"],
    [36, "2026-06-20", "00:00", "Tunisia", "Japan", "F", "Estadio BBVA", "Monterrey"],
    [37, "2026-06-21", "18:00", "Uruguay", "Cape Verde", "H", "Hard Rock Stadium", "Miami"],
    [38, "2026-06-21", "12:00", "Spain", "Saudi Arabia", "H", "Mercedes-Benz Stadium", "Atlanta"],
    [39, "2026-06-21", "15:00", "Belgium", "Iran", "G", "SoFi Stadium", "Los Angeles"],
    [40, "2026-06-21", "21:00", "New Zealand", "Egypt", "G", "BC Place", "Vancouver"],
    [41, "2026-06-22", "20:00", "Norway", "Senegal", "I", "MetLife Stadium", "New York/NJ"],
    [42, "2026-06-22", "17:00", "France", "Iraq", "I", "Lincoln Financial", "Philadelphia"],
    [43, "2026-06-22", "13:00", "Argentina", "Austria", "J", "AT&T Stadium", "Dallas"],
    [44, "2026-06-22", "23:00", "Jordan", "Algeria", "J", "Levi\u2019s Stadium", "San Francisco"],
    [45, "2026-06-23", "16:00", "England", "Ghana", "L", "Gillette Stadium", "Boston"],
    [46, "2026-06-23", "19:00", "Panama", "Croatia", "L", "BMO Field", "Toronto"],
    [47, "2026-06-23", "13:00", "Portugal", "Uzbekistan", "K", "NRG Stadium", "Houston"],
    [48, "2026-06-23", "22:00", "Colombia", "DR Congo", "K", "Estadio Akron", "Guadalajara"],
    [49, "2026-06-24", "18:00", "Scotland", "Brazil", "C", "Hard Rock Stadium", "Miami"],
    [50, "2026-06-24", "18:00", "Morocco", "Haiti", "C", "Mercedes-Benz Stadium", "Atlanta"],
    [51, "2026-06-24", "15:00", "Switzerland", "Canada", "B", "BC Place", "Vancouver"],
    [52, "2026-06-24", "15:00", "Bosnia & Herz.", "Qatar", "B", "Lumen Field", "Seattle"],
    [53, "2026-06-24", "21:00", "Czechia", "Mexico", "A", "Estadio Azteca", "Mexico City"],
    [54, "2026-06-24", "21:00", "South Africa", "South Korea", "A", "Estadio BBVA", "Monterrey"],
    [55, "2026-06-25", "16:00", "Cura\xE7ao", "Ivory Coast", "E", "Lincoln Financial", "Philadelphia"],
    [56, "2026-06-25", "16:00", "Ecuador", "Germany", "E", "MetLife Stadium", "New York/NJ"],
    [57, "2026-06-25", "19:00", "Japan", "Sweden", "F", "AT&T Stadium", "Dallas"],
    [58, "2026-06-25", "19:00", "Tunisia", "Netherlands", "F", "Arrowhead Stadium", "Kansas City"],
    [59, "2026-06-25", "22:00", "T\xFCrkiye", "USA", "D", "SoFi Stadium", "Los Angeles"],
    [60, "2026-06-25", "22:00", "Paraguay", "Australia", "D", "Levi\u2019s Stadium", "San Francisco"],
    [61, "2026-06-26", "15:00", "Norway", "France", "I", "Gillette Stadium", "Boston"],
    [62, "2026-06-26", "15:00", "Senegal", "Iraq", "I", "BMO Field", "Toronto"],
    [63, "2026-06-26", "23:00", "Egypt", "Iran", "G", "Lumen Field", "Seattle"],
    [64, "2026-06-26", "23:00", "New Zealand", "Belgium", "G", "BC Place", "Vancouver"],
    [65, "2026-06-26", "20:00", "Cape Verde", "Saudi Arabia", "H", "NRG Stadium", "Houston"],
    [66, "2026-06-26", "20:00", "Uruguay", "Spain", "H", "Estadio Akron", "Guadalajara"],
    [67, "2026-06-27", "17:00", "Panama", "England", "L", "MetLife Stadium", "New York/NJ"],
    [68, "2026-06-27", "17:00", "Croatia", "Ghana", "L", "Lincoln Financial", "Philadelphia"],
    [69, "2026-06-27", "22:00", "Algeria", "Austria", "J", "Arrowhead Stadium", "Kansas City"],
    [70, "2026-06-27", "22:00", "Jordan", "Argentina", "J", "AT&T Stadium", "Dallas"],
    [71, "2026-06-27", "19:30", "Colombia", "Portugal", "K", "Hard Rock Stadium", "Miami"],
    [72, "2026-06-27", "19:30", "DR Congo", "Uzbekistan", "K", "Mercedes-Benz Stadium", "Atlanta"],
    [73, "2026-06-28", "15:00", "2nd Group A", "2nd Group B", null, "SoFi Stadium", "Los Angeles"],
    [74, "2026-06-29", "16:30", "1st Group E", "Best 3rd (A/B/C/D/F)", null, "Gillette Stadium", "Boston"],
    [75, "2026-06-29", "21:00", "1st Group F", "2nd Group C", null, "Estadio BBVA", "Monterrey"],
    [76, "2026-06-29", "13:00", "1st Group C", "2nd Group F", null, "NRG Stadium", "Houston"],
    [77, "2026-06-30", "17:00", "1st Group I", "Best 3rd (C/D/F/G/H)", null, "MetLife Stadium", "New York/NJ"],
    [78, "2026-06-30", "13:00", "2nd Group E", "2nd Group I", null, "AT&T Stadium", "Dallas"],
    [79, "2026-06-30", "21:00", "1st Group A", "Best 3rd (C/E/F/H/I)", null, "Estadio Azteca", "Mexico City"],
    [80, "2026-07-01", "12:00", "1st Group L", "Best 3rd (E/H/I/J/K)", null, "Mercedes-Benz Stadium", "Atlanta"],
    [81, "2026-07-01", "20:00", "1st Group D", "Best 3rd (B/E/F/I/J)", null, "Levi\u2019s Stadium", "San Francisco"],
    [82, "2026-07-01", "16:00", "1st Group G", "Best 3rd (A/E/H/I/J)", null, "Lumen Field", "Seattle"],
    [83, "2026-07-02", "19:00", "2nd Group K", "2nd Group L", null, "BMO Field", "Toronto"],
    [84, "2026-07-02", "15:00", "1st Group H", "2nd Group J", null, "SoFi Stadium", "Los Angeles"],
    [85, "2026-07-02", "23:00", "1st Group B", "Best 3rd (E/F/G/I/J)", null, "BC Place", "Vancouver"],
    [86, "2026-07-03", "18:00", "1st Group J", "2nd Group H", null, "Hard Rock Stadium", "Miami"],
    [87, "2026-07-03", "21:30", "1st Group K", "Best 3rd (D/E/I/J/L)", null, "Arrowhead Stadium", "Kansas City"],
    [88, "2026-07-03", "14:00", "2nd Group D", "2nd Group G", null, "AT&T Stadium", "Dallas"],
    [89, "2026-07-04", "17:00", "W74", "W77", null, "Lincoln Financial", "Philadelphia"],
    [90, "2026-07-04", "13:00", "W73", "W75", null, "NRG Stadium", "Houston"],
    [91, "2026-07-05", "16:00", "W76", "W78", null, "MetLife Stadium", "New York/NJ"],
    [92, "2026-07-05", "20:00", "W79", "W80", null, "Estadio Azteca", "Mexico City"],
    [93, "2026-07-06", "15:00", "W83", "W84", null, "AT&T Stadium", "Dallas"],
    [94, "2026-07-06", "20:00", "W81", "W82", null, "Lumen Field", "Seattle"],
    [95, "2026-07-07", "12:00", "W86", "W88", null, "Mercedes-Benz Stadium", "Atlanta"],
    [96, "2026-07-07", "16:00", "W85", "W87", null, "BC Place", "Vancouver"],
    [97, "2026-07-09", "16:00", "W89", "W90", null, "Gillette Stadium", "Boston"],
    [98, "2026-07-10", "15:00", "W93", "W94", null, "SoFi Stadium", "Los Angeles"],
    [99, "2026-07-11", "17:00", "W91", "W92", null, "Hard Rock Stadium", "Miami"],
    [100, "2026-07-11", "21:00", "W95", "W96", null, "Arrowhead Stadium", "Kansas City"],
    [101, "2026-07-14", "15:00", "W97", "W98", null, "AT&T Stadium", "Dallas"],
    [102, "2026-07-15", "15:00", "W99", "W100", null, "Mercedes-Benz Stadium", "Atlanta"],
    [103, "2026-07-18", "17:00", "L101", "L102", null, "Hard Rock Stadium", "Miami"],
    [104, "2026-07-19", "15:00", "W101", "W102", null, "MetLife Stadium", "New York/NJ"]
  ];
  var SCHEDULE_UTC_MS = {};
  for (const m of SCHEDULE) {
    const [matchId, dateStr, timeET] = m;
    const [h, min] = timeET.split(":").map(Number);
    SCHEDULE_UTC_MS[matchId] = (/* @__PURE__ */ new Date(dateStr + "T00:00:00Z")).getTime() + (h + 4) * 36e5 + min * 6e4;
  }
  function getRoundLabel(matchId) {
    if (matchId <= 72) return "Group Stage \xB7 Group " + (SCHEDULE[matchId - 1][5] ?? "");
    if (matchId <= 88) return "Round of 32";
    if (matchId <= 96) return "Round of 16";
    if (matchId <= 100) return "Quarter-Finals";
    if (matchId <= 102) return "Semi-Finals";
    if (matchId === 103) return "Third Place Play-off";
    return "FINAL";
  }
  function formatMatchTime(dateStr, timeET) {
    const [h, m] = timeET.split(":").map(Number);
    const utcMs = (/* @__PURE__ */ new Date(dateStr + "T00:00:00Z")).getTime() + (h + 4) * 36e5 + m * 6e4;
    return new Date(utcMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // src/client/state.ts
  var DEADLINE = (/* @__PURE__ */ new Date("2026-06-11T21:00:00Z")).getTime();
  var state = {
    name: "",
    email: "",
    groups: {},
    knockout: {},
    predicted3rd: {},
    locked: false,
    isViewing: false,
    viewingName: "",
    bracketLoaded: false
  };
  function resetGroupsToDefault() {
    Object.entries(GROUPS_DATA).forEach(([g, teams]) => {
      state.groups[g] = teams.map((t) => t.name);
    });
  }
  resetGroupsToDefault();
  var lastSavedAt = null;
  function setLastSavedAt(ts) {
    lastSavedAt = ts;
  }
  function isPastDeadline() {
    return Date.now() >= DEADLINE;
  }
  function isReadOnly() {
    return state.locked || isPastDeadline() || state.isViewing;
  }

  // src/client/api.ts
  async function apiFetch(path, opts) {
    const res = await fetch(path, opts);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error ?? "HTTP " + res.status);
    }
    return res.json();
  }
  async function apiBracketList() {
    const data = await apiFetch("/api/brackets");
    return data.brackets ?? [];
  }
  async function apiBracketGet(email) {
    return apiFetch("/api/brackets/" + encodeURIComponent(email));
  }
  async function apiBracketSave(email, displayName, bracketData, lock) {
    await apiFetch("/api/brackets/" + encodeURIComponent(email), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, bracket_data: bracketData, lock })
    });
  }

  // src/client/utils.ts
  function escHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escJs(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"');
  }
  function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 6e4) return "just now";
    if (diff < 36e5) return Math.floor(diff / 6e4) + "m ago";
    if (diff < 864e5) return Math.floor(diff / 36e5) + "h ago";
    return Math.floor(diff / 864e5) + "d ago";
  }
  var toastTimer;
  function showToast(msg, type = "") {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "show " + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.className = "";
    }, 3e3);
  }

  // src/client/groups.ts
  var dragSrc = null;
  function renderGroups() {
    const grid = document.getElementById("groups-grid");
    const ro = isReadOnly();
    grid.innerHTML = Object.entries(GROUPS_DATA).map(([group]) => {
      const order = state.groups[group] ?? GROUPS_DATA[group].map((t) => t.name);
      return `<div class="group-card" data-group="${group}">
      <div class="group-card-header">Group ${group}</div>
      <div class="group-teams" data-group="${group}">
        ${order.map((name, i) => `
          <div class="team-row${ro ? " readonly" : ""}" ${!ro ? 'draggable="true"' : ""} data-group="${group}" data-team="${escHtml(name)}">
            <div class="rank-badge rank-${i + 1}">${i + 1}</div>
            <div class="team-flag">${getFlagForTeam(name)}</div>
            <div class="team-name">${escHtml(name)}</div>
            ${ro ? "" : `<div class="move-btns">
              ${i > 0 ? `<button class="move-btn" onclick="window.__app.moveTeam(event,'${escJs(group)}','${escJs(name)}',-1)" aria-label="Move up">\u25B2</button>` : '<span class="move-btn-placeholder"></span>'}
              ${i < order.length - 1 ? `<button class="move-btn" onclick="window.__app.moveTeam(event,'${escJs(group)}','${escJs(name)}',1)" aria-label="Move down">\u25BC</button>` : '<span class="move-btn-placeholder"></span>'}
            </div>`}
          </div>
        `).join("")}
      </div>
    </div>`;
    }).join("");
    if (!ro) setupMouseDrag();
  }
  function moveTeam(e, group, name, dir) {
    e.stopPropagation();
    const order = state.groups[group];
    const idx = order.indexOf(name);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= order.length) return;
    order.splice(idx, 1);
    order.splice(newIdx, 0, name);
    state.groups[group] = order;
    state.knockout = {};
    state.predicted3rd = {};
    window.__app.renderAll();
  }
  function setupMouseDrag() {
    document.querySelectorAll(".team-row[draggable]").forEach((row) => {
      row.addEventListener("dragstart", (e) => {
        dragSrc = row;
        row.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("dragging");
        document.querySelectorAll(".team-row").forEach((r) => r.classList.remove("drag-over"));
        dragSrc = null;
      });
      row.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (dragSrc && dragSrc !== row && dragSrc.dataset.group === row.dataset.group) {
          document.querySelectorAll(".team-row").forEach((r) => r.classList.remove("drag-over"));
          row.classList.add("drag-over");
        }
      });
      row.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!dragSrc || dragSrc === row || dragSrc.dataset.group !== row.dataset.group) return;
        const group = row.dataset.group;
        const order = state.groups[group];
        const fromIdx = order.indexOf(dragSrc.dataset.team);
        const toIdx = order.indexOf(row.dataset.team);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;
        order.splice(fromIdx, 1);
        order.splice(toIdx, 0, dragSrc.dataset.team);
        state.groups[group] = order;
        state.knockout = {};
        state.predicted3rd = {};
        window.__app.renderAll();
      });
    });
  }

  // src/client/consensus.ts
  var consensusData = null;
  async function loadConsensus() {
    if (consensusData) return;
    try {
      consensusData = await apiFetch("/api/consensus");
    } catch {
    }
  }
  function getConsensusBadge(roundKey, matchIdx) {
    if (!consensusData) return "";
    const key = roundKey + "_" + matchIdx;
    const picks = consensusData.picks[key];
    const total = consensusData.total_players;
    if (!picks || !total) return "";
    const topTeam = Object.entries(picks).sort((a, b) => b[1] - a[1])[0];
    if (!topTeam) return "";
    const [team, cnt] = topTeam;
    const flag = getFlagForTeam(team);
    return `<div class="consensus-badge">${flag} ${escHtml(team)} \xB7 ${cnt}/${total} picked</div>`;
  }

  // src/client/bracket.ts
  function getGroupTeam(group, pos) {
    return state.groups[group]?.[pos] ?? null;
  }
  function getKnockoutTeam(round, matchIdx, slot) {
    if (round === "r32") {
      const seed = R32_SEEDS[matchIdx]?.[slot];
      if (!seed) return null;
      if ("third" in seed) {
        return state.predicted3rd[matchIdx + "_" + slot] ?? null;
      }
      return getGroupTeam(seed.g, seed.p);
    }
    const prevRound = { r16: "r32", qf: "r16", sf: "qf", final: "sf" };
    const prev = prevRound[round];
    const prevMatchIdx = matchIdx * 2 + slot;
    return state.knockout[prev + "_" + prevMatchIdx] ?? null;
  }
  function getThirdSeed(matchIdx, slot) {
    const seed = R32_SEEDS[matchIdx]?.[slot];
    return !!(seed && "third" in seed);
  }
  function isBracketComplete() {
    return countMissingPicks() === 0;
  }
  function countMissingPicks() {
    let missing = 0;
    for (let i = 0; i < 16; i++) {
      for (let s = 0; s < 2; s++) {
        const seed = R32_SEEDS[i]?.[s];
        if (seed && "third" in seed && !state.predicted3rd[i + "_" + s]) missing++;
      }
    }
    for (const [round, count] of Object.entries(ROUND_COUNTS)) {
      for (let i = 0; i < count; i++) {
        const t1 = getKnockoutTeam(round, i, 0);
        const t2 = getKnockoutTeam(round, i, 1);
        if (t1 && t2 && !state.knockout[round + "_" + i]) missing++;
      }
    }
    return missing;
  }
  function pickWinner(round, matchIdx, team) {
    if (isReadOnly()) return;
    state.knockout[round + "_" + matchIdx] = team;
    clearDownstream(round, matchIdx);
  }
  function pick3rd(matchIdx, slotIdx, team) {
    if (isReadOnly()) return;
    const key = matchIdx + "_" + slotIdx;
    if (team) {
      state.predicted3rd[key] = team;
    } else {
      delete state.predicted3rd[key];
    }
    const prevKnockoutKey = "r32_" + matchIdx;
    if (state.knockout[prevKnockoutKey]) {
      delete state.knockout[prevKnockoutKey];
      clearDownstream("r32", matchIdx);
    }
  }
  function autoPickAll() {
    if (isReadOnly()) return;
    for (let i = 0; i < 16; i++) {
      for (let s = 0; s < 2; s++) {
        const seed = R32_SEEDS[i]?.[s];
        if (!seed || !("third" in seed)) continue;
        const key = i + "_" + s;
        if (state.predicted3rd[key]) continue;
        const candidates = seed.third.map((g) => (state.groups[g] ?? [])[2]).filter(Boolean);
        if (candidates.length) state.predicted3rd[key] = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    for (const round of ["r32", "r16", "qf", "sf", "final"]) {
      const count = ROUND_COUNTS[round];
      for (let i = 0; i < count; i++) {
        if (state.knockout[round + "_" + i]) continue;
        const t1 = getKnockoutTeam(round, i, 0);
        const t2 = getKnockoutTeam(round, i, 1);
        if (t1 && t2) state.knockout[round + "_" + i] = Math.random() < 0.5 ? t1 : t2;
      }
    }
  }
  function clearDownstream(round, matchIdx) {
    const next = { r32: "r16", r16: "qf", qf: "sf", sf: "final" };
    const nextRound = next[round];
    if (!nextRound) return;
    const nextMatch = Math.floor(matchIdx / 2);
    const nextWinner = state.knockout[nextRound + "_" + nextMatch];
    const t0 = getKnockoutTeam(round, matchIdx, 0);
    const t1 = getKnockoutTeam(round, matchIdx, 1);
    if (nextWinner && (nextWinner === t0 || nextWinner === t1)) {
      delete state.knockout[nextRound + "_" + nextMatch];
      clearDownstream(nextRound, nextMatch);
    }
  }
  function renderBracket() {
    const bracket = document.getElementById("bracket");
    const rounds = [
      { key: "r32", label: "Round of 32", count: 16 },
      { key: "r16", label: "Round of 16", count: 8 },
      { key: "qf", label: "Quarter-Finals", count: 4 },
      { key: "sf", label: "Semi-Finals", count: 2 },
      { key: "final", label: "Final", count: 1 }
    ];
    const ro = isReadOnly();
    bracket.innerHTML = rounds.map(({ key, label, count }) => {
      const matches = [];
      for (let i = 0; i < count; i++) {
        const t1 = getKnockoutTeam(key, i, 0);
        const t2 = getKnockoutTeam(key, i, 1);
        const winner = state.knockout[key + "_" + i] ?? null;
        const teamHtml = (team, slotIdx) => {
          if (key === "r32" && getThirdSeed(i, slotIdx)) {
            if (!team) return `<div class="match-team empty" title="Pick this team in section 1.5 above">3rd Place \u2191</div>`;
            const isWinner2 = winner === team;
            const f2 = getFlagForTeam(team);
            const clickable2 = !ro && t1 && t2;
            return `<div class="match-team${isWinner2 ? " winner" : ""}${!clickable2 ? " readonly" : ""}"${clickable2 ? ` onclick="window.__app.pickWinner('${key}',${i},'${escJs(team)}')"` : ""}>${f2} ${escHtml(team)}</div>`;
          }
          if (!team) return `<div class="match-team empty">TBD</div>`;
          const isWinner = winner === team;
          const f = getFlagForTeam(team);
          const clickable = !ro && t1 && t2;
          return `<div class="match-team${isWinner ? " winner" : ""}${!clickable ? " readonly" : ""}"${clickable ? ` onclick="window.__app.pickWinner('${key}',${i},'${escJs(team)}')"` : ""}>${f} ${escHtml(team)}</div>`;
        };
        const consensusBadge = state.isViewing ? "" : getConsensusBadge(key, i);
        matches.push(`<div class="bracket-match">
        ${teamHtml(t1, 0)}
        <div class="match-separator"></div>
        ${teamHtml(t2, 1)}
        ${consensusBadge}
      </div>`);
      }
      return `<div class="bracket-round">
      <div class="round-label">${label}</div>
      <div class="bracket-matches">${matches.join("")}</div>
    </div>`;
    }).join("");
    const champion = state.knockout["final_0"] ?? null;
    bracket.innerHTML += `<div class="bracket-round" style="min-width:160px">
    <div class="round-label">Champion</div>
    <div class="bracket-matches">
      <div class="champion-slot">
        <span class="champion-trophy">\u{1F3C6}</span>
        <div class="champion-name">${champion ? escHtml(getFlagForTeam(champion) + " " + champion) : "?"}</div>
        <div class="champion-label">World Cup 2026 Champions</div>
      </div>
    </div>
  </div>`;
  }
  function renderThirdPlaceSection() {
    const grid = document.getElementById("third-grid");
    if (!grid) return;
    const ro = isReadOnly();
    const slots = [];
    for (let i = 0; i < R32_SEEDS.length; i++) {
      for (let s = 0; s < 2; s++) {
        const seed = R32_SEEDS[i][s];
        if (!seed || !("third" in seed)) continue;
        const other = R32_SEEDS[i][1 - s];
        const opponentLabel = "third" in other ? "Best 3rd Place" : "Winner Group " + other.g + (other.p === 1 ? " Runner-up" : "");
        slots.push({ matchIdx: i, slotIdx: s, groups: seed.third, opponentLabel });
      }
    }
    const usedTeams = new Set(Object.values(state.predicted3rd).filter(Boolean));
    grid.innerHTML = slots.map(({ matchIdx, slotIdx, groups, opponentLabel }) => {
      const key = matchIdx + "_" + slotIdx;
      const picked = state.predicted3rd[key] ?? "";
      const opponentHtml = `<span class="third-slot-opponent">vs <span class="third-slot-vs"></span>${escHtml(opponentLabel)}</span>`;
      let pickHtml;
      if (ro) {
        pickHtml = picked ? `<div class="third-slot-picked">${getFlagForTeam(picked)} ${escHtml(picked)}</div>` : `<div style="color:var(--grey);font-size:0.78rem;font-style:italic;">Not picked</div>`;
      } else {
        const options = groups.map((g) => {
          const team3 = (state.groups[g] ?? [])[2];
          if (!team3) return "";
          const usedElsewhere = usedTeams.has(team3) && team3 !== picked;
          const sel = picked === team3 ? " selected" : "";
          const dis = usedElsewhere ? " disabled" : "";
          const label = usedElsewhere ? `${getFlagForTeam(team3)} ${escHtml(team3)} (already picked)` : `${getFlagForTeam(team3)} ${escHtml(team3)} (3rd, Group ${g})`;
          return `<option value="${escHtml(team3)}"${sel}${dis}>${label}</option>`;
        }).filter(Boolean).join("");
        pickHtml = `<select class="third-slot-pick" onchange="window.__app.pick3rd(${matchIdx},${slotIdx},this.value)">
        <option value="">\u2014 Pick a team \u2014</option>
        ${options}
      </select>`;
      }
      return `<div class="third-slot${picked ? " third-slot--done" : ""}">
      <div class="third-slot-label">Match ${matchIdx + 73} \xB7 Groups ${groups.join("/")}</div>
      ${opponentHtml}
      ${pickHtml}
    </div>`;
    }).join("");
  }
  function renderSaveBar() {
    const bar = document.getElementById("save-bar-inner");
    const hasUser = !!state.email && state.bracketLoaded;
    if (state.isViewing) {
      bar.innerHTML = '<div class="locked-banner">\u{1F441}\uFE0F Viewing another person\u2019s bracket</div>';
      return;
    }
    if (state.locked) {
      bar.innerHTML = '<div class="locked-banner">\u{1F512} Your picks are permanently locked</div>';
      return;
    }
    if (Date.now() >= DEADLINE) {
      bar.innerHTML = '<div class="locked-banner">\u{1F512} Picks are locked \u2014 Tournament has started!</div>';
      return;
    }
    const allDone = hasUser && isBracketComplete();
    const missingCount = hasUser ? countMissingPicks() : 0;
    const confirmTitle = allDone ? "" : missingCount > 0 ? `You still have ${missingCount} pick${missingCount > 1 ? "s" : ""} remaining` : "Complete your bracket first";
    const savedAgo = lastSavedAt ? `<div style="font-size:0.72rem;color:var(--grey);text-align:center;margin-top:6px">Last saved ${timeAgo(lastSavedAt)}</div>` : "";
    bar.innerHTML = `
    <button class="auto-btn" id="btn-auto" ${hasUser ? "" : "disabled"} title="Randomly fill all remaining picks">\u{1F3B2} Auto-Pick</button>
    <button class="save-main-btn" id="btn-save" ${hasUser ? "" : "disabled"}>\u{1F4BE} Save Draft</button>
    <button class="confirm-btn" id="btn-confirm" ${allDone ? "" : "disabled"} title="${escHtml(confirmTitle)}">${allDone ? "\u2705" : "\u{1F512}"} Confirm &amp; Lock</button>
    ${savedAgo}
  `;
    document.getElementById("btn-auto")?.addEventListener("click", () => {
      window.__app.autoPickAll();
    });
    document.getElementById("btn-save")?.addEventListener("click", () => {
      window.__app.handleSave();
    });
    document.getElementById("btn-confirm")?.addEventListener("click", () => {
      if (allDone) window.__app.openModal();
    });
  }
  function updateGroupStageVisibility() {
    const groupSection = document.getElementById("group-stage-section");
    const thirdSection = document.getElementById("third-place-section");
    const knockoutNum = document.getElementById("knockout-num");
    const knockoutSubtitle = document.getElementById("knockout-subtitle");
    if (state.isViewing) {
      groupSection.style.display = "none";
      if (thirdSection) thirdSection.style.display = "none";
      knockoutNum.textContent = "";
      knockoutNum.style.display = "none";
      knockoutSubtitle.textContent = "Read-only view of " + state.viewingName + "\u2019s picks.";
    } else {
      groupSection.style.display = "block";
      if (thirdSection) thirdSection.style.display = "block";
      knockoutNum.style.display = "flex";
      knockoutNum.textContent = "2";
      if (!isReadOnly() && state.bracketLoaded) {
        const missing = countMissingPicks();
        const total = 39;
        const done = total - missing;
        knockoutSubtitle.innerHTML = missing === 0 ? "\u2705 All " + total + " picks made \u2014 ready to confirm!" : `Click a team in each match to advance them. <span style="color:var(--gold);font-weight:700;">${done}/${total} picks made</span>${missing > 0 ? ` \u2014 <span style="color:#f87171;">${missing} remaining</span>` : ""}`;
      } else {
        knockoutSubtitle.textContent = "Click a team in each match to advance them to the next round.";
      }
    }
  }

  // src/client/liveResults.ts
  var liveResults = {};
  var liveResultsLoaded = false;
  async function loadLiveResults() {
    if (liveResultsLoaded) return;
    try {
      const data = await apiFetch("/api/match-results");
      for (const row of data.results ?? []) {
        liveResults[row.match_num] = row;
      }
      liveResultsLoaded = true;
    } catch {
    }
  }
  function getLiveTeams(matchNum) {
    const r = liveResults[matchNum];
    if (!r) return null;
    if (r.home_team && r.away_team) {
      return { home: r.home_team, away: r.away_team, homeScore: r.home_score, awayScore: r.away_score, status: r.status };
    }
    return null;
  }

  // src/client/ticker.ts
  function renderTicker() {
    const ticker = document.getElementById("score-ticker");
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const todayMatches = SCHEDULE.filter((m) => m[1] === todayStr);
    if (!todayMatches.length) {
      ticker.style.display = "none";
      return;
    }
    const items = todayMatches.map((m) => {
      const live = getLiveTeams(m[0]);
      const t1 = live ? live.home : m[3];
      const t2 = live ? live.away : m[4];
      const f1 = getFlagForTeam(t1 ?? "");
      const f2 = getFlagForTeam(t2 ?? "");
      const status = live ? live.status : "TIMED";
      const isLive = status === "IN_PLAY" || status === "PAUSED" || status === "HALFTIME";
      const isDone = status === "FINISHED";
      const scoreStr = live && live.homeScore !== null ? `${live.homeScore}\u2013${live.awayScore}` : formatMatchTime(m[1], m[2]);
      const statusLabel = isLive ? "Live" : isDone ? "Full time" : formatMatchTime(m[1], m[2]) + " ET";
      return `<div class="ticker-item${isLive ? " live" : isDone ? " done" : ""}">
      <div class="ticker-teams">${f1} ${escHtml((t1 ?? "TBD").slice(0, 10))} v ${escHtml((t2 ?? "TBD").slice(0, 10))} ${f2}</div>
      <div class="ticker-score">${isDone || isLive ? escHtml(scoreStr) : "\u2013"}</div>
      <div class="ticker-status${isLive ? " live-dot" : ""}">${escHtml(statusLabel)}</div>
    </div>`;
    }).join("");
    ticker.innerHTML = items;
    ticker.style.display = "flex";
  }

  // src/client/schedule.ts
  var schedulePickCache = {};
  var scorePickCache = {};
  function clearScheduleCache() {
    for (const k in schedulePickCache) delete schedulePickCache[k];
    for (const k in scorePickCache) delete scorePickCache[k];
  }
  async function loadMatchPick(matchId) {
    if (!state.email) return;
    if (schedulePickCache[matchId] === "loading") return;
    schedulePickCache[matchId] = "loading";
    try {
      const data = await apiFetch(
        "/api/live-picks/" + matchId + "?email=" + encodeURIComponent(state.email)
      );
      schedulePickCache[matchId] = data;
      renderMatchCard(matchId);
    } catch {
      schedulePickCache[matchId] = null;
    }
  }
  async function makeMatchPick(matchId, team) {
    if (!state.email) {
      showToast("Load your bracket first to make picks", "error");
      return;
    }
    try {
      const data = await apiFetch(
        "/api/live-picks/" + matchId,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: state.email, team })
        }
      );
      schedulePickCache[matchId] = { picked: team, tally: data.tally };
      renderMatchCard(matchId);
    } catch (e) {
      showToast("Could not save pick: " + (e instanceof Error ? e.message : "error"), "error");
    }
  }
  async function loadScorePick(matchId) {
    if (!state.email) return;
    if (scorePickCache[matchId] === "loading") return;
    scorePickCache[matchId] = "loading";
    try {
      const data = await apiFetch(
        "/api/score-picks/" + matchId + "?email=" + encodeURIComponent(state.email)
      );
      scorePickCache[matchId] = data;
      renderMatchCard(Number(matchId));
    } catch {
      scorePickCache[matchId] = null;
    }
  }
  async function submitScorePick(matchId, homeScore, awayScore) {
    if (!state.email) {
      showToast("Load your bracket first", "error");
      return;
    }
    try {
      const data = await apiFetch(
        "/api/score-picks/" + matchId,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: state.email, home_score: homeScore, away_score: awayScore })
        }
      );
      scorePickCache[matchId] = { myPick: data.myPick, tally: data.tally };
      showToast("\u26BD Score pick saved!", "success");
      renderMatchCard(Number(matchId));
    } catch (e) {
      showToast("Could not save: " + (e instanceof Error ? e.message : "error"), "error");
    }
  }
  function buildScorePickHtml(matchId, canPick) {
    const sp = scorePickCache[matchId];
    const spResolved = sp && sp !== "loading" ? sp : null;
    const hasPick = spResolved?.myPick ?? null;
    const matchUtcMs = SCHEDULE_UTC_MS[Number(matchId)];
    const kickedOff = matchUtcMs ? Date.now() >= matchUtcMs : false;
    if (kickedOff || !canPick) {
      if (hasPick && spResolved?.myPick) {
        const p = spResolved.myPick;
        const tallyRows = (spResolved.tally ?? []).map(
          (r) => `<span style="font-size:0.68rem;color:var(--grey)">${r.home_score}\u2013${r.away_score} (${r.cnt})</span>`
        ).join(", ");
        return `<div class="score-pick-row">\u26BD Your score pick: <strong>${p.home_score}\u2013${p.away_score}</strong>${tallyRows ? " \xB7 group: " + tallyRows : ""}</div>`;
      }
      return "";
    }
    const h = spResolved?.myPick ? spResolved.myPick.home_score : "";
    const a = spResolved?.myPick ? spResolved.myPick.away_score : "";
    return `<div class="score-pick-row">
    <span style="font-size:0.72rem;color:var(--grey);margin-right:6px">\u26BD Score pick:</span>
    <input class="score-input" id="sp-h-${matchId}" type="number" min="0" max="20" value="${h}" placeholder="0" style="width:36px">
    <span style="color:var(--grey);margin:0 4px">\u2013</span>
    <input class="score-input" id="sp-a-${matchId}" type="number" min="0" max="20" value="${a}" placeholder="0" style="width:36px">
    <button class="btn-score-submit" onclick="(function(){
      var h=parseInt(document.getElementById('sp-h-${matchId}').value);
      var a=parseInt(document.getElementById('sp-a-${matchId}').value);
      if(isNaN(h)||isNaN(a))return;
      window.__app.submitScorePick('${matchId}',h,a);
    })()">Save</button>
  </div>`;
  }
  function buildMatchCardInner(m) {
    const [matchId, dateStr, timeET, t1raw, t2raw, , venue, city] = m;
    const cache = schedulePickCache[matchId];
    const picked = cache && cache !== "loading" ? cache.picked : null;
    const tally = cache && cache !== "loading" ? cache.tally : null;
    const live = getLiveTeams(matchId);
    const t1 = live ? live.home : t1raw;
    const t2 = live ? live.away : t2raw;
    const teamsKnown = !!(live ? live.home && live.away : matchId <= 72);
    const isGroupStage = matchId <= 72;
    const timeLocal = formatMatchTime(dateStr, timeET);
    const roundLabel = getRoundLabel(matchId);
    const f1 = teamsKnown ? getFlagForTeam(t1 ?? "") : "";
    const f2 = teamsKnown ? getFlagForTeam(t2 ?? "") : "";
    const canPick = !!state.email && teamsKnown;
    let scoreBadge = "";
    if (live && live.homeScore !== null && live.awayScore !== null) {
      const isLive = live.status === "IN_PLAY" || live.status === "PAUSED" || live.status === "HALFTIME";
      const color = isLive ? "#ef4444" : "var(--gold)";
      scoreBadge = ` <span style="color:${color};font-weight:900;font-size:1rem;margin:0 6px">${live.homeScore}\u2013${live.awayScore}${isLive ? " \u{1F534}" : ""}</span>`;
    }
    let teamsHtml;
    if (!teamsKnown) {
      teamsHtml = `<div class="match-tbd-teams">${escHtml(t1 ?? "")} vs ${escHtml(t2 ?? "")}</div>`;
    } else if (picked) {
      teamsHtml = `<div class="match-card-teams">
      <button class="match-pick-btn${picked === t1 ? " picked" : ""}" disabled>${f1} ${escHtml(t1 ?? "")}</button>
      <div class="match-vs">VS</div>
      <button class="match-pick-btn${picked === t2 ? " picked" : ""}" disabled>${f2} ${escHtml(t2 ?? "")}</button>
    </div>`;
    } else {
      teamsHtml = `<div class="match-card-teams">
      <button class="match-pick-btn" ${canPick ? `onclick="window.__app.makeMatchPick(${matchId},'${escJs(t1 ?? "")}')"` : "disabled"}>${f1} ${escHtml(t1 ?? "")}</button>
      <div class="match-vs">VS</div>
      <button class="match-pick-btn" ${canPick ? `onclick="window.__app.makeMatchPick(${matchId},'${escJs(t2 ?? "")}')"` : "disabled"}>${f2} ${escHtml(t2 ?? "")}</button>
    </div>`;
    }
    let tallyHtml = "";
    if (picked && tally && tally.length) {
      const total = tally.reduce((s, r) => s + Number(r.cnt), 0);
      const bars = [t1, t2].map((team) => {
        const row = tally.find((r) => r.team === team);
        const cnt = row ? Number(row.cnt) : 0;
        const pct = total ? Math.round(cnt / total * 100) : 0;
        const isPicked = picked === team;
        const flag = teamsKnown ? getFlagForTeam(team ?? "") : "";
        return `<div class="tally-bar-wrap">
        <div class="tally-label">${flag} ${escHtml(team ?? "")}${isPicked ? " \u2713" : ""}</div>
        <div class="tally-bar-outer"><div class="tally-bar-inner" style="width:${pct}%"></div></div>
        <div class="tally-count">${cnt}</div>
      </div>`;
      }).join("");
      tallyHtml = `<div class="match-tally visible">${bars}<div class="tally-total">${total} pick${total !== 1 ? "s" : ""} in your group</div></div>`;
    }
    const scorePickHtml = isGroupStage && teamsKnown ? buildScorePickHtml(String(matchId), canPick) : "";
    const isLive2 = live && (live.status === "IN_PLAY" || live.status === "PAUSED" || live.status === "HALFTIME");
    const isFinished = live && live.status === "FINISHED";
    let matchDetailTrigger = "";
    if (isLive2 || isFinished) {
      const label = isFinished ? "\u{1F4CB} Match summary" : "\u{1F534} Live updates";
      matchDetailTrigger = `<button class="btn-match-detail" onclick="window.__app.toggleMatchDetail(${matchId})">${label}</button>
    <div id="match-detail-${matchId}" class="match-detail-panel" style="display:none"></div>`;
    }
    return `<div class="match-card-meta">
    <span>${escHtml(roundLabel)}${scoreBadge}</span>
    <span>${timeLocal} ET \xB7 ${escHtml(venue)}, ${escHtml(city)}</span>
  </div>
  ${teamsHtml}
  ${tallyHtml}
  ${scorePickHtml}
  ${matchDetailTrigger}`;
  }
  function renderMatchCard(matchId) {
    const el = document.getElementById("match-card-" + matchId);
    if (!el) return;
    const m = SCHEDULE.find((x) => x[0] === matchId);
    if (!m) return;
    el.innerHTML = buildMatchCardInner(m);
  }
  async function renderSchedule() {
    const container = document.getElementById("schedule-days");
    const loginNotice = document.getElementById("schedule-login-notice");
    loginNotice.style.display = state.email ? "none" : "block";
    await loadLiveResults();
    const byDate = {};
    for (const m of SCHEDULE) {
      const d = m[1];
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(m);
    }
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    container.innerHTML = Object.entries(byDate).map(([date, matches]) => {
      const isToday = date === todayStr;
      const dateLabel = (/* @__PURE__ */ new Date(date + "T12:00:00Z")).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
      const anchorId = isToday ? 'id="today-anchor"' : "";
      const todayBadge = isToday ? '<span class="today-badge">TODAY</span>' : "";
      let lastRound = null;
      const cardsHtml = matches.map((m) => {
        const round = getRoundLabel(m[0]);
        const roundHeader = round !== lastRound ? `<div class="schedule-round-label">${escHtml(round)}</div>` : "";
        lastRound = round;
        return roundHeader + `<div class="match-card${isToday ? " today-match" : ""}" id="match-card-${m[0]}">${buildMatchCardInner(m)}</div>`;
      }).join("");
      return `<div class="schedule-day" ${anchorId}>
      <div class="schedule-day-header">${escHtml(dateLabel)} ${todayBadge}</div>
      ${cardsHtml}
    </div>`;
    }).join("");
    if (state.email) {
      for (const m of SCHEDULE) {
        if (m[0] <= 72) {
          if (!schedulePickCache[m[0]]) loadMatchPick(m[0]);
          if (!scorePickCache[String(m[0])]) loadScorePick(String(m[0]));
        }
      }
    }
  }
  var schedulePollTimer;
  function startSchedulePolling() {
    if (schedulePollTimer) return;
    schedulePollTimer = setInterval(async () => {
      await loadLiveResults();
      renderSchedule();
    }, 60 * 1e3);
  }
  function stopSchedulePolling() {
    if (schedulePollTimer) {
      clearInterval(schedulePollTimer);
      schedulePollTimer = void 0;
    }
  }
  async function toggleMatchDetail(matchId) {
    const panel = document.getElementById("match-detail-" + matchId);
    if (!panel) return;
    if (panel.style.display !== "none") {
      panel.style.display = "none";
      return;
    }
    panel.innerHTML = '<div style="color:var(--grey);font-size:0.78rem;padding:8px 0">Loading...</div>';
    panel.style.display = "block";
    try {
      const data = await apiFetch("/api/match-events/" + matchId);
      const { events, match } = data;
      const ht = match && match.home_score_ht !== null ? `HT: ${match.home_score_ht}\u2013${match.away_score_ht}` : "";
      let html = "";
      if (match && match.status === "FINISHED") {
        html += `<div class="match-summary-header">Full time${ht ? " \xB7 " + ht : ""}</div>`;
      } else {
        html += `<div class="match-summary-header" style="color:#ef4444">\u{1F534} Live ${ht ? "\xB7 HT: " + ht : ""}</div>`;
      }
      if (events && events.length) {
        html += events.map((e) => {
          const t = new Date(e.detected_at);
          const timeStr = t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          return `<div class="goal-event">\u26BD ${e.home_score}\u2013${e.away_score} <span style="color:var(--grey);font-size:0.68rem">(detected ~${timeStr})</span></div>`;
        }).join("");
      } else {
        html += '<div style="color:var(--grey);font-size:0.78rem">No score changes detected yet</div>';
      }
      panel.innerHTML = html;
    } catch {
      panel.innerHTML = '<div style="color:#f87171;font-size:0.78rem">Could not load match detail</div>';
    }
  }

  // src/client/goldenBoot.ts
  var GB_PLAYERS = [
    "Kylian Mbapp\xE9",
    "Lionel Messi",
    "Erling Haaland",
    "Vinicius Jr.",
    "Neymar Jr.",
    "Harry Kane",
    "Lamine Yamal",
    "Bukayo Saka",
    "Phil Foden",
    "Jude Bellingham",
    "Robert Lewandowski",
    "Mohamed Salah",
    "Sadio Man\xE9",
    "Romelu Lukaku",
    "Leroy San\xE9",
    "Karim Benzema",
    "Antoine Griezmann",
    "Olivier Giroud",
    "Raheem Sterling",
    "Marcus Rashford",
    "Richarlison",
    "Raphinha",
    "Rodrygo",
    "Federico Valverde",
    "Lautaro Mart\xEDnez",
    "Paulo Dybala",
    "Victor Osimhen",
    "Riyad Mahrez",
    "Hakim Ziyech",
    "Achraf Hakimi",
    "Son Heung-min",
    "Hwang Hee-chan",
    "Takumi Minamino",
    "Daichi Kamada",
    "Ritsu Doan",
    "Gavi",
    "Pedri",
    "Dani Olmo",
    "\xC1lvaro Morata",
    "Serge Gnabry",
    "Thomas M\xFCller",
    "Kai Havertz",
    "Jamal Musiala",
    "Ricardo Horta",
    "Cristiano Ronaldo",
    "Rafael Le\xE3o",
    "Diogo Jota",
    "Bruno Fernandes",
    "Memphis Depay",
    "Cody Gakpo",
    "Xavi Simons",
    "Denzel Dumfries",
    "Wout Weghorst",
    "Darwin N\xFA\xF1ez",
    "Luis Su\xE1rez",
    "Jonathan David",
    "Alphonso Davies",
    "Jonathan Osorio",
    "Cyle Larin",
    "Junior Hoilett",
    "Christian Pulisic",
    "Timothy Weah",
    "Gio Reyna",
    "Folarin Balogun",
    "Ricardo Pepi"
  ];
  var gbCurrentPick = null;
  function setGbCurrentPick(name) {
    gbCurrentPick = name;
  }
  function filterGbPlayers(q) {
    const box = document.getElementById("gb-suggestions");
    if (!q.trim()) {
      box.style.display = "none";
      return;
    }
    const results = GB_PLAYERS.filter((p) => p.toLowerCase().includes(q.toLowerCase())).slice(0, 8);
    if (!results.length) {
      box.style.display = "none";
      return;
    }
    box.innerHTML = results.map(
      (p) => `<div class="gb-option" onclick="window.__app.selectGbPlayer('${escJs(p)}')">${escHtml(p)}</div>`
    ).join("");
    box.style.display = "block";
  }
  async function selectGbPlayer(name) {
    document.getElementById("gb-input").value = name;
    document.getElementById("gb-suggestions").style.display = "none";
    if (!state.email || isReadOnly()) return;
    try {
      await apiFetch("/api/golden-boot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, player_name: name })
      });
      gbCurrentPick = name;
      updateGbDisplay();
      showToast("\u{1F49B} Golden Boot pick saved: " + name, "success");
    } catch {
      showToast("Could not save pick", "error");
    }
  }
  function updateGbDisplay() {
    const el = document.getElementById("gb-current");
    const section = document.getElementById("golden-boot-section");
    if (!state.email || !state.bracketLoaded || state.isViewing) {
      section.style.display = "none";
      return;
    }
    section.style.display = "block";
    if (gbCurrentPick) {
      const ro = isReadOnly();
      el.innerHTML = `\u{1F4C2} Your pick: <strong style="color:var(--gold)">${escHtml(gbCurrentPick)}</strong>${ro ? " (locked)" : ""}`;
      if (ro) {
        document.getElementById("gb-input").disabled = true;
      }
    } else {
      el.textContent = isReadOnly() ? "No pick made before deadline" : "Start typing to search for a player";
    }
  }

  // src/client/leaderboard.ts
  var lbData = null;
  var lbPollTimer;
  async function fetchLeaderboard() {
    try {
      const [lb, consensus, resultsData] = await Promise.all([
        apiFetch("/api/leaderboard"),
        apiFetch("/api/consensus").catch(() => null),
        apiFetch("/api/match-results").catch(() => null)
      ]);
      lbData = lb;
      renderLeaderboard();
      if (lb.has_any_finished) {
        renderScoreGraph();
        if (consensus) renderConsensusInsights(consensus);
        if (consensus && resultsData) checkForUpsets(consensus, resultsData.results);
        if (resultsData) {
          const finalMatch = resultsData.results.find((r) => r.match_num === 104 && r.status === "FINISHED");
          if (finalMatch) renderHallOfFame();
        }
      } else {
        const sg = document.getElementById("score-graph-container");
        const ci = document.getElementById("consensus-insights-container");
        const ua = document.getElementById("upset-alert-container");
        if (sg) sg.innerHTML = "";
        if (ci) ci.innerHTML = "";
        if (ua) ua.innerHTML = "";
      }
    } catch {
      document.getElementById("leaderboard-content").innerHTML = '<div class="lb-empty">Could not load leaderboard. Try again shortly.</div>';
    }
  }
  function startLeaderboard() {
    fetchLeaderboard();
    lbPollTimer = setInterval(fetchLeaderboard, 2 * 60 * 1e3);
  }
  function stopLeaderboard() {
    if (lbPollTimer) {
      clearInterval(lbPollTimer);
      lbPollTimer = void 0;
    }
  }
  var ROUND_PTS_LB = { r32: 2, r16: 3, qf: 4, sf: 5, final: 8 };
  function renderLeaderboard() {
    const container = document.getElementById("leaderboard-content");
    if (!lbData) return;
    const { leaderboard, has_any_finished, updated_at } = lbData;
    const meEntry = leaderboard.find((e) => e.email === state.email);
    if (meEntry && meEntry.golden_boot_pick && !gbCurrentPick) {
      const gbInput = document.getElementById("gb-input");
      if (gbInput) gbInput.value = meEntry.golden_boot_pick;
      updateGbDisplay();
    }
    const ago = Math.round((Date.now() - updated_at) / 6e4);
    const agoText = ago < 1 ? "just now" : ago + " min ago";
    if (!has_any_finished) {
      container.innerHTML = `
      <div class="lb-meta">
        <span>Updated ${escHtml(agoText)}</span>
        <button class="lb-refresh-btn" onclick="window.__app.fetchLeaderboard()">\u21BB Refresh</button>
      </div>
      <div class="lb-empty">
        \u26BD The tournament is underway!<br>Check back once the first match finishes to see rankings.
      </div>`;
      return;
    }
    const rankIcon = (r) => r === 1 ? "\u{1F947}" : r === 2 ? "\u{1F948}" : r === 3 ? "\u{1F949}" : String(r);
    const meEmail = state.email ?? "";
    const rows = leaderboard.map((e) => {
      const isMe = e.email === meEmail;
      const rankClass = e.rank <= 3 ? ` rank-${e.rank}` : "";
      const gbBadge = e.golden_boot_pick ? `<span style="font-size:0.65rem;color:var(--grey)">\u26BD ${escHtml(e.golden_boot_pick)}</span>` : "";
      const compareBtn = !isMe && meEmail ? `<button class="btn-h2h" onclick="event.stopPropagation();window.__app.openH2H('${escJs(e.email)}','${escJs(e.display_name)}')" title="Compare brackets">\u2694\uFE0F</button>` : "";
      return `<div class="lb-row${isMe ? " lb-me" : ""}" onclick="window.__app.loadOtherBracketFromEmail('${escJs(e.email)}','${escJs(e.display_name)}')">
      <div class="lb-rank${rankClass}">${rankIcon(e.rank)}</div>
      <div style="flex:1;min-width:0">
        <div class="lb-name">${escHtml(e.display_name)} ${isMe ? '<span class="lb-you-badge">YOU</span>' : ""}</div>
        <div class="lb-detail">${e.correct_knockout} correct knock. picks${e.group_score ? " \xB7 " + e.group_score + " group pts" : ""}</div>
        ${gbBadge}
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:4px">
        <div class="lb-score">${e.score} pts</div>
        ${compareBtn}
      </div>
    </div>`;
    }).join("");
    let myPicksHtml = "";
    const me = leaderboard.find((e) => e.email === meEmail);
    if (me && me.picks.length) {
      const pickRows = me.picks.map((p) => {
        const icon = p.correct === true ? "\u2705" : p.correct === false ? "\u274C" : "\u23F3";
        const cls = p.correct === true ? "pick-correct" : p.correct === false ? "pick-wrong" : "";
        const actualText = p.correct === false && p.actual ? ` \u2192 actually ${escHtml(getFlagForTeam(p.actual))} ${escHtml(p.actual)}` : "";
        return `<div class="pick-row ${cls}">
        <span class="pick-icon">${icon}</span>
        <span class="pick-round">${escHtml(ROUND_LABELS_SHORT[p.round] ?? p.round)}</span>
        <span class="pick-team">${escHtml(getFlagForTeam(p.predicted))} ${escHtml(p.predicted)}</span>
        <span class="pick-actual">${actualText}</span>
      </div>`;
      }).join("");
      const scorePickLine = me.score_pick_score > 0 ? `<div class="pick-row pick-correct"><span class="pick-icon">\u2705</span><span class="pick-round">SCORE</span><span class="pick-team">+${me.score_pick_score} pts from score picks</span><span class="pick-actual"></span></div>` : "";
      const gbLine = me.golden_boot_pick ? `<div class="pick-row ${me.golden_boot_score > 0 ? "pick-correct" : ""}">
          <span class="pick-icon">${me.golden_boot_score > 0 ? "\u2705" : "\u26BD"}</span>
          <span class="pick-round">GB</span>
          <span class="pick-team">${escHtml(me.golden_boot_pick)} ${me.golden_boot_score > 0 ? "(+5 pts!)" : ""}</span>
          <span class="pick-actual">${lbData.actual_top_scorer && me.golden_boot_pick !== lbData.actual_top_scorer ? "\u2192 currently " + escHtml(lbData.actual_top_scorer) : ""}</span>
        </div>` : "";
      myPicksHtml = `<div class="my-picks-section">
      <div class="my-picks-title">Your picks breakdown</div>
      ${pickRows}
      ${scorePickLine}
      ${gbLine}
    </div>`;
    }
    let whoCalledHtml = "";
    if (has_any_finished) {
      const matchCallers = {};
      for (const entry of leaderboard) {
        for (const p of entry.picks ?? []) {
          if (p.correct !== true) continue;
          if (!matchCallers[p.matchNum]) {
            matchCallers[p.matchNum] = { round: p.round, predicted: p.predicted, names: [] };
          }
          matchCallers[p.matchNum].names.push(entry.display_name);
        }
      }
      const calloutRows = Object.entries(matchCallers).sort((a, b) => Number(b[0]) - Number(a[0])).slice(0, 8).map(([mn, info]) => {
        const { round, predicted, names } = info;
        const flag = getFlagForTeam(predicted);
        const pts = ROUND_PTS_LB[round] ?? 0;
        const nameStr = names.length <= 3 ? names.join(", ") : names.slice(0, 3).join(", ") + " +" + (names.length - 3) + " more";
        return `<div class="who-called-row">\u{1F389} ${escHtml(flag)} <strong>${escHtml(predicted)}</strong> (Match ${mn} \xB7 ${escHtml(ROUND_LABELS_SHORT[round] ?? round)} \xB7 +${pts} pts) \u2014 ${escHtml(nameStr)}</div>`;
      }).join("");
      if (calloutRows) {
        whoCalledHtml = `<div class="who-called-section"><div class="my-picks-title" style="margin-top:24px">Who called it?</div>${calloutRows}</div>`;
      }
    }
    const shareBtn = `<button class="lb-refresh-btn" onclick="window.__app.copyStandings()" style="margin-left:8px">\u{1F4CB} Copy standings</button>`;
    container.innerHTML = `
    <div class="lb-meta">
      <span>Updated ${escHtml(agoText)}</span>
      <div style="display:flex;gap:6px">
        <button class="lb-refresh-btn" onclick="window.__app.fetchLeaderboard()">\u21BB Refresh</button>
        ${shareBtn}
      </div>
    </div>
    ${rows}
    ${whoCalledHtml}
    ${myPicksHtml}`;
  }
  async function openH2H(theirEmail, theirName) {
    const modal = document.getElementById("h2h-modal");
    const content = document.getElementById("h2h-content");
    const title = document.getElementById("h2h-title");
    modal.style.display = "flex";
    title.textContent = "You vs " + theirName;
    content.innerHTML = '<div style="color:var(--grey);font-size:0.85rem;padding:12px 0">Loading...</div>';
    try {
      const [myData, theirData] = await Promise.all([
        apiFetch("/api/brackets/" + encodeURIComponent(state.email)),
        apiFetch("/api/brackets/" + encodeURIComponent(theirEmail))
      ]);
      const myKo = JSON.parse(myData.bracket.bracket_data).knockout ?? {};
      const thKo = JSON.parse(theirData.bracket.bracket_data).knockout ?? {};
      const ROUNDS_H2H = [
        { key: "r32", label: "Round of 32", count: 16 },
        { key: "r16", label: "Round of 16", count: 8 },
        { key: "qf", label: "Quarter-Finals", count: 4 },
        { key: "sf", label: "Semi-Finals", count: 2 },
        { key: "final", label: "Final", count: 1 }
      ];
      let html = '<table class="h2h-table"><thead><tr><th>You</th><th>Round</th><th>' + escHtml(theirName) + "</th></tr></thead><tbody>";
      let agreeCount = 0, diffCount = 0;
      for (const { key, label, count } of ROUNDS_H2H) {
        html += `<tr><td colspan="3" class="h2h-round-header">${label}</td></tr>`;
        for (let i = 0; i < count; i++) {
          const myPick = myKo[key + "_" + i] ?? "\u2014";
          const thPick = thKo[key + "_" + i] ?? "\u2014";
          const agree = myPick !== "\u2014" && thPick !== "\u2014" && myPick === thPick;
          const differ = myPick !== "\u2014" && thPick !== "\u2014" && myPick !== thPick;
          if (agree) agreeCount++;
          if (differ) diffCount++;
          const cls = agree ? "h2h-agree" : differ ? "h2h-diff" : "";
          const myF = getFlagForTeam(myPick);
          const thF = getFlagForTeam(thPick);
          html += `<tr class="${cls}">
          <td>${myF ? myF + " " : ""}${escHtml(myPick)}</td>
          <td class="h2h-match-name">${agree ? "\u2713" : differ ? "\u26A1" : ""}</td>
          <td>${thF ? thF + " " : ""}${escHtml(thPick)}</td>
        </tr>`;
        }
      }
      html += "</tbody></table>";
      html += `<div style="margin-top:14px;font-size:0.8rem;color:var(--grey)">
      <span style="color:#4ade80">\u2713 ${agreeCount} in common</span> &nbsp;
      <span style="color:#fb923c">\u26A1 ${diffCount} different</span>
    </div>`;
      content.innerHTML = html;
    } catch (e) {
      content.innerHTML = '<div style="color:#f87171;font-size:0.85rem">Could not load comparison: ' + escHtml(e instanceof Error ? e.message : "error") + "</div>";
    }
  }
  function closeH2H() {
    document.getElementById("h2h-modal").style.display = "none";
  }
  var GRAPH_COLORS = [
    "#f5c518",
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#a855f7",
    "#ec4899",
    "#14b8a6",
    "#ef4444",
    "#84cc16",
    "#06b6d4",
    "#8b5cf6",
    "#fb923c"
  ];
  function renderScoreGraph() {
    const container = document.getElementById("score-graph-container");
    if (!container || !lbData || !lbData.has_any_finished) {
      if (container) container.innerHTML = "";
      return;
    }
    const { leaderboard } = lbData;
    if (!leaderboard.length) return;
    const allMatchNums = Array.from(new Set(
      leaderboard.flatMap((e) => e.picks.filter((p) => p.correct !== null).map((p) => p.matchNum))
    )).sort((a, b) => a - b);
    if (!allMatchNums.length) return;
    const ROUND_PTS = { r32: 2, r16: 3, qf: 4, sf: 5, final: 8 };
    const series = leaderboard.map((e, idx) => {
      const pickMap = {};
      for (const p of e.picks) {
        if (p.correct === true) pickMap[p.matchNum] = true;
      }
      let cum = 0;
      const points = allMatchNums.map((mn) => {
        const pick = e.picks.find((p) => p.matchNum === mn);
        if (pick?.correct === true) cum += ROUND_PTS[pick.round] ?? 0;
        return cum;
      });
      return { name: e.display_name, email: e.email, points, color: GRAPH_COLORS[idx % GRAPH_COLORS.length] };
    });
    const W = Math.min(container.clientWidth || 700, 900);
    const H = 200;
    const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
    const gW = W - PAD.left - PAD.right;
    const gH = H - PAD.top - PAD.bottom;
    const maxScore = Math.max(...series.flatMap((s) => s.points), 1);
    const xScale = (i) => PAD.left + i / Math.max(allMatchNums.length - 1, 1) * gW;
    const yScale = (v) => PAD.top + gH - v / maxScore * gH;
    const meEmail = state.email;
    const paths = series.map((s) => {
      const isMe = s.email === meEmail;
      const d = s.points.map((v, i) => (i === 0 ? "M" : "L") + xScale(i).toFixed(1) + "," + yScale(v).toFixed(1)).join(" ");
      return `<path d="${d}" fill="none" stroke="${isMe ? "var(--gold)" : s.color}" stroke-width="${isMe ? 3 : 1.5}" opacity="${isMe ? 1 : 0.55}" class="graph-line" data-name="${escHtml(s.name)}"/>`;
    }).join("");
    const yLabels = [0, Math.round(maxScore / 2), maxScore].map(
      (v) => `<text x="${PAD.left - 4}" y="${yScale(v).toFixed(1)}" text-anchor="end" dominant-baseline="middle" fill="var(--grey)" font-size="10">${v}</text>`
    ).join("");
    const xLabel = `<text x="${PAD.left + gW / 2}" y="${H - 4}" text-anchor="middle" fill="var(--grey)" font-size="10">${allMatchNums.length} match${allMatchNums.length !== 1 ? "es" : ""} played</text>`;
    const legendItems = series.map((s) => {
      const isMe = s.email === meEmail;
      return `<span class="graph-legend-item"><svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke="${isMe ? "var(--gold)" : s.color}" stroke-width="${isMe ? 3 : 1.5}"/></svg>${escHtml(s.name)}${isMe ? " (you)" : ""}</span>`;
    }).join("");
    container.innerHTML = `
    <div class="graph-section">
      <div class="my-picks-title" style="margin-bottom:12px">Score race</div>
      <div class="graph-wrap">
        <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">
          <line x1="${PAD.left}" y1="${PAD.top}" x2="${PAD.left}" y2="${PAD.top + gH}" stroke="var(--border)" stroke-width="1"/>
          <line x1="${PAD.left}" y1="${PAD.top + gH}" x2="${PAD.left + gW}" y2="${PAD.top + gH}" stroke="var(--border)" stroke-width="1"/>
          ${yLabels}
          ${xLabel}
          ${paths}
        </svg>
      </div>
      <div class="graph-legend">${legendItems}</div>
    </div>`;
  }
  function renderConsensusInsights(consensus) {
    const container = document.getElementById("consensus-insights-container");
    if (!container) return;
    const { total_players, picks } = consensus;
    if (!total_players) {
      container.innerHTML = "";
      return;
    }
    const finalPicks = picks["final_0"] ?? {};
    const sortedChampion = Object.entries(finalPicks).sort((a, b) => b[1] - a[1]);
    let championHtml = "";
    if (sortedChampion.length) {
      const bars = sortedChampion.map(([team, cnt]) => {
        const pct = Math.round(cnt / total_players * 100);
        const isMe = state.knockout?.["final_0"] === team;
        return `<div class="consensus-bar-row">
        <span class="consensus-bar-label">${getFlagForTeam(team)} ${escHtml(team)}${isMe ? ' <span class="lb-you-badge">you</span>' : ""}</span>
        <div class="consensus-bar-track"><div class="consensus-bar-fill" style="width:${pct}%"></div></div>
        <span class="consensus-bar-pct">${cnt}/${total_players}</span>
      </div>`;
      }).join("");
      championHtml = `<div class="consensus-subsection"><div class="consensus-sub-title">\u{1F3C6} Champion picks</div>${bars}</div>`;
    }
    let contrarianHtml = "";
    let mostSplit = 0;
    let splitKey = "";
    let splitTeam = "";
    let splitCnt = 0;
    for (const [key, teamMap] of Object.entries(picks)) {
      const total = Object.values(teamMap).reduce((a, b) => a + b, 0);
      if (total < 2) continue;
      for (const [team, cnt] of Object.entries(teamMap)) {
        const pct = cnt / total;
        const splitness = 1 - Math.abs(0.5 - pct) * 2;
        if (splitness > mostSplit) {
          mostSplit = splitness;
          splitKey = key;
          splitTeam = team;
          splitCnt = cnt;
        }
      }
    }
    if (splitKey && mostSplit > 0.6) {
      const [round, idxStr] = splitKey.split("_");
      const roundLabel = ROUND_LABELS_SHORT[round] ?? round;
      const otherEntries = Object.entries(picks[splitKey]).filter(([t]) => t !== splitTeam);
      const otherTeam = otherEntries.sort((a, b) => b[1] - a[1])[0];
      const pct = Math.round(splitCnt / total_players * 100);
      contrarianHtml = `<div class="consensus-subsection">
      <div class="consensus-sub-title">\u26A1 Most debated pick (${roundLabel} match ${Number(idxStr) + 1})</div>
      <div class="consensus-split-text">
        ${getFlagForTeam(splitTeam)} <strong>${escHtml(splitTeam)}</strong> \u2014 ${splitCnt}/${total_players} (${pct}%)
        ${otherTeam ? ` vs ${getFlagForTeam(otherTeam[0])} <strong>${escHtml(otherTeam[0])}</strong> \u2014 ${otherTeam[1]}/${total_players}` : ""}
      </div>
    </div>`;
    }
    let agreesHtml = "";
    if (state.email && state.knockout?.["final_0"]) {
      const myChamp = state.knockout["final_0"];
      const agreedCnt = finalPicks[myChamp] ?? 0;
      const others = agreedCnt - 1;
      if (others >= 0) {
        agreesHtml = `<div class="consensus-subsection">
        <div class="consensus-sub-title">\u{1F91D} Your champion: ${getFlagForTeam(myChamp)} ${escHtml(myChamp)}</div>
        <div class="consensus-split-text">${others === 0 ? "Only you picked this! Bold call." : others === 1 ? "1 other person agrees with you." : others + " others agree with you."}</div>
      </div>`;
      }
    }
    if (!championHtml && !contrarianHtml && !agreesHtml) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = `<div class="consensus-section">
    <div class="my-picks-title" style="margin-bottom:12px">Group consensus</div>
    ${championHtml}
    ${contrarianHtml}
    ${agreesHtml}
  </div>`;
  }
  var KNOCKOUT_MATCH_NUMS = {
    r32: Array.from({ length: 16 }, (_, i) => 73 + i),
    r16: Array.from({ length: 8 }, (_, i) => 89 + i),
    qf: Array.from({ length: 4 }, (_, i) => 97 + i),
    sf: Array.from({ length: 2 }, (_, i) => 101 + i),
    final: [104]
  };
  function matchNumToRoundKey(mn) {
    for (const [r, nums] of Object.entries(KNOCKOUT_MATCH_NUMS)) {
      if (nums.includes(mn)) return r;
    }
    return "";
  }
  function checkForUpsets(consensus, results) {
    const container = document.getElementById("upset-alert-container");
    if (!container) return;
    const { total_players, picks } = consensus;
    if (!total_players) return;
    const dismissed = JSON.parse(sessionStorage.getItem("wc26_upsets_dismissed") ?? "[]");
    const upsets = [];
    for (const match of results) {
      if (match.status !== "FINISHED" || !match.home_team || !match.away_team) continue;
      const mn = match.match_num;
      if (mn < 73) continue;
      if (dismissed.includes(mn)) continue;
      const roundKey = matchNumToRoundKey(mn);
      if (!roundKey) continue;
      const matchIdx = KNOCKOUT_MATCH_NUMS[roundKey].indexOf(mn);
      if (matchIdx === -1) continue;
      const pickKey = roundKey + "_" + matchIdx;
      const teamPicks = picks[pickKey] ?? {};
      const winner = Object.entries(teamPicks).sort((a, b) => b[1] - a[1])[0];
      if (!winner) continue;
      const actualWinner = match.home_score !== null && match.away_score !== null ? match.home_score > match.away_score ? match.home_team : match.away_team : null;
      if (!actualWinner) continue;
      const calledBy = teamPicks[actualWinner] ?? 0;
      const pct = calledBy / total_players;
      if (pct < 0.33) {
        const loser = actualWinner === match.home_team ? match.away_team : match.home_team;
        upsets.push({ matchNum: mn, winner: actualWinner, loser, calledBy, pct });
      }
    }
    if (!upsets.length) {
      container.innerHTML = "";
      return;
    }
    const html = upsets.map((u) => {
      const pctStr = Math.round(u.pct * 100) + "%";
      return `<div class="upset-alert" data-match="${u.matchNum}">
      <span class="upset-emoji">\u{1F631}</span>
      <span class="upset-text">Upset! ${getFlagForTeam(u.winner)} <strong>${escHtml(u.winner)}</strong> beat ${getFlagForTeam(u.loser)} ${escHtml(u.loser)} \u2014 only ${u.calledBy}/${total_players} (${pctStr}) of your group called it!</span>
      <button class="upset-dismiss" onclick="window.__app.dismissUpset(${u.matchNum})">\u2715</button>
    </div>`;
    }).join("");
    container.innerHTML = html;
  }
  function dismissUpset(matchNum) {
    const dismissed = JSON.parse(sessionStorage.getItem("wc26_upsets_dismissed") ?? "[]");
    if (!dismissed.includes(matchNum)) dismissed.push(matchNum);
    sessionStorage.setItem("wc26_upsets_dismissed", JSON.stringify(dismissed));
    const el = document.querySelector(`.upset-alert[data-match="${matchNum}"]`);
    if (el) el.remove();
  }
  function renderHallOfFame() {
    if (!lbData || !lbData.leaderboard.length) return;
    const hof = document.getElementById("hof-container");
    if (!hof) return;
    const winner = lbData.leaderboard[0];
    const podium = lbData.leaderboard.slice(0, 3);
    const champion = winner.picks.find((p) => p.round === "final" && p.correct);
    const champTeam = champion ? champion.predicted : winner.picks.find((p) => p.round === "final")?.predicted ?? "?";
    const podiumHtml = podium.map((e, i) => {
      const medal = i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : "\u{1F949}";
      const isMe = e.email === state.email;
      return `<div class="hof-podium-item hof-podium-${i + 1}">
      <div class="hof-medal">${medal}</div>
      <div class="hof-podium-name">${escHtml(e.display_name)}${isMe ? ' <span class="lb-you-badge">YOU</span>' : ""}</div>
      <div class="hof-podium-score">${e.score} pts</div>
      <div class="hof-podium-detail">${e.correct_knockout} correct picks</div>
    </div>`;
    }).join("");
    hof.innerHTML = `
    <div class="hof-card">
      <div class="hof-header">
        <div class="hof-trophy">\u{1F3C6}</div>
        <div>
          <div class="hof-title">Hall of Fame</div>
          <div class="hof-subtitle">FIFA World Cup 2026 \u2014 Final Standings</div>
        </div>
      </div>
      <div class="hof-champion">
        <div class="hof-champion-label">Tournament Winner</div>
        <div class="hof-champion-name">${escHtml(winner.display_name)}</div>
        <div class="hof-champion-stats">
          ${escHtml(String(winner.score))} pts
          ${champTeam !== "?" ? " \xB7 Picked \u{1F3C6} " + escHtml(getFlagForTeam(champTeam)) + " " + escHtml(champTeam) : ""}
          ${lbData.actual_top_scorer ? " \xB7 \u26BD " + (winner.golden_boot_score > 0 ? "\u2705 GB correct!" : escHtml(lbData.actual_top_scorer) + " top scorer") : ""}
        </div>
      </div>
      <div class="hof-podium">${podiumHtml}</div>
      <div class="hof-actions">
        <button class="lb-refresh-btn" onclick="window.__app.copyStandings()" style="padding:10px 20px;font-size:0.85rem">\u{1F4CB} Copy final standings</button>
      </div>
    </div>`;
  }
  function copyStandings() {
    if (!lbData || !lbData.leaderboard.length) {
      showToast("No standings yet", "error");
      return;
    }
    const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString([], { month: "short", day: "numeric" });
    const rankEmoji = (r) => r === 1 ? "\u{1F947}" : r === 2 ? "\u{1F948}" : r === 3 ? "\u{1F949}" : r + ".";
    const lines = [
      "\u{1F3C6} World Cup 2026 \u2014 Standings (" + dateStr + ")",
      "",
      ...lbData.leaderboard.map((e) => {
        const pad = e.rank < 10 ? " " : "";
        return pad + rankEmoji(e.rank) + " " + e.display_name.padEnd(16) + " \u2014 " + e.score + " pts";
      }),
      "",
      "updated every 5 min \xB7 worldcup-bracket.cda-testing.workers.dev"
    ];
    const text = lines.join(String.fromCharCode(10));
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast("\u{1F4CB} Copied! Paste into WhatsApp.", "success"));
    } else {
      prompt("Copy this standings text:", text);
    }
  }

  // src/client/main.ts
  var deadlineWarningDismissed = false;
  var deadlinePassedHandled = false;
  function updateCountdown() {
    const el = document.getElementById("countdown-text");
    const header = document.getElementById("countdown-header");
    if (isPastDeadline()) {
      el.textContent = "PICKS LOCKED";
      header.classList.add("locked");
      document.getElementById("global-lock-banner").classList.add("show");
      document.getElementById("deadline-warning-banner").style.display = "none";
      const gateLine = document.getElementById("gate-deadline-line");
      if (gateLine) gateLine.textContent = "\u{1F512} Picks are closed \u2014 tournament is live!";
      renderSaveBar();
      renderPlaceholder();
      if (!deadlinePassedHandled) {
        deadlinePassedHandled = true;
        renderAll();
        loadPredictionsList();
        showToast("\u{1F512} Picks are now closed! You can now see everyone\u2019s brackets.", "success");
      }
      return;
    }
    const diff = DEADLINE - Date.now();
    const h = Math.floor(diff / 36e5);
    const m = Math.floor(diff % 36e5 / 6e4);
    const s = Math.floor(diff % 6e4 / 1e3);
    el.textContent = h + "h " + String(m).padStart(2, "0") + "m " + String(s).padStart(2, "0") + "s";
    renderDeadlineWarning(diff);
  }
  function renderDeadlineWarning(diffMs) {
    const banner = document.getElementById("deadline-warning-banner");
    const twoHours = 2 * 60 * 60 * 1e3;
    const thirtyMin = 30 * 60 * 1e3;
    if (!deadlineWarningDismissed && diffMs > 0 && diffMs < twoHours && state.bracketLoaded && !state.locked && !state.isViewing) {
      banner.style.display = "flex";
      if (diffMs < thirtyMin) {
        const minLeft = Math.ceil(diffMs / 6e4);
        const textEl = banner.querySelector("span");
        if (textEl) textEl.textContent = "\u26A0\uFE0F Only " + minLeft + " min left \u2014 your bracket isn\u2019t locked yet!";
        banner.classList.add("deadline-warning--urgent");
      } else {
        const textEl = banner.querySelector("span");
        if (textEl) textEl.textContent = "\u26A0\uFE0F Under 2 hours left \u2014 your bracket isn\u2019t locked yet!";
        banner.classList.remove("deadline-warning--urgent");
      }
    } else {
      banner.style.display = "none";
    }
  }
  function dismissDeadlineWarning() {
    deadlineWarningDismissed = true;
    document.getElementById("deadline-warning-banner").style.display = "none";
  }
  function scrollToSaveBar() {
    dismissDeadlineWarning();
    const bar = document.getElementById("save-bar-inner");
    if (bar) {
      bar.scrollIntoView({ behavior: "smooth", block: "center" });
      bar.classList.add("highlight-pulse");
      setTimeout(() => bar.classList.remove("highlight-pulse"), 1500);
    }
  }
  function renderPlaceholder() {
    const pre = document.getElementById("placeholder-box-pre");
    const live = document.getElementById("placeholder-box-live");
    if (isPastDeadline()) {
      pre.style.display = "none";
      live.style.display = "block";
    } else {
      pre.style.display = "block";
      live.style.display = "none";
    }
  }
  var bracketListCache = [];
  async function loadPredictionsList() {
    try {
      const brackets = await apiBracketList();
      renderPredictionsList(brackets);
    } catch {
    }
  }
  function renderPredictionsList(brackets) {
    bracketListCache = brackets;
    const el = document.getElementById("predictions-list");
    if (!brackets.length) {
      el.innerHTML = '<div style="color:var(--grey);font-size:0.8rem;">No predictions yet. Be first!</div>';
      return;
    }
    el.innerHTML = brackets.map((b, idx) => {
      const ago = timeAgo(b.updated_at);
      const avatar = (b.display_name || "?")[0].toUpperCase();
      const isLocked = !!b.locked;
      const canView = isPastDeadline() || b.email === state.email;
      const itemStyle = canView ? "" : ' style="cursor:default;opacity:0.85"';
      return `<div class="prediction-item" data-idx="${idx}"${itemStyle} onclick="window.__app.viewBracket(${idx},'${escJs(b.display_name)}')">
      <div class="prediction-avatar">${escHtml(avatar)}</div>
      <div class="prediction-info">
        <div class="prediction-name">${escHtml(b.display_name)}</div>
        <div class="prediction-time">${ago}${!canView ? " \xB7 \u{1F512} hidden" : ""}</div>
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        ${isLocked ? '<span class="lock-badge locked-personal">\u{1F512} Locked</span>' : '<span class="lock-badge">Draft</span>'}
        <button class="admin-delete-btn" title="Delete entry" onclick="event.stopPropagation();window.__app.openAdminDelete(${idx})" aria-label="Delete">\u{1F5D1}\uFE0F</button>
      </div>
    </div>`;
    }).join("");
  }
  var adminDeleteTarget = null;
  function openAdminDelete(idx) {
    const entry = bracketListCache[idx];
    if (!entry) return;
    adminDeleteTarget = { email: entry.email, name: entry.display_name };
    document.getElementById("admin-delete-name").textContent = entry.display_name;
    document.getElementById("admin-pass-input").value = "";
    document.getElementById("admin-pass-error").style.display = "none";
    document.getElementById("admin-modal").classList.add("open");
    setTimeout(() => document.getElementById("admin-pass-input").focus(), 50);
  }
  function closeAdminModal() {
    document.getElementById("admin-modal").classList.remove("open");
    adminDeleteTarget = null;
  }
  async function confirmAdminDelete() {
    if (!adminDeleteTarget) return;
    const pass = document.getElementById("admin-pass-input").value;
    const btn = document.getElementById("admin-confirm-btn");
    btn.disabled = true;
    btn.textContent = "Deleting...";
    try {
      const res = await fetch("/api/admin/brackets/" + encodeURIComponent(adminDeleteTarget.email), {
        method: "DELETE",
        headers: { "X-Admin-Password": pass }
      });
      if (res.status === 401) {
        document.getElementById("admin-pass-error").style.display = "block";
        btn.disabled = false;
        btn.textContent = "Delete";
        return;
      }
      if (!res.ok) throw new Error("Server error");
      if (adminDeleteTarget.email === state.email) {
        state.email = "";
        state.name = "";
        state.bracketLoaded = false;
        state.locked = false;
        state.knockout = {};
        state.predicted3rd = {};
        resetGroupsToDefault();
        document.getElementById("bracket-content").style.display = "none";
        document.getElementById("pre-login-placeholder").style.display = "flex";
        renderPlaceholder();
      }
      closeAdminModal();
      showToast("\u{1F5D1}\uFE0F Deleted " + adminDeleteTarget.name, "success");
      loadPredictionsList();
    } catch {
      showToast("Delete failed \u2014 check password", "error");
      btn.disabled = false;
      btn.textContent = "Delete";
    }
  }
  async function handleLoad() {
    const name = document.getElementById("input-name").value.trim();
    const email = document.getElementById("input-email").value.trim().toLowerCase();
    const errEl = document.getElementById("load-error");
    errEl.style.display = "none";
    if (!name) {
      errEl.textContent = "Please enter your name.";
      errEl.style.display = "block";
      return;
    }
    if (!email || !email.includes("@")) {
      errEl.textContent = "Please enter a valid email.";
      errEl.style.display = "block";
      return;
    }
    state.name = name;
    state.email = email;
    state.isViewing = false;
    state.viewingName = "";
    state.locked = false;
    state.bracketLoaded = false;
    state.knockout = {};
    state.predicted3rd = {};
    clearScheduleCache();
    resetGroupsToDefault();
    document.getElementById("viewing-banner").style.display = "none";
    document.querySelectorAll(".prediction-item").forEach((el) => el.classList.remove("active"));
    const btn = document.getElementById("btn-load");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Loading...';
    try {
      const data = await apiBracketGet(email);
      let bd = {};
      try {
        bd = JSON.parse(data.bracket.bracket_data);
      } catch {
      }
      if (bd.groups) state.groups = bd.groups;
      if (bd.knockout) state.knockout = bd.knockout;
      if (bd.predicted3rd) state.predicted3rd = bd.predicted3rd;
      state.locked = !!data.bracket.locked;
      state.bracketLoaded = true;
      showToast(state.locked ? "\u{1F512} Your bracket is locked." : "\u2705 Bracket loaded!", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("404") || msg.includes("Not found")) {
        state.bracketLoaded = true;
        showToast("New bracket started for " + name + "! Fill in your picks below.", "success");
      } else {
        btn.disabled = false;
        btn.textContent = "Load / New Bracket";
        errEl.textContent = "Could not load bracket: " + msg;
        errEl.style.display = "block";
        return;
      }
    }
    btn.disabled = false;
    btn.textContent = "Load / New Bracket";
    showBracketContent();
    renderAll();
    loadPredictionsList();
    apiFetch("/api/golden-boot?email=" + encodeURIComponent(email)).then((d) => {
      if (d.player_name) {
        setGbCurrentPick(d.player_name);
        const inp = document.getElementById("gb-input");
        if (inp) inp.value = d.player_name;
        updateGbDisplay();
      }
    }).catch(() => {
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function viewBracket(idxOrEmail, displayName) {
    const email = (typeof idxOrEmail === "number" ? bracketListCache[idxOrEmail]?.email ?? "" : idxOrEmail).toLowerCase();
    if (!email) {
      showToast("Could not find that bracket", "error");
      return;
    }
    if (!isPastDeadline() && email !== state.email) {
      showToast("\u{1F512} Brackets are hidden until picks close at 5 PM ET today.", "error");
      return;
    }
    try {
      const data = await apiBracketGet(email);
      let bd = {};
      try {
        bd = JSON.parse(data.bracket.bracket_data);
      } catch {
      }
      state.isViewing = true;
      state.viewingName = displayName;
      state.groups = Object.keys(GROUPS_DATA).reduce((acc, g) => {
        acc[g] = bd.groups?.[g] ?? GROUPS_DATA[g].map((t) => t.name);
        return acc;
      }, {});
      state.knockout = bd.knockout ?? {};
      state.predicted3rd = bd.predicted3rd ?? {};
      state.locked = !!data.bracket.locked;
      document.getElementById("viewing-banner").style.display = "flex";
      document.getElementById("viewing-text").textContent = "Viewing " + displayName + "\u2019s bracket" + (state.locked ? " \u{1F512}" : "");
      const shareBtnEl = document.getElementById("btn-share-bracket");
      if (shareBtnEl) shareBtnEl.setAttribute("data-share-email", email);
      document.querySelectorAll(".prediction-item").forEach((el) => el.classList.remove("active"));
      if (typeof idxOrEmail === "number") {
        document.querySelector(`.prediction-item[data-idx="${idxOrEmail}"]`)?.classList.add("active");
      } else {
        const idx = bracketListCache.findIndex((b) => b.email.toLowerCase() === email);
        if (idx !== -1) document.querySelector(`.prediction-item[data-idx="${idx}"]`)?.classList.add("active");
      }
      showBracketContent();
      renderAll();
      switchTab("bracket");
    } catch (e) {
      showToast("Could not load bracket: " + (e instanceof Error ? e.message : "error"), "error");
    }
  }
  function stopViewing() {
    state.isViewing = false;
    state.viewingName = "";
    state.locked = false;
    state.knockout = {};
    state.predicted3rd = {};
    resetGroupsToDefault();
    document.getElementById("viewing-banner").style.display = "none";
    document.querySelectorAll(".prediction-item").forEach((el) => el.classList.remove("active"));
    if (state.email && state.bracketLoaded) {
      apiBracketGet(state.email).then((data) => {
        let bd = {};
        try {
          bd = JSON.parse(data.bracket.bracket_data);
        } catch {
        }
        if (bd.groups) state.groups = bd.groups;
        if (bd.knockout) state.knockout = bd.knockout;
        if (bd.predicted3rd) state.predicted3rd = bd.predicted3rd;
        state.locked = !!data.bracket.locked;
        renderAll();
      }).catch(() => {
        state.locked = false;
        renderAll();
      });
    } else {
      state.bracketLoaded = false;
      document.getElementById("bracket-content").style.display = "none";
      document.getElementById("pre-login-placeholder").style.display = "flex";
      renderAll();
    }
  }
  function renderAll() {
    updateGroupStageVisibility();
    renderGroups();
    renderThirdPlaceSection();
    renderBracket();
    renderSaveBar();
    renderTicker();
    updateGbDisplay();
    if (!window.__consensusLoaded) {
      loadConsensus().then(() => {
        window.__consensusLoaded = true;
        renderBracket();
      });
    }
  }
  async function handleSave() {
    if (!state.email || !state.bracketLoaded) return;
    const btn = document.getElementById("btn-save");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "\u23F3 Saving...";
    }
    try {
      await apiBracketSave(
        state.email,
        state.name,
        JSON.stringify({ groups: state.groups, knockout: state.knockout, predicted3rd: state.predicted3rd }),
        false
      );
      setLastSavedAt(Date.now());
      showToast("\u2705 Draft saved!", "success");
      loadPredictionsList();
    } catch (e) {
      showToast("\u274C " + (e instanceof Error ? e.message : "error"), "error");
    }
    renderSaveBar();
  }
  function openModal() {
    document.getElementById("confirm-modal").classList.add("open");
  }
  function closeModal() {
    document.getElementById("confirm-modal").classList.remove("open");
  }
  async function confirmLock() {
    closeModal();
    try {
      await apiBracketSave(
        state.email,
        state.name,
        JSON.stringify({ groups: state.groups, knockout: state.knockout, predicted3rd: state.predicted3rd }),
        true
      );
      state.locked = true;
      showToast("\u{1F512} Picks locked permanently!", "success");
      renderAll();
      loadPredictionsList();
    } catch (e) {
      showToast("\u274C " + (e instanceof Error ? e.message : "error"), "error");
    }
  }
  function showBracketContent() {
    document.getElementById("pre-login-placeholder").style.display = "none";
    document.getElementById("bracket-content").style.display = "block";
  }
  function loadOtherBracketFromEmail(email, name) {
    switchTab("bracket");
    viewBracket(email, name);
  }
  function shareMyBracket() {
    const email = state.isViewing ? document.getElementById("btn-share-bracket")?.getAttribute("data-share-email") ?? state.email : state.email;
    if (!email) return;
    const url = location.origin + location.pathname + "?view=" + encodeURIComponent(email);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast("\u{1F517} Link copied! Share it with your group.", "success"));
    } else {
      prompt("Share this bracket link:", url);
    }
  }
  function copyInviteMessage() {
    const msg = "\u{1F3C6} FIFA 2026 Bracket Pool \u2014 join before 5 PM ET today!\n" + location.origin + location.pathname + "\nPassword: sofluffy";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(() => showToast("\u{1F4CB} Invite message copied! Paste it into WhatsApp.", "success")).catch(() => prompt("Copy this invite message:", msg));
    } else {
      prompt("Copy this invite message:", msg);
    }
  }
  function scrollToSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function switchTabPublic(tab) {
    switchTab(tab);
  }
  function switchTab(tab) {
    const isBracket = tab === "bracket";
    const isSchedule = tab === "schedule";
    const isLeaderboard = tab === "leaderboard";
    const loaded = state.bracketLoaded || state.isViewing;
    document.getElementById("bracket-content").style.display = isBracket && loaded ? "block" : "none";
    document.getElementById("pre-login-placeholder").style.display = isBracket && !loaded ? "flex" : "none";
    document.getElementById("schedule-panel").style.display = isSchedule ? "block" : "none";
    document.getElementById("leaderboard-panel").style.display = isLeaderboard ? "block" : "none";
    document.getElementById("tab-bracket").classList.toggle("tab-active", isBracket);
    document.getElementById("tab-schedule").classList.toggle("tab-active", isSchedule);
    document.getElementById("tab-leaderboard").classList.toggle("tab-active", isLeaderboard);
    if (isSchedule) {
      renderSchedule();
      startSchedulePolling();
      setTimeout(() => {
        const el = document.getElementById("today-anchor");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      stopSchedulePolling();
    }
    if (isLeaderboard) {
      startLeaderboard();
    } else {
      stopLeaderboard();
    }
  }
  function toggleRules() {
    const body = document.getElementById("rules-body");
    const btn = document.getElementById("rules-toggle-btn");
    if (!body || !btn) return;
    const open = body.style.display !== "none";
    body.style.display = open ? "none" : "block";
    btn.textContent = open ? "\u2139\uFE0F How does this work?" : "\u2716 Close explanation";
  }
  var PASS_KEY = "wc26_unlocked";
  function checkPassword() {
    const gate = document.getElementById("password-gate");
    const app = document.getElementById("app-root");
    if (sessionStorage.getItem(PASS_KEY) === "1") {
      gate.style.display = "none";
      app.style.display = "block";
      loadPredictionsList();
      return;
    }
    gate.style.display = "flex";
    app.style.display = "none";
    document.getElementById("pass-input").focus();
  }
  function submitPassword() {
    const val = (document.getElementById("pass-input").value ?? "").trim().toLowerCase();
    if (val === "sofluffy") {
      sessionStorage.setItem(PASS_KEY, "1");
      document.getElementById("password-gate").style.display = "none";
      document.getElementById("app-root").style.display = "block";
      loadPredictionsList();
    } else {
      const err = document.getElementById("pass-error");
      err.style.display = "block";
      document.getElementById("pass-input").value = "";
      document.getElementById("pass-input").focus();
      const card = document.getElementById("pass-card");
      card.classList.remove("shake");
      void card.offsetWidth;
      card.classList.add("shake");
    }
  }
  window.__app = {
    renderAll,
    // bracket actions
    pickWinner: (round, matchIdx, team) => {
      pickWinner(round, matchIdx, team);
      renderAll();
    },
    pick3rd: (matchIdx, slotIdx, team) => {
      pick3rd(matchIdx, slotIdx, team);
      renderAll();
    },
    autoPickAll: () => {
      autoPickAll();
      renderAll();
      showToast("\u{1F3B2} All picks filled randomly \u2014 review and save!", "success");
    },
    moveTeam,
    handleSave,
    openModal,
    // views
    viewBracket,
    stopViewing,
    loadOtherBracketFromEmail,
    openAdminDelete,
    switchTabPublic,
    scrollToSidebar,
    scrollToSaveBar,
    dismissDeadlineWarning,
    shareMyBracket,
    copyInviteMessage,
    // schedule
    makeMatchPick,
    submitScorePick,
    toggleMatchDetail,
    // leaderboard
    fetchLeaderboard,
    openH2H,
    closeH2H,
    copyStandings,
    dismissUpset,
    // golden boot
    filterGbPlayers,
    selectGbPlayer
  };
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
    document.getElementById("btn-load").addEventListener("click", handleLoad);
    document.getElementById("btn-stop-viewing").addEventListener("click", stopViewing);
    document.getElementById("btn-share-bracket").addEventListener("click", shareMyBracket);
    document.getElementById("rules-toggle-btn").addEventListener("click", toggleRules);
    document.getElementById("pass-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitPassword();
      document.getElementById("pass-error").style.display = "none";
    });
    document.getElementById("pass-submit").addEventListener("click", submitPassword);
    document.getElementById("modal-cancel-btn").addEventListener("click", closeModal);
    document.getElementById("modal-confirm-btn").addEventListener("click", confirmLock);
    document.getElementById("admin-cancel-btn").addEventListener("click", closeAdminModal);
    document.getElementById("admin-confirm-btn").addEventListener("click", confirmAdminDelete);
    document.getElementById("admin-modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeAdminModal();
    });
    document.getElementById("admin-pass-input").addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmAdminDelete();
      if (e.key === "Escape") closeAdminModal();
    });
    document.getElementById("h2h-modal").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) closeH2H();
    });
    document.getElementById("h2h-close-btn").addEventListener("click", closeH2H);
    document.getElementById("gb-input").addEventListener("input", (e) => {
      filterGbPlayers(e.target.value);
    });
    setInterval(updateCountdown, 1e3);
    updateCountdown();
    loadLiveResults().then(renderTicker);
    checkPassword();
    renderPlaceholder();
    const viewParam = new URLSearchParams(location.search).get("view");
    if (viewParam) {
      apiFetch("/api/brackets/" + encodeURIComponent(viewParam)).then((data) => {
        viewBracket(viewParam, data.bracket.display_name);
        switchTab("bracket");
      }).catch(() => {
      });
    }
  });
})();
