import ChatWidget from "../ChatWidget";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../products.css";

export function MotionRelaySupportPage() {
  return (
    <main className="products-page privacy-page">
      <SiteHeader />
      <section className="products-hero studio-wrap">
        <div>
          <p className="eyebrow">Motion Relay</p>
          <h1>Support.</h1>
        </div>
        <div className="products-hero-copy">
          <p>
            Get help with Motion Relay, the Motion Connect Garmin data field,
            phone pairing, sharing, account access or deletion.
          </p>
        </div>
      </section>
      <section className="privacy-content studio-wrap">
        <article>
          <h2>Check the connection first</h2>
          <p>
            Confirm that Garmin Connect can see your watch, Motion Connect is
            active in the workout you started, Bluetooth is on, and Motion
            Relay shows the intended watch. Keep the phone app open during an
            initial test.
          </p>
          <p>
            Follow the <a href="/motionrelay/setup/">setup guide</a> for the
            complete watch-to-phone sequence.
          </p>
        </article>
        <article>
          <h2>Contact support</h2>
          <p>
            Email{" "}
            <a href="mailto:contact@NetherwoodDataPartners.com?subject=Motion%20Relay%20support">
              contact@Netherwood<wbr />DataPartners.com
            </a>{" "}
            with the phone platform, watch model, app version and a short
            description of what happened. Do not send a password, access token,
            private health data, raw watch telemetry or precise location.
          </p>
        </article>
        <article>
          <h2>Privacy and deletion</h2>
          <p>
            Read the <a href="/privacy/motion-relay/">privacy notice</a> or use
            the <a href="/privacy/motion-relay/delete/">external deletion page</a>
            if you no longer have access to the app.
          </p>
        </article>
        <article>
          <h2>Fitness and emergencies</h2>
          <p>
            Motion Relay is a fitness companion, not a medical device,
            emergency monitor or rescue service. Stop the activity and seek
            appropriate help for an emergency or alarming symptoms.
          </p>
        </article>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
