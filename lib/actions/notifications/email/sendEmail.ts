import "server-only";
import { Resend } from 'resend';
import { ReactNode } from "react";
import getSiteConfig from "../../site-settings/getSiteConfig";



export default async function sendEmail({destinationEmails, subject, template}: {destinationEmails: string[], subject: string, template: ReactNode}) {
    const siteConfig = await getSiteConfig();
    const resend = siteConfig.notifications.methods.email.resendApiKey ? new Resend(siteConfig.notifications.methods.email.resendApiKey) : null;
    if (!resend) {
        throw new Error("Resend API key is not set. Please set the resendApiKey in the admin dashboard.");
    }
    if (!siteConfig.notifications.methods.email.emailOrigin) {
        throw new Error("emailOrigin is not set. Please set it in the admin dashboard.");
    }
    if (destinationEmails.length === 0) {
        return;
    }
    const { error } = await resend.batch.send(destinationEmails.map((email)=> ({
        from: `Unified CDN <${siteConfig.notifications.methods.email.emailOrigin}>`,
        to: [email],
        subject: subject,
        react: template,
    })));
    if (error){
        throw new Error(`Error sending email (${error.name}): ${error.message}`);
    }
}