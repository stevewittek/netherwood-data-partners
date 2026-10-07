import ChatWidget from "../ChatWidget";
import { motionRelayDownloads, motionRelayRoutes } from "../content/motion-relay";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../products.css";

export function MotionRelaySetupPage() {
  return (
    <main className="products-page product-detail-page">
      <SiteHeader currentPage="products" />
      <section className="products-hero studio-wrap">
        <div><p className="eyebrow">Motion Connect + Motion Relay</p><h1 id="main-content" tabIndex={-1}>Connect your watch<br />and phone.</h1></div>
        <div className="products-hero-copy"><p>First, confirm access to the Motion Relay phone companion and the supported assistant setup. The watch download alone is not enough.</p><a className="button button-primary" href={motionRelayRoutes.betaSignup}>Request beta access <span aria-hidden="true">↗</span></a><p><a href={motionRelayRoutes.product}>Check current availability</a></p></div>
      </section>
      <section className="product-detail-overview studio-wrap">
        <div><p className="eyebrow">Watch</p><h2>Add Motion Connect.</h2></div>
        <div className="product-prose"><p>1. Pair your compatible watch in Garmin Connect.</p><p>2. Install the data field, currently listed as MotionRelay — Beta Preview, from Connect IQ.</p><p>3. Add it to your activity’s data screens. Use a full-screen, single-field page for the status display.</p><a className="studio-text-link" href={motionRelayDownloads.garmin.url} target="_blank" rel="noreferrer">Get the Garmin data field <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="product-detail-overview studio-wrap">
        <div><p className="eyebrow">Phone and assistant</p><h2>Complete the connection.</h2></div>
        <div className="product-prose"><p>4. Install the phone build supplied with your testing invitation and select your paired watch.</p><p>5. Follow the supplied account and sharing instructions. Authorize only the supported assistant connection you intend to use.</p><p>6. Start the activity and keep the required phone connection available.</p></div>
      </section>
      <section className="product-support studio-wrap">
        <div><p className="eyebrow">Troubleshooting</p><h2>Check each connection.</h2></div>
        <div><p><strong>No watch?</strong> Check that Garmin Connect can see it and Motion Relay has the correct device selected.</p><p><strong>No readings?</strong> Confirm the activity is running with the data field active. Available readings vary by device, activity and sensors.</p><p><strong>Phone received?</strong> This confirms phone acknowledgement, not delivery to the assistant.</p><a href={motionRelayRoutes.support}>Contact support</a><br /><a href={motionRelayRoutes.privacy}>Privacy information</a></div>
      </section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
