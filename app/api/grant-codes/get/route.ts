import getGrantCode from "@/lib/actions/files/grant-codes/getGrantCode"
import { UnauthorisedError } from "@/lib/errors";
import { errorToResponse } from "@/lib/permissions/serverPermissionHelpers";

export const GET = async(req: Request) => {
    try {
        const code = req.headers.get("Authorization")?.split(" ")[1];
        if (!code) {
            return errorToResponse(new UnauthorisedError("Missing code in Authorization header."));
        }
        const codeData = await getGrantCode(code)
        return Response.json({...codeData}, {status: 200});
    } catch (error) {
        return errorToResponse(error);
    }
}