"use client";

import { useEffect } from "react";
import { track } from "@/analytics/client";

// Records a page view for pages that are otherwise fully server-rendered
export function TrackAboutView() {
  useEffect(() => {
    track({ name: "about_viewed", props: {} });
  }, []);
  return null;
}
