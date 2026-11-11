import { IconType, SiBackblaze, SiBackblazeHex, SiCloudflare, SiCloudflareHex, SiHackclub, SiHackclubHex } from "@icons-pack/react-simple-icons";
import { DatabaseIcon } from "lucide-react";

export type Service = {
    name: string;
    id: string;
    icon: IconType;
    hex: string;
    href: string;
}

export const availableServices: Service[] = [
    
    {
        name: "Amazon S3",
        id: "s3-amazon-s3",
        icon: DatabaseIcon,
        hex: "#fff",
        href: "https://aws.amazon.com/s3/"
    },
    {
        name: "Cloudflare R2",
        id: "s3-cloudflare-r2",
        icon: SiCloudflare,
        hex: SiCloudflareHex,
        href: "https://developers.cloudflare.com/r2/get-started/s3/"
    },
    {
        name: "Backblaze B2",
        id: "s3-backblaze-b2",
        icon: SiBackblaze,
        hex: SiBackblazeHex,
        href: "https://www.backblaze.com/apidocs/introduction-to-the-s3-compatible-api"
    },
    {
        name: "Hack Club CDN",
        id: "hackclub-cdn",
        icon: SiHackclub,
        hex: SiHackclubHex,
        href: "https://cdn.hackclub.com/"
    },
]