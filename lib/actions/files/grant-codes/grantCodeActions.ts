export type GrantCodeActions = {
    UPLOAD_FILES: {
        fileCount: number,
        maximumFileSize?: number,
        maximumTotalSize?: number,
        allowedFileTypes?: string[]
    } 
}

export const grantCodeActionKeys = [
    "UPLOAD_FILES",
] as const;

export type GrantCodeAction = typeof grantCodeActionKeys[number];
