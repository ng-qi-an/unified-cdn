import { generateId } from "better-auth";
import type { BusboyFileStream } from "@fastify/busboy";
import type { files as filesDb } from "@/lib/schema/schema";
import type { HCDNClient } from "./client";

export type BufferedHcdnResult = { ok: true; file: typeof filesDb.$inferInsert } | { ok: false; filename: string; reason: string };

export function uploadBufferedFile(hcdn: HCDNClient, stream: BusboyFileStream, opts: { filename: string; mimeType: string; maxBytes: number; appId: string; databaseId: string }): Promise<BufferedHcdnResult> {
    const { filename, mimeType, maxBytes, appId, databaseId } = opts;
    return new Promise((resolve) => {
        const chunks: Buffer[] = [];
        let hitLimit = false;
        stream.on("data", (chunk: Buffer) => { chunks.push(chunk); });
        stream.on("limit", () => { hitLimit = true; });
        stream.on("error", () => resolve({ ok: false as const, filename, reason: "Failed to receive file." }));
        stream.on("end", () => {
            (async () => {
                try {
                    if (hitLimit || stream.truncated) {
                        return resolve({ ok: false as const, filename, reason: `File size exceeds the maximum allowed size of ${maxBytes} bytes.` });
                    }
                    const buf = Buffer.concat(chunks);
                    chunks.length = 0;
                    const fd = new FormData();
                    fd.append("file", new File([buf], filename, { type: mimeType }));
                    const res = await hcdn.request("/upload", { method: "POST", body: fd });
                    if (res.status === 401) {
                        return resolve({ ok: false as const, filename, reason: "Could not connect to database provider. Please check your database key configurations." });
                    }
                    let data: { id?: string; filename?: string; size?: number; content_type?: string; message?: string; hint?: string } | null = null;
                    try { data = await res.json(); } catch { data = null; }
                    if (!res.ok || !data?.id) {
                        return resolve({ ok: false as const, filename, reason: data?.message || data?.hint || `HCDN upload failed (${res.status})` });
                    }
                    return resolve({
                        ok: true as const,
                        file: {
                            id: generateId(16),
                            applicationId: appId,
                            databaseId,
                            key: data.id,
                            name: data.filename ?? filename,
                            contentType: data.content_type ?? mimeType,
                            size: data.size ?? buf.length
                        }
                    });
                } catch (err) {
                    return resolve({ ok: false as const, filename, reason: err instanceof Error ? err.message : "Unknown error" });
                }
            })();
        });
    });
}
