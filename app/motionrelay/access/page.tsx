import type { Metadata } from "next";
import { MotionRelayDocumentsPage } from "../../components/MotionRelayDocumentsPage";
export const metadata: Metadata = { title: "Get Motion Relay | Netherwood Data Partners", description: "Request a Motion Relay phone installation invitation.", alternates: { canonical: "/motionrelay/access/" } };
export default function Page() { return <MotionRelayDocumentsPage kind="access" />; }
