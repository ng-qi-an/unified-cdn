export type GrantCodeActions = {
    UPLOAD_FILES: {
        fileCount: number,
        maximumFileSize?: number,
        maximumTotalSize?: number,
        allowedFileTypes?: string[]
    },
    DELETE_FILES: {
        fileIds: string[],
    },
    GET_FILES: {
        fileIds: string[],
    },
    RENAME_FILE: {
        fileId: string,
        newFileName: string,
    },
    DELETE_FILE: {
        fileId: string,
    },
    GET_FILE: {
        fileId: string,
    }
}

export const grantCodeActionKeys = [
    "UPLOAD_FILES",
    "DELETE_FILES",
    "GET_FILES",
    "RENAME_FILE",
    "DELETE_FILE",
    "GET_FILE",
] as const;

export type GrantCodeAction = typeof grantCodeActionKeys[number];
