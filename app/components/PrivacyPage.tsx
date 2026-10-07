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
          <p className="eyebrow">Motion Connect and Motion Relay</p>
          <h2>Watch field available; phone companions forthcoming</h2>
          <p>
            This marketing website does not currently provide a public account,
            product sign-in or upload flow for Garmin, health, fitness or
            activity data. The MotionRelay Garmin Connect IQ data field is
            publicly listed. It accesses available live activity readings for
            the Motion Connect watch screen and phone connection. The separate
            Motion Relay iPhone and Android store listings are not public yet.
          </p>
          <p>
            The connected phone and AI experience requires separate setup and
            authorization. The watch download alone does not send readings to
            an AI account. Companion privacy details will be checked against
            the release build and its data flow before phone publication.
          </p>
        </article>
        <article>
          <p className="eyebrow">{motionRelayName} direction</p>
          <h2>Activity data is for the connection you choose</h2>
          <p>
            The current Garmin listing says Motion Relay does not sell workout
            data, use it for targeted advertising, or collect GPS tracks or
            precise coordinates through this live feed. When you choose to
            connect ChatGPT, the metrics you send are shared with OpenAI under
            your account settings and its applicable terms.
          </p>
          <p>
            These points summarize the published watch listing. They do not
            replace the detailed phone companion notice that must match the
            public release build.
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
