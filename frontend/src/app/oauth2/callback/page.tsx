// oauth2/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const OAUTH_CHANNEL_NAME = "golladrim:oauth";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (window.opener) {
      const payload = {
        type: "oauth2:success",
      };

      window.opener.postMessage(payload, window.location.origin);

      const channel = new BroadcastChannel(OAUTH_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();

      window.close();
      return;
    }

    router.replace("/main");
  }, [router]);

  return null;
}
