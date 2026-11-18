const MAX_CONCURRENT_UPLOADS = Number(process.env.UPLOAD_MAX_CONCURRENT ?? 3);
const MEMORY_BUDGET_MB = Number(process.env.UPLOAD_MEMORY_BUDGET_MB ?? 450);

let activeUploads = 0;

//True when total process memory (heap + Buffers + native) exceeds budget. RSS, not heapUsed: HCDN file Buffers live outside the V8 heap.
export function memoryPressure(): boolean {
    return MEMORY_BUDGET_MB > 0 && process.memoryUsage().rss / 1024 / 1024 > MEMORY_BUDGET_MB;
}

export function activeUploadCount(): number {
    return activeUploads;
}

// Try to claim an upload slot. Upload slot allows the caller to like be able to upload files. If they can't get a slot, they're turned away with a 503.
export function tryEnterUpload(): boolean {
    console.log("Entering upload")
    if (MAX_CONCURRENT_UPLOADS > 0 && activeUploads >= MAX_CONCURRENT_UPLOADS) {
        console.log("Too many active uploads. Active:", activeUploads, "Max:", MAX_CONCURRENT_UPLOADS);
        return false;
    };
    if (memoryPressure()) {
        console.log("Memory pressure too high.", "RSS MB:", process.memoryUsage().rss / 1024 / 1024, "Budget MB:", MEMORY_BUDGET_MB);
        return false;
    }
    activeUploads++;
    return true;
}

export function leaveUpload(): void {
    activeUploads = Math.max(0, activeUploads - 1);
}
