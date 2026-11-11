import { db } from "@/lib/db";
import { GrantCodeAction, GrantCodeActions } from "./grantCodeActions";
import { grantCodes } from "@/lib/schema/schema";
import { generateId } from "better-auth";

export default async function generateGrantCode<T extends GrantCodeAction>({action, data, applicationId, apiKeyId, expiresIn=300}: {action: T, data: GrantCodeActions[T], applicationId: string, apiKeyId: string, expiresIn?: number}) {
    const expiresAt: Date = new Date(Date.now() + expiresIn * 1000);
    const code: string = generateId(16);
    const payload = {
        code,
        action,
        data,
        applicationId,
        apiKeyId,
        expiresAt
    };
    await db.insert(grantCodes).values(payload);
    return payload;
}