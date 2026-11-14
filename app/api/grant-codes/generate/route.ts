import generateGrantCode from "@/lib/actions/files/grant-codes/generateGrantCode";
import { grantCodeActionKeys } from "@/lib/actions/files/grant-codes/grantCodeActions";
import { InvalidConfigurationError } from "@/lib/errors";
import { errorToResponse, verifyAPIKey } from "@/lib/permissions/serverPermissionHelpers";

export const POST = verifyAPIKey(async(req, ctx, apiKey) => {
    const body = await req.json();
    if (!body || !body.action || !body.data){
        return errorToResponse(new InvalidConfigurationError("Missing action or data in request body."));
    }
    if (!grantCodeActionKeys.includes(body.action)){
        return errorToResponse(new InvalidConfigurationError(`Invalid action in request body. Must be one of: ${grantCodeActionKeys.join(", ")}`));
    }
    const newCode = await generateGrantCode({action: body.action, data: body.data, apiKeyId: apiKey.id, applicationId: apiKey.metadata?.appId, expiresIn: body.expiresAt || undefined});
    return Response.json({code: newCode}, {status: 200});
})