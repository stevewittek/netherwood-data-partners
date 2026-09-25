"use client";

import { useEffect } from "react";
import {
  browserSessionStorage,
  captureFirstTouch,
} from "../lib/campaign-attribution";

export function CampaignAttributionCapture() {
  useEffect(() => {
    captureFirstTouch(new URL(window.location.href), browserSessionStorage());
  }, []);

  return null;
}
