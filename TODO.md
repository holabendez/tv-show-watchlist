# Security Alert Next Steps

Because the old keys were visible in your Git commit history, the only way to completely secure your project is to invalidate the old keys. Please complete the following steps:

- [ ] **Rotate Firebase Key:** Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials), make sure your Firebase project is selected in the top left, find the "Browser key (auto created by Firebase)", and click the "Regenerate Key" button.
- [ ] **Rotate TMDB Key:** Log into your [TMDB Account Settings](https://www.themoviedb.org/settings/api) and generate a new API Key.
- [ ] **Update Local App:** Open the `.env` file in your project directory (`C:/Users/nicks/OneDrive/Documents/Vibes/tv-show-watchlist/.env`) and replace the old keys with the new ones you just generated.
- [ ] **Redeploy:** Because the live application (deployed via Firebase Hosting) currently relies on the old, now-invalidated keys, you must rebuild the app (`npm run build`) to bundle the new environment variables, and redeploy it (`firebase deploy --only hosting`) to restore functionality.
- [ ] **Resolve Alert:** Once rotation and deployment are complete, the GitHub Advanced Security alert can be safely marked as resolved.
