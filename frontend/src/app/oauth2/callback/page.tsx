"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: "oauth2:success" }, window.location.origin);
      window.close();
      return;
    }

    router.replace("/main");
  }, [router]);

  return null;
}
