import { GrantCodeAction } from "./grantCodeActions";
import { InvalidConfigurationError } from "@/lib/errors";
import getGrantCode from "./getGrantCode";
import { db } from "@/lib/db";
import { grantCodes } from "@/lib/schema/schema";
import { eq, lt, or } from "drizzle-orm";

export default async function verifyGrantCode(code: string, action: GrantCodeAction) {
    try {
        const codeData = await getGrantCode(code);
        if (codeData.action !== action) {
            throw new InvalidConfigurationError(`The grant code action does not match the expected action. Expected: ${action}, Received: ${codeData.action}`);
        }
        await db.delete(grantCodes).where(or(eq(grantCodes.code, code), lt(grantCodes.expiresAt, new Date())));
        return codeData;
    } catch (error) {
        throw new Error("An unknown error occurred while verifying the grant code.");
    }
}