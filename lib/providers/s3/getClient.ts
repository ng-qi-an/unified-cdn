import { S3Client } from "@aws-sdk/client-s3";

export function getS3Client(accessUrl: string, accessKeyId: string, secretAccessKey: string, region?: string) {
	return new S3Client({
		region: region || "auto",
		endpoint: accessUrl,
		credentials: {
			accessKeyId: accessKeyId,
			secretAccessKey: secretAccessKey,
		},
	});
}