import {
  defineEventHandler,
  getQuery,
  sendRedirect,
  setHeader,
  createError,
} from "h3";

const thumbCache = new Map<string, string>();

const pendingRequests = new Map<string, Promise<string | null>>();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawId = String(query.id || "").trim();

  if (!rawId) {
    throw createError({ statusCode: 400, message: "Missing Roblox asset ID" });
  }

  const match = rawId.match(/(\d{6,})/);
  if (!match || !match[1] || match[1] === "0") {
    throw createError({ statusCode: 404, message: "Invalid Roblox asset ID" });
  }

  const assetId = match[1];

  if (thumbCache.has(assetId)) {
    const cachedUrl = thumbCache.get(assetId)!;
    setHeader(
      event,
      "Cache-Control",
      "public, max-age=604800, s-maxage=604800, immutable",
    );
    return sendRedirect(event, cachedUrl, 302);
  }

  let fetchPromise = pendingRequests.get(assetId);
  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        const res = await $fetch<{
          data?: Array<{ targetId: number; state: string; imageUrl?: string }>;
        }>(
          `https://thumbnails.roblox.com/v1/assets?assetIds=${assetId}&size=150x150&format=Png`,
        );

        const item = res?.data?.[0];
        if (item && item.state === "Completed" && item.imageUrl) {
          thumbCache.set(assetId, item.imageUrl);
          return item.imageUrl;
        }
        return null;
      } catch (err) {
        console.warn(`[RobloxThumb] Failed to resolve asset ${assetId}:`, err);
        return null;
      } finally {
        pendingRequests.delete(assetId);
      }
    })();

    pendingRequests.set(assetId, fetchPromise);
  }

  const resolvedUrl = await fetchPromise;

  if (!resolvedUrl) {
    throw createError({
      statusCode: 404,
      message: "Roblox thumbnail not found or pending",
    });
  }

  setHeader(
    event,
    "Cache-Control",
    "public, max-age=604800, s-maxage=604800, immutable",
  );
  return sendRedirect(event, resolvedUrl, 302);
});
