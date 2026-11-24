![Unified CDN promotional banner](/public/unified-cdn-promo-banner.png)
<h1 align="center"> ☁️ Unified CDN 📂</h1>

Unified CDN is a robust, **all-in-one** file storage network. It works as a proxy, sitting between your application and various file storage providers, and adding features across all your providers.

Visit the [documentation](https://docs.unified-cdn.ngqian.com) for a more detailed introduction, installation and deployment.

Not ready yet? Visit the [demo](https://docs.unified-cdn.ngqian.com/dashboard/demo) to try Unified CDN out first.

## Features
- Unified API: Use a **single REST API** framework to get, upload, rename and delete files across 4 different providers.
- Dashboard: Add your file storage providers, **manage access** to projects, and **invite** your friends from a very nicely made dashboard :p
- Analytics: Track **file size changes** and set **storage limits** so u never get charged extra
- **4 file providers**: Supports Cloudflare R2, Blackblaze B2, Amazon S3 and Hackclub CDN.
- Grant codes: Lets you upload files directly from **client** pages, even **easier** than presigned URLs, and adding **client-side functionality** to Hackclub CDN.
- Self-hosted: Runs on your own servers so ur files always stay **yours**!
- Comprehensive docs: So you never get **confused or lost** 

## Screenshots
| Dashboard | Analytics |
| :---: | :---: |
| <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/10b830f4-92c1-4f91-bf72-3e1260970f5f" /> | <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/adcf42db-0958-48e1-bf1b-95ad0ba10590" /> |
| Applications  | File explorer |
| <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/91185fe0-b545-45e2-a916-3fc92d62d50c" /> | <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/b634955d-e97d-42ad-95d0-51adfc8d1e22" /> |
| Databases | Logs |
| <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/abebb0c3-5097-4629-ae56-bac47ef24f58" /> | <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/7639641e-382c-4999-ae59-92e970b3c35c" /> |
| Users | Site settings |
| <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/7fa52fce-2d92-476e-ab70-b84e5d9f83bc" /> | <img width="1686" height="986" alt="image" src="https://github.com/user-attachments/assets/83c00f3f-4a5c-446e-91c3-cd6d97ef20fb" />


## What I've learned

This project had many firsts, and I think it's the hardest thing I've ever attempted. I've also challenged myself to make everything extremely thorough and detailed, such as the overly docs site and the interactive playground.

Before this project, I had no idea how streaming uploads worked, but my container's memory limits pushed me to learn about busboy and proper memory management in JS. I've also never made an npm package before, being a Python guy, so tryna make a fully JS project was quite hard to be honest.

This is also my first time using user access controls in Better Auth, and being quite strict with my authentication (knowing files are at stake!!), along with my first time writing documentation properly on an actual site (wrote the openapi.jsonby hand man) so I don't forget how to use my own app ;p.

While this project is indeed very niche, I do see myself using it in future projects, and I can see how others would be interested. Sure, I might have overengineered it, but I really wanted to try my best, and I think I did.

Finally, since this wouldn't run on Vercel, I had to learn AWS which is so annoying, but I managed to set up some geolocation thing that switches u to the us or sg demo server depending on your location

Hope I can apply these skills in the future :D

## Future plans
- [ ] File API 2.0: Files can expire, become private, queried by tags and sorted into folders
- [ ] Ability change application database & automigrate data
- [ ] Ability to change database's provider & automigrate data
- [ ] Add multiple databases for a single application (can configure how files are stored, such as large files going into a different database)
- [ ] Add multiple providers for a single database (same thing as above)
- [ ] Add more providers, like Oracle and Google
- [ ] Add a python sdk too
