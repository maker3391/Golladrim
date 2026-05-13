import {
  KAKAO_MAP_SDK_SCRIPT_ID,
  KAKAO_MAP_SDK_SRC,
} from "@/features/map/components/KakaoMapSdkScript";

let sdkPromise: Promise<void> | null = null;

export function loadKakaoMapSdk() {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.kakao?.maps) {
    return new Promise<void>((resolve) => {
      window.kakao?.maps?.load(resolve);
    });
  }

  if (!KAKAO_MAP_SDK_SRC) {
    return Promise.reject(new Error("Kakao 지도 앱 키가 설정되지 않았습니다."));
  }

  const sdkSrc = KAKAO_MAP_SDK_SRC;

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(KAKAO_MAP_SDK_SCRIPT_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (window.kakao?.maps) {
        window.kakao.maps.load(resolve);
        return;
      }

      reject(new Error("Kakao 지도 SDK를 초기화하지 못했습니다."));
    };

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        handleLoad();
        return;
      }

      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Kakao 지도 SDK 로드에 실패했습니다.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = KAKAO_MAP_SDK_SCRIPT_ID;
    script.src = sdkSrc;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      handleLoad();
    };
    script.onerror = () => reject(new Error("Kakao 지도 SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });

  return sdkPromise;
}
