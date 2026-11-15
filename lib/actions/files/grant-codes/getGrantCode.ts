import { db } from "@/lib/db";
import { UnauthorisedError } from "@/lib/errors";

export default async function getGrantCode(code: string) {
    const codeData = await db.query.grantCodes.findFirst({
        where: {
            code,
        },
        with: {
            apikey: true
        }
    })
    if (!codeData || codeData.expiresAt < new Date()) {
        throw new UnauthorisedError("The grant code is invalid or has expired.");
    }
    return codeData;
}