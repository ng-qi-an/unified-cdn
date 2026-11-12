import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ExternalLink, LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function ConfigNeeded({title, description, link, Icon}: {title: string, description: string, link: string, Icon: LucideIcon}) {
    return <Empty>
        <EmptyMedia variant="icon">
            <Icon/>
        </EmptyMedia>
        <EmptyHeader>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        <Link href={link} target="_blank" rel="noopener noreferrer">
            <Button>documentation <ExternalLink/></Button>
        </Link>
    </Empty>
}