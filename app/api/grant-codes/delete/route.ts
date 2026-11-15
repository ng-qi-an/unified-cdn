import getGrantCode from "@/lib/actions/files/grant-codes/getGrantCode"
import { db } from "@/lib/db";
import { UnauthorisedError } from "@/lib/errors";
import { errorToResponse } from "@/lib/permissions/serverPermissionHelpers";
import { grantCodes } from "@/lib/schema/schema";
import { eq } from "drizzle-orm";

export const DELETE = async(req: Request) => {
    try {
        const code = req.headers.get("Authorization")?.split(" ")[1];
        if (!code) {
            return errorToResponse(new UnauthorisedError("Missing code in Authorization header."));
        }
        const codeData = await getGrantCode(code)
        await db.delete(grantCodes).where(eq(grantCodes.code, codeData.code));
        return Response.json({"status": "OK"}, {status: 200});
    } catch (error) {
        return errorToResponse(error);
    }
}