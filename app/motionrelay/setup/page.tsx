import type { Metadata } from "next";
import { MotionRelaySetupPage } from "../../components/MotionRelaySetupPage";

export const metadata: Metadata = {
  title: "Motion Connect and Motion Relay setup | Netherwood Data Partners",
  description: "Install the MotionRelay Garmin data field and understand the Motion Relay phone companion and authorized AI connection.",
  alternates: { canonical: "/motionrelay/setup/" },
};

export default function Page() { return <MotionRelaySetupPage />; }
