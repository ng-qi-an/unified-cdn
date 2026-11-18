const MAX_CONCURRENT_UPLOADS = Number(process.env.UPLOAD_MAX_CONCURRENT ?? 3);
const MEMORY_BUDGET_MB = Number(process.env.UPLOAD_MEMORY_BUDGET_MB ?? 450);

let activeUploads = 0;

//True when total process memory (heap + Buffers + native) exceeds budget. RSS, not heapUsed: HCDN file Buffers live outside the V8 heap.
export function memoryPressure(): boolean {
    return process.memoryUsage().rss / 1024 / 1024 > MEMORY_BUDGET_MB;
}

export function activeUploadCount(): number {
    return activeUploads;
}

// Try to claim an upload slot. Upload slot allows the caller to like be able to upload files. If they can't get a slot, they're turned away with a 503.
export function tryEnterUpload(): boolean {
    if (activeUploads >= MAX_CONCURRENT_UPLOADS) return false;
    if (memoryPressure()) return false;
    activeUploads++;
    return true;
}

export function leaveUpload(): void {
    activeUploads = Math.max(0, activeUploads - 1);
}
