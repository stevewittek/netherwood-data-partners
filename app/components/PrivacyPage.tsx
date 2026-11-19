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
          <p className="privacy-updated">Last updated November 19, 2026.</p>
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
          <p className="eyebrow">Optional AI chat</p>
          <h2>Questions, conversations and follow-up</h2>
          <p>When chat is available and you send a question, your message and recent conversation are sent to OpenAI with relevant approved business information to generate a reply. AI answers can be incorrect. Do not share passwords, connection strings, confidential records or sensitive personal information.</p>
          <p>Netherwood keeps recent conversation messages and their service topics privately for owner review for up to 30 days after the last message. Contact details are optional. If you choose to save an inquiry, its name, email, message and topic are kept privately for up to 90 days so Steven can review and respond. Inquiry details and the service topic are also sent through Formspark to notify Netherwood Data Partners by email. No reply time is guaranteed.</p>
          <p>OpenAI response storage is disabled for this integration; that does not eliminate OpenAI’s separate abuse-monitoring retention. Read <a href="https://platform.openai.com/docs/guides/your-data">OpenAI’s API data controls</a>. This chat does not upload files, browse the web, run code or independently send messages. Email notifications are sent only after you explicitly submit an inquiry. Device-based read-aloud is optional and uses a local voice when available. You can also use your screen reader or device dictation.</p>
          <p>Use the business contact below for a privacy or deletion request. Chat can disappear when unavailable or when its credit allowance runs out; the ordinary contact form remains available.</p>
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

    </main>
  );
}
