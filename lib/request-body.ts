export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: "too_large" | "invalid_json" };

function declaredLengthExceeds(request: Request, maxBytes: number) {
  const raw = request.headers.get("content-length");
  if (raw === null) return false;

  const declared = Number(raw);
  return Number.isFinite(declared) && declared >= 0 && declared > maxBytes;
}

export async function readBoundedJson(
  request: Request,
  maxBytes: number,
): Promise<BoundedJsonResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new TypeError("maxBytes must be a positive safe integer.");
  }

  if (declaredLengthExceeds(request, maxBytes)) {
    return { ok: false, reason: "too_large" };
  }

  if (!request.body) {
    return { ok: false, reason: "invalid_json" };
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  const chunks: string[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel("request body exceeds configured limit");
        return { ok: false, reason: "too_large" };
      }

      chunks.push(decoder.decode(value, { stream: true }));
    }

    chunks.push(decoder.decode());
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  try {
    return { ok: true, value: JSON.parse(chunks.join("")) };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}
