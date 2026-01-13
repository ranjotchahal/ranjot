const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".woff2": "font/woff2",
  ".json": "application/json; charset=UTF-8",
};

const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; font-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self';",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Access-Control-Allow-Origin": "*",
};

const getExtension = (path) => {
  const match = /\.([a-z0-9]+)$/i.exec(path);
  return match ? `.${match[1].toLowerCase()}` : "";
};

const buildResponse = (body, options = {}) => {
  const headers = new Headers({
    ...SECURITY_HEADERS,
    ...options.headers,
  });

  return new Response(body, {
    status: options.status ?? 200,
    headers,
  });
};

const resolveAssetKey = (pathname, manifest) => {
  const safePath = pathname.replace(/\.\.(\/|\\)/g, "");
  const key = safePath === "/" ? "index.html" : safePath.slice(1);
  return manifest[key] || key;
};

const notFound = () =>
  buildResponse(JSON.stringify({ message: "Not Found" }), {
    status: 404,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const manifest = JSON.parse(__STATIC_CONTENT_MANIFEST);
    const pathname = url.pathname;
    const extension = getExtension(pathname);

    const isAssetRequest = extension && pathname !== "/";
    const primaryKey = resolveAssetKey(pathname, manifest);

    if (isAssetRequest) {
      const asset = await __STATIC_CONTENT.get(primaryKey, { type: "arrayBuffer" });
      if (!asset) {
        return notFound();
      }
      return buildResponse(asset, {
        headers: {
          "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
          "Cache-Control": "public, max-age=604800, immutable",
        },
      });
    }

    const indexKey = resolveAssetKey("/index.html", manifest);
    const indexAsset = await __STATIC_CONTENT.get(indexKey, { type: "arrayBuffer" });
    if (!indexAsset) {
      return notFound();
    }

    return buildResponse(indexAsset, {
      headers: {
        "Content-Type": MIME_TYPES[".html"],
        "Cache-Control": "no-store",
      },
    });
  },
};
