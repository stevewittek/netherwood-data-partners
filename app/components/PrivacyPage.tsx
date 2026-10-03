import ChatWidget from "../ChatWidget";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../products.css";

export default function PrivacyPage() {
  return <main className="products-page privacy-page">
    <SiteHeader />
    <section className="products-hero studio-wrap"><div><p className="eyebrow">Privacy</p><h1>Choose the notice for the service you use.</h1></div><div className="products-hero-copy"><p>Netherwood Data Partners operates this website and Motion Relay. The phone companion has its own privacy and deletion information.</p><p className="privacy-updated">Last updated October 3, 2026.</p></div></section>
    <section className="privacy-content studio-wrap">
      <article><p className="eyebrow">Motion Relay for Android</p><h2><a href="/privacy/motion-relay/">Read the Motion Relay privacy notice</a></h2><p>Learn what the phone companion handles, when current-run data is shared, and how long the connector keeps it.</p><p><a href="/privacy/motion-relay/delete/">Delete a Motion Relay membership or account →</a></p></article>
      <article><p className="eyebrow">Website inquiries</p><h2>Information you choose to send</h2><p>The contact form sends the details you enter to Netherwood’s form delivery provider so the company can receive and respond to your inquiry. You can email us instead.</p><p>When a campaign link is used, the site can include limited campaign labels and the path of the first page visited with your inquiry. That attribution is held for the current browser tab, not a cross-site advertising profile.</p></article>
      <article><p className="eyebrow">Questions</p><h2>Contact Netherwood</h2><p>Email <a href="mailto:contact@NetherwoodDataPartners.com">contact@Netherwood<wbr />DataPartners.com</a> for website or product privacy questions.</p></article>
    </section><SiteFooter /><ChatWidget />
  </main>;
}
