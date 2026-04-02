"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("hr_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("hr_sid", sid);
  }
  return sid;
}

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 관리자 페이지 추적 제외
    if (pathname.startsWith("/admin")) return;

    const sessionId = getOrCreateSessionId();

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || "",
        sessionId,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
