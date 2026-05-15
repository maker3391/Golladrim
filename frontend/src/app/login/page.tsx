"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const OAUTH_CHANNEL_NAME = "golladrim:oauth";

function LoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get("message") ?? "소셜 로그인 중 문제가 발생했습니다.";

    if (window.opener) {
      const payload = {
        type: "oauth2:error",
        message,
      };

      window.opener.postMessage(payload, window.location.origin);

      const channel = new BroadcastChannel(OAUTH_CHANNEL_NAME);
      channel.postMessage(payload);
      channel.close();

      window.close();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    router.replace(params.size > 0 ? `/?${params.toString()}` : "/");
  }, [router, searchParams]);

  return null;
}

export default function LoginRedirectPage() {
  return (
    <Suspense fallback={null}>
      <LoginRedirectContent />
    </Suspense>
  );
}
