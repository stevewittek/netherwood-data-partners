import type { Metadata } from "next";
import { MotionRelayDocumentsPage } from "../../components/MotionRelayDocumentsPage";
export const metadata: Metadata = { title: "Motion Relay updates and known issues | Netherwood Data Partners", description: "Update instructions, version information and known issues.", alternates: { canonical: "/motionrelay/releases/" } };
export default function Page() { return <MotionRelayDocumentsPage kind="updates" />; }
