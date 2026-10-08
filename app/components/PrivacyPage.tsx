import ChatWidget from "../ChatWidget";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../products.css";

export default function PrivacyPage() {
  return (
    <main className="products-page privacy-page">
      <SiteHeader />
      <section className="products-hero studio-wrap">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1 id="main-content" tabIndex={-1}>
            Website and product privacy.
          </h1>
        </div>
        <div className="products-hero-copy">
          <p>
            This page explains the current public website at a high level and
            records how product-specific privacy information will be handled as
            Netherwood software moves toward release.
          </p>
          <p className="privacy-updated">Last updated October 1, 2026.</p>
        </div>
      </section>
      <section className="privacy-content studio-wrap">
        <article>
          <p className="eyebrow">Website inquiries</p>
          <h2>Information you choose to send</h2>
          <p>
            The contact form sends the details you enter to Netherwood’s form
            delivery provider so the company can receive and respond to the
            inquiry. You can use the published business email address instead.
          </p>
          <p>
            When a campaign link is used, the website can include a small set of
            campaign labels and the path of the first page visited with the
            inquiry. That attribution is held for the current browser tab; it is
            not a cross-site advertising profile.
          </p>
        </article>
        <article>
          <p className="eyebrow">Motion Relay</p>
          <h2>Phone app and connector privacy</h2>
          <p><a href="/privacy/motion-relay/">Read the Motion Relay privacy policy</a> for the United States adult preview, optional sharing and compact backup.</p>
          <p><a href="/privacy/motion-relay/delete/">Account and data deletion</a> · <a href="/terms/motion-relay/">Terms</a> · <a href="/support/motion-relay/">Support</a></p>
        </article>
        <article>
          <p className="eyebrow">Questions</p>
          <h2>Contact Netherwood Data Partners</h2>
          <p>
            For a website or product privacy question, email{" "}
            <a href="mailto:contact@NetherwoodDataPartners.com">
              contact@Netherwood<wbr />DataPartners.com
            </a>
            . Product support currently uses this same business contact.
          </p>
        </article>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
