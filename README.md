# Image to Link 🔗

Upload an image from your phone or laptop and get a **direct, permanent, public HTTPS link** you can use anywhere — websites, apps, emails, docs, push notifications, chat, Markdown, anything that takes an image URL.

**Free. No server. Your images live on your own GitHub account.**

👉 **Use it:** https://nadanabill.github.io/image_to_link/

## How it works

- The tool is a static web page (HTML/JS) hosted on GitHub Pages.
- On first use you paste a GitHub token. The page creates a public repo on **your** account (default name `img-links`) and turns on GitHub Pages for it.
- Each upload is committed to `images/` in that repo through the GitHub API, straight from your browser.
- You get a link like `https://<you>.github.io/img-links/images/offer-20261111-153000-ab12.jpg`.
- Images are uploaded **at original quality**. JPG, PNG, GIF and WebP are kept as-is; formats browsers can't display (like iPhone HEIC) are converted to JPEG, and anything over 20 MB is shrunk.
- Optional **"Shrink under 1 MB"** switch for places with a size limit (e.g. Firebase notification images, emails).
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
- Free limits (GitHub Pages): ~1 GB per site, ~100 GB bandwidth/month.
- Don't upload anything private: the repo is public.

---

## بالعربي

أداة بترفع صورة من الموبايل أو اللابتوب وتديك **لينك مباشر وثابت** للصورة، تستخدمه في أي مكان: موقع، تطبيق، إيميل، إشعارات، أي حاجة بتقبل لينك صورة.

- مجانية ومفيش سيرفر. الصور بتترفع على حساب GitHub بتاعك إنت.
- أول مرة: تعمل token من GitHub وتلصقه، والأداة تعمل الـ repo وتفعّل GitHub Pages لوحدها.
- الصورة بتترفع بجودتها الأصلية، وفيه اختيار "صغّر لأقل من 1 ميجا" للأماكن اللي ليها حد للحجم زي إشعارات Firebase.
- بعد الرفع اللينك بياخد حوالي دقيقة لحد ما يشتغل، والأداة بتقولك أول ما يبقى جاهز.
- الـ token بيتحفظ في المتصفح بتاعك بس.

## License

MIT
