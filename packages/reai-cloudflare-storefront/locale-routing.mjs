function canonicalLocale(locale) {
  try {
    const value = String(locale).trim();
    const canonical = value ? Intl.getCanonicalLocales(value)[0] : undefined;
    if (!canonical) throw new TypeError();
    return canonical;
  } catch {
    throw new TypeError(`Invalid locale: ${locale}`);
  }
}

function messageKeys(value, prefix = "") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.keys(value).sort().flatMap((key) => messageKeys(value[key], prefix ? `${prefix}.${key}` : key));
}

function deepFreeze(value) {
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === "object") deepFreeze(nested);
  }
  return Object.freeze(value);
}

function normalizePathPrefix(pathPrefix = "") {
  const value = String(pathPrefix).trim();
  if (!value || value === "/") return "";
  if (!value.startsWith("/") || value.endsWith("/") || value.includes("//") || value.includes("?") || value.includes("#")) {
    throw new TypeError(`Invalid locale path prefix: ${pathPrefix}`);
  }
  return value;
}

function normalizeHostname(hostname) {
  const value = String(hostname).trim().toLowerCase();
  if (!value || value.includes(":")) throw new TypeError(`Invalid locale route hostname: ${hostname}`);
  return value;
}

function pathMatchesPrefix(pathname, pathPrefix) {
  return pathPrefix === "" || pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`);
}

function stripPathPrefix(pathname, pathPrefix) {
  if (!pathPrefix) return pathname;
  const stripped = pathname.slice(pathPrefix.length);
  return stripped || "/";
}

export function defineLocaleCatalog(locale, messages) {
  const canonical = canonicalLocale(locale);
  if (!messages || typeof messages !== "object" || Array.isArray(messages)) {
    throw new TypeError(`Locale catalog ${canonical} must export a messages object`);
  }
  for (const key of messageKeys(messages)) {
    const value = key.split(".").reduce((current, part) => current?.[part], messages);
    if (!key || typeof value !== "string") {
      throw new TypeError(`Locale catalog ${canonical} message ${key || "<root>"} must be a string`);
    }
  }
  return Object.freeze({ locale: canonical, messages: deepFreeze(messages) });
}

export function createLocaleRouting({ catalogs, routes }) {
  if (!catalogs || typeof catalogs !== "object" || Array.isArray(catalogs)) {
    throw new TypeError("localeCatalogs is required");
  }
  const catalogEntries = Object.entries(catalogs).map(([configuredLocale, catalog]) => {
    const locale = canonicalLocale(configuredLocale);
    if (catalog?.locale !== locale) {
      throw new TypeError(`Locale catalog key ${configuredLocale} must match its canonical locale ${catalog?.locale}`);
    }
    return [locale, catalog];
  });
  if (!catalogEntries.length) throw new TypeError("At least one locale catalog is required");
  const catalogsByLocale = new Map(catalogEntries);
  if (catalogsByLocale.size !== catalogEntries.length) throw new TypeError("Locale catalog keys must be unique");

  const expectedKeys = messageKeys(catalogEntries[0][1].messages);
  for (const [locale, catalog] of catalogEntries.slice(1)) {
    const actualKeys = messageKeys(catalog.messages);
    if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== expectedKeys[index])) {
      throw new TypeError(`Locale catalog ${locale} must contain exactly the same message keys as ${catalogEntries[0][0]}`);
    }
  }

  if (!Array.isArray(routes) || !routes.length) throw new TypeError("localeRoutes is required");
  const normalizedRoutes = routes.flatMap((route, routeIndex) => {
    const locale = canonicalLocale(route.locale);
    if (!catalogsByLocale.has(locale)) throw new TypeError(`Locale route ${routeIndex} has no catalog for ${locale}`);
    const pathPrefix = normalizePathPrefix(route.pathPrefix);
    const assetPathPrefix = normalizePathPrefix(route.assetPathPrefix ?? pathPrefix);
    if (route.hostnames !== undefined && (!Array.isArray(route.hostnames) || !route.hostnames.length)) {
      throw new TypeError(`Locale route ${routeIndex} hostnames must be a non-empty array`);
    }
    const hostnames = route.hostnames || ["*"];
    const market = String(route.market || "default").trim();
    const siteTokenBinding = String(route.siteTokenBinding || "REAI_SITE_TOKEN").trim();
    if (!market || !siteTokenBinding) throw new TypeError(`Locale route ${routeIndex} has an invalid market configuration`);
    let canonicalOrigin;
    if (route.canonicalOrigin) {
      const origin = new URL(route.canonicalOrigin);
      if (origin.pathname !== "/" || origin.search || origin.hash) {
        throw new TypeError(`Locale route ${routeIndex} canonicalOrigin must be an origin`);
      }
      canonicalOrigin = origin.origin;
    }
    const siteBaseUrlBinding = String(route.siteBaseUrlBinding || "REAI_BASE_URL").trim();
    if (!siteBaseUrlBinding) throw new TypeError(`Locale route ${routeIndex} has an invalid API base URL binding`);
    return hostnames.map((hostname) => ({
      hostname: hostname === "*" ? "*" : normalizeHostname(hostname),
      pathPrefix,
      assetPathPrefix,
      locale,
      market,
      siteTokenBinding,
      siteBaseUrlBinding,
      canonicalOrigin,
      catalog: catalogsByLocale.get(locale),
    }));
  });

  const routeKeys = normalizedRoutes.map((route) => `${route.hostname}\n${route.pathPrefix}`);
  if (new Set(routeKeys).size !== routeKeys.length) throw new TypeError("Locale routes must have unique hostname and path-prefix pairs");
  if (normalizedRoutes.length > 1 && normalizedRoutes.some((route) => !route.canonicalOrigin)) {
    throw new TypeError("Every multi-locale route must have a canonicalOrigin");
  }
  const canonicalRoutesByLocale = new Map();
  for (const route of normalizedRoutes) {
    if (!route.canonicalOrigin) continue;
    const canonicalRoute = `${route.canonicalOrigin}\n${route.pathPrefix}`;
    const existing = canonicalRoutesByLocale.get(route.locale);
    if (existing && existing !== canonicalRoute) {
      throw new TypeError(`Locale ${route.locale} must have one canonical hostname and path`);
    }
    canonicalRoutesByLocale.set(route.locale, canonicalRoute);
  }

  function resolve(url) {
    const hostname = url.hostname.toLowerCase();
    const candidates = normalizedRoutes
      .filter((route) => (route.hostname === hostname || route.hostname === "*") && pathMatchesPrefix(url.pathname, route.pathPrefix))
      .sort((left, right) => {
        const hostRank = Number(right.hostname !== "*") - Number(left.hostname !== "*");
        return hostRank || right.pathPrefix.length - left.pathPrefix.length;
      });
    const route = candidates[0];
    if (!route) return null;
    const storefrontPath = stripPathPrefix(url.pathname, route.pathPrefix);
    return {
      ...route,
      storefrontPath,
      publicPath(pathname) {
        const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
        return route.pathPrefix ? `${route.pathPrefix}${path === "/" ? "/" : path}` : path;
      },
    };
  }

  return Object.freeze({ resolve, routes: Object.freeze(normalizedRoutes) });
}

export function formatCurrency(value, currency, locale) {
  return new Intl.NumberFormat(canonicalLocale(locale), {
    style: "currency",
    currency: String(currency).toUpperCase(),
  }).format(Number(value));
}
