import { Button, Section } from "react-email";
import { NotificationTypes } from "../../notificationTypes";
import EmailTemplate from "./EmailTemplate";
import { Shield } from "lucide-static";
import EmailSectionHero from "./EmailSectionHero";

export default function UserRoleChangedUser(props: Parameters<typeof NotificationTypes.USER_ROLE_CHANGED_USER>[0]) {
    return <EmailTemplate>
        <EmailSectionHero icon={Shield} title="Your role was changed." subtitle={<>{props.triggerUser.name} changed your role to <strong>{props.newRole}</strong>.</>} />
        <Section className="pt-4">
            <Button href={`${process.env.BETTER_AUTH_URL ?? ""}${props.link ?? ""}`} className="bg-black px-4 py-3 text-white uppercase" style={{fontSize: "13px"}}>
                View Dashboard
            </Button>
        </Section>
    </EmailTemplate>
}
