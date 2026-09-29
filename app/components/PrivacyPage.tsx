import ChatWidget from "../ChatWidget";
import { motionRelayName } from "../content/products";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../products.css";

export default function PrivacyPage() {
  return (
    <main className="products-page privacy-page">
      <SiteHeader />
      <section className="products-hero studio-wrap">
        <div>
          <p className="eyebrow">Privacy</p>
          <h1>
            Clear information.
            <br />
            Specific to the product.
          </h1>
        </div>
        <div className="products-hero-copy">
          <p>
            This page explains the current public website at a high level and
            records how product-specific privacy information will be handled as
            Netherwood software moves toward release.
          </p>
          <p className="privacy-updated">Last updated September 28, 2026.</p>
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
          <p className="eyebrow">Products in development</p>
          <h2>Privacy details will follow the implementation</h2>
          <p>
            This marketing website does not currently provide a public account,
            product sign-in or upload flow for Garmin, health, fitness or
            activity data. A product that handles personal data will receive a
            product-specific notice before public release.
          </p>
          <p>
            That notice must accurately describe data access, storage,
            retention, sharing, deletion and the services required for the
            product to work. It will not be presented as complete while the
            implementation is still changing.
          </p>
        </article>
        <article>
          <p className="eyebrow">{motionRelayName} direction</p>
          <h2>No sale of activity data or targeted advertising</h2>
          <p>
            The current direction for the Garmin-connected product is not to
            sell personal Garmin, running, health, fitness or activity data and
            not to use it for targeted advertising. Data sharing is intended to
            be limited to what is needed for the application to function.
          </p>
          <p>
            These principles do not replace the detailed product notice. The
            final disclosure will be checked against the actual data flow before
            release.
          </p>
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
