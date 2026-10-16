import type { Metadata } from "next";
import { MotionRelayDocumentsPage } from "../../components/MotionRelayDocumentsPage";
export const metadata: Metadata = { title: "Motion Relay compatibility | Netherwood Data Partners", description: "Watch, phone, workout and assistant connection requirements.", alternates: { canonical: "/motionrelay/compatibility/" } };
export default function Page() { return <MotionRelayDocumentsPage kind="compatibility" />; }
