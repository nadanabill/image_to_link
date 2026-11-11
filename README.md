# Image to Link 🔗

Upload an image from your phone or laptop and get a **direct, permanent, public HTTPS link** — perfect for Firebase in-app / push notification images, which only accept a URL.

**Free. No server. Your images live on your own GitHub account.**

👉 **Use it:** https://nadanabill.github.io/image_to_link/

## How it works

- The tool is a static web page (HTML/JS) hosted on GitHub Pages.
- On first use you paste a GitHub token. The page creates a public repo on **your** account (default name `img-links`) and turns on GitHub Pages for it.
- Each upload is committed to `images/` in that repo through the GitHub API, straight from your browser.
- You get a link like `https://<you>.github.io/img-links/images/offer-20261111-153000-ab12.jpg`.
- Images over 1 MB (or in formats like WebP/HEIC) are re-encoded to JPEG under 1 MB, because FCM notification images are limited to 1 MB.
- The token is stored only in your browser's `localStorage`. Nothing is sent anywhere except `api.github.com`.

## Setup (once, ~3 minutes)

**Quick way — Classic token**
1. Open the tool and click **Quick way (Classic token)**. It opens GitHub with the `public_repo` scope preselected.
2. Set an expiration, click **Generate token**, copy it.
3. Paste it in the tool and click **Connect & set up**.

**More secure way — Fine-grained token (access to one repo only)**
1. Create a public repo, e.g. `img-links`.
2. Create a [fine-grained token](https://github.com/settings/personal-access-tokens/new) → *Only select repositories* → that repo.
3. Permissions: `Contents` read/write, `Pages` read/write, `Administration` read/write.
4. Paste it in the tool.

If GitHub Pages can't be enabled automatically, the tool shows a button to the repo's **Settings → Pages**: choose *Deploy from a branch*, branch `main`, folder `/ (root)`.

## Notes

- After an upload, GitHub Pages needs ~30–90 seconds to publish. The tool watches the link and tells you when it's live.
- Free limits (GitHub Pages): ~1 GB per site, ~100 GB bandwidth/month — plenty for notification images.
- Don't upload anything private: the repo is public.

---

## بالعربي

أداة بترفع صورة من الموبايل أو اللابتوب وتديك **لينك مباشر وثابت** للصورة، مناسب لصور إشعارات Firebase.

- مجانية ومفيش سيرفر. الصور بتترفع على حساب GitHub بتاعك إنت.
- أول مرة: تعمل token من GitHub وتلصقه، والأداة تعمل الـ repo وتفعّل GitHub Pages لوحدها.
- الصور اللي أكبر من 1 ميجا بتتضغط تلقائيًا.
- بعد الرفع اللينك بياخد حوالي دقيقة لحد ما يشتغل، والأداة بتقولك أول ما يبقى جاهز.
- الـ token بيتحفظ في المتصفح بتاعك بس.

## License

MIT
