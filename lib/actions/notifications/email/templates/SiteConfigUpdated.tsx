import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Gavel, User } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";
import { Fragment } from "react/jsx-runtime";

export default function SiteConfigUpdated(props: Parameters<typeof NotificationTypes.SITE_CONFIG_UPDATED>[0]) {
    return <EmailTemplate>
            <EmailSectionHero icon={Gavel} title="Site configuration updated." subtitle={<>{props.triggerUser.name} updated the site configuration. Updated keys: {props.updatedKeys.map((key: string, index: number)=> <Fragment key={index}><code>{key}</code> {index < props.updatedKeys.length - 1 ? ", " : ""}</Fragment>)}</>} />
            <Section className="pt-4">
                <Button href={`${process.env.BETTER_AUTH_URL ?? ""}${props.link ?? ""}`} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                    View configuration
                </Button>
            </Section>
    </EmailTemplate>
}