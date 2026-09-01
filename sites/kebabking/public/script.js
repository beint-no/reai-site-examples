(() => {
  "use strict";

  const storeKey = "kk-lang";
  const nodes = [...document.querySelectorAll("[data-en]")];
  nodes.forEach((element) => {
    element.dataset.no = element.innerHTML;
  });

  const titles = {
    no: "Kebab King Trondheim · Fersk tyrkisk kebab, dürüm & grill",
    en: "Kebab King Trondheim · Fresh Turkish Kebab, Dürüm & Grill",
  };
  const descriptions = {
    no: "Kebab King i Brattørgata 4, Trondheim — ekte tyrkiske, midtøsten- og kebabklassikere rett fra grillen.",
    en: "Kebab King at Brattørgata 4, Trondheim — authentic Turkish, Middle Eastern and kebab classics off the grill.",
  };
  const messages = {
    no: {
      open: "Åpent nå",
      closed: "Stengt",
      openFoot: "<b>Vi har åpent akkurat nå</b> — bestill i vei! Alle tider er lokale (Europa/Oslo).",
      closedFoot: "Stengt akkurat nå. Alle tider er lokale (Europa/Oslo).",
    },
    en: {
      open: "Open now",
      closed: "Closed",
      openFoot: "<b>We are open right now</b> — order away! All times are local (Europe/Oslo).",
      closedFoot: "Currently closed. All times are local (Europe/Oslo).",
    },
  };

  let language = "no";
  try {
    const saved = localStorage.getItem(storeKey);
    if (saved === "en" || saved === "no") language = saved;
  } catch {}

  const osloNow = () => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Oslo",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[values.weekday], minutes: Number(values.hour) * 60 + Number(values.minute) };
  };

  const isOpen = (day, minutes) => {
    const opens = 14 * 60;
    const standardClose = 23 * 60;
    const weekendClose = 23 * 60 + 59;
    const lateClose = 3 * 60 + 30;
    const regular = day === 0 || (day >= 1 && day <= 4)
      ? minutes >= opens && minutes <= standardClose
      : (day === 5 || day === 6) && minutes >= opens && minutes <= weekendClose;
    return regular || ((day === 6 || day === 0) && minutes < lateClose);
  };

  const refreshStatus = () => {
    const now = osloNow();
    const open = isOpen(now.day, now.minutes);
    const copy = messages[language];
    const pill = document.getElementById("status-pill");
    const hoursNow = document.getElementById("hours-now");
    const hoursTable = document.getElementById("hours-table");
    if (pill) {
      pill.classList.toggle("is-open", open);
      pill.classList.toggle("is-closed", !open);
      pill.innerHTML = `<span class="dot"></span> ${open ? copy.open : copy.closed}`;
    }
    if (hoursNow) hoursNow.innerHTML = open ? copy.openFoot : copy.closedFoot;
    hoursTable?.querySelectorAll("tr").forEach((row) => {
      const days = (row.getAttribute("data-day") || "").split(",").map(Number);
      row.classList.toggle("is-today", days.includes(now.day));
    });
  };

  const setLanguage = (value) => {
    language = value === "en" ? "en" : "no";
    nodes.forEach((element) => {
      const copy = element.dataset[language];
      if (typeof copy === "string") element.innerHTML = copy;
    });
    document.documentElement.lang = language;
    document.title = titles[language];
    document.querySelector('meta[name="description"]')?.setAttribute("content", descriptions[language]);
    document.querySelectorAll(".langswitch__btn").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === language);
    });
    const year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
    try {
      localStorage.setItem(storeKey, language);
    } catch {}
    refreshStatus();
  };

  document.querySelectorAll(".langswitch__btn").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  const nav = document.getElementById("nav");
  const updateNav = () => nav?.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  const toggle = document.getElementById("nav-toggle");
  const mobile = document.getElementById("nav-mobile");
  toggle?.addEventListener("click", () => {
    const open = mobile?.classList.toggle("open") || false;
    toggle.setAttribute("aria-expanded", String(open));
  });
  mobile?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobile.classList.remove("open");
      toggle?.setAttribute("aria-expanded", "false");
    });
  });

  setLanguage(language);
  setInterval(refreshStatus, 60_000);
})();
