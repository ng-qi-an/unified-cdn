// ADD: lib/providers/hcdn/uploadStreamedFiles.ts
import { createReadStream } from "node:fs";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import type { HCDNClient } from "./client";

export interface HCDNSpooledFile {
  tmpPath: string; filename: string; mimeType: string;
}

export async function uploadStreamedFiles(
  client: HCDNClient,
  files: HCDNSpooledFile[],
): Promise<{
  uploads: { id: string; filename: string; size: number; content_type: string; url: string }[];
  failed: { filename: string; reason: string }[];
}> {
  const boundary = `----ucdn${randomUUID().replace(/-/g, "")}`;
  async function* parts() {
    for (const f of files) {
      const safeName = f.filename.replace(/["\r\n]/g, "_");
      yield Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="files[]"; filename="${safeName}"\r\nContent-Type: ${f.mimeType || "application/octet-stream"}\r\n\r\n`
      );
      yield* createReadStream(f.tmpPath);
      yield Buffer.from("\r\n");
    }
    yield Buffer.from(`--${boundary}--\r\n`);
  }
  const response = await client.request("/uploads", {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body: Readable.from(parts()) as unknown as BodyInit,
    // @ts-expect-error undici streaming body
    duplex: "half",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HCDN batch upload failed (${response.status}): ${body.slice(0, 200)}`);
  }
  return (await response.json()) as { uploads: []; failed: [] };
}
