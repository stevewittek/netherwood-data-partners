import ChatWidget from "../ChatWidget";
import { motionRelayDownloads, motionRelayRoutes } from "../content/motion-relay";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../products.css";

export function MotionRelaySetupPage() {
  return (
    <main className="products-page product-detail-page">
      <SiteHeader currentPage="products" />
      <section className="products-hero studio-wrap">
        <div><p className="eyebrow">Motion Relay · Beta</p><h1 id="main-content" tabIndex={-1}>Connect your watch<br />and phone.</h1></div>
        <div className="products-hero-copy"><p>Bring your live Garmin metrics into view. Connect your watch, install Motion Relay on your phone and choose your workout display.</p><a className="button button-primary" href={motionRelayRoutes.access}>Get Motion Relay <span aria-hidden="true">↗</span></a><p><a href={motionRelayRoutes.product}>Explore Motion Relay</a></p></div>
      </section>
      <section className="product-detail-overview studio-wrap">
        <div><p className="eyebrow">Watch</p><h2>Add Motion Relay.</h2></div>
        <div className="product-prose"><p>1. Pair your compatible watch in Garmin Connect.</p><p>2. Install the Motion Relay data field from Connect IQ.</p><p>3. Add it to your activity’s data screens. Use a full-screen, single-field page for the status display.</p><a className="studio-text-link" href={motionRelayDownloads.garmin.url} target="_blank" rel="noreferrer">Get the Garmin data field <span aria-hidden="true">↗</span></a></div>
      </section>
      <section className="product-detail-overview studio-wrap">
        <div><p className="eyebrow">Phone and assistant</p><h2>Complete the connection.</h2></div>
        <div className="product-prose"><p>4. Use your phone’s installation link, open Motion Relay and select your paired watch.</p><p>5. Complete the account steps shown. If you use ChatGPT, follow its separate connection and sharing instructions.</p><p>6. Start the activity on your watch and keep Motion Relay open nearby for the first check. Confirm that available current readings appear on Home before continuing. If no readings arrive, use <a className="studio-text-link" href={motionRelayRoutes.support}>connection help</a>; selecting a watch does not verify a received reading.</p><p>7. Pause, resume and save the activity on your watch. In Settings, choose your Home and Lock Screen readings and preferred display size.</p></div>
      </section>
      <section className="product-support studio-wrap">
        <div><p className="eyebrow">Troubleshooting</p><h2>Check each connection.</h2></div>
        <div><p>Keep Garmin Connect paired with the watch selected in Motion Relay. Add the data field to each activity you use.</p><p>Use Home to check your connection and Metrics to explore your workout. For device requirements and connection help, visit the <a href={motionRelayRoutes.compatibility}>compatibility guide</a> and <a href={motionRelayRoutes.updates}>updates and known issues</a>.</p><a href={motionRelayRoutes.support}>Contact support</a><br /><a href={motionRelayRoutes.privacy}>Privacy information</a></div>
      </section>
      <SiteFooter /><ChatWidget />
    </main>
  );
}
