import ChatWidget from "../ChatWidget";
import { motionRelayDownloads, motionRelayRoutes } from "../content/motion-relay";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../products.css";

export function MotionRelaySetupPage() {
  return (
    <main className="products-page product-detail-page">
      <SiteHeader currentPage="products" />
      <section className="products-hero studio-wrap">
        <div><p className="eyebrow">Motion Connect + Motion Relay</p><h1>Set up the watch-to-phone connection.</h1></div>
        <div className="products-hero-copy">
          <p>Motion Connect is the watch screen inside the Garmin listing named MotionRelay. Motion Relay is the separate phone companion. You need both for the complete experience.</p>
          <a className="button button-primary" href={motionRelayDownloads.garmin.url} target="_blank" rel="noreferrer">Get the Garmin watch app <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <section className="product-detail-overview studio-wrap">
        <div><p className="eyebrow">Watch setup</p><h2>Add the data field to an activity.</h2></div>
        <div className="product-prose">
          <p>1. Pair a compatible Garmin watch with Garmin Connect on your phone.</p>
          <p>2. Install MotionRelay from the Connect IQ Store and sync it to your watch.</p>
          <p>3. Open a compatible activity, edit its data screens, and add MotionRelay as a Connect IQ data field. A full-screen, single-field page gives the clearest Motion Connect status display.</p>
        </div>
      </section>
      <section className="product-detail-overview studio-wrap">
        <div><p className="eyebrow">Phone + AI setup</p><h2>Complete the connection on your phone.</h2></div>
        <div className="product-prose">
          <p>4. Install Motion Relay from your phone’s store when its listing becomes available. <a href={motionRelayRoutes.product}>Check the current iPhone and Android download status</a>.</p>
          <p>5. Open Motion Relay, choose your paired Garmin watch, and complete sharing and account setup. Link the supported AI account you want to authorize.</p>
          <p>6. Start the activity and keep the required phone connection available. “Phone received” means the companion acknowledged the watch packet; it does not confirm that ChatGPT received it.</p>
          <p><a className="studio-text-link" href={motionRelayRoutes.product}>View product details and download status <span aria-hidden="true">↗</span></a></p>
        </div>
      </section>
      <section className="product-support studio-wrap">
        <div><p className="eyebrow">Help</p><h2>Need setup support?</h2></div>
        <div><p>Check that Garmin Connect can see the watch, the data field is active in the current activity, and Motion Relay shows the selected watch.</p><a href={motionRelayRoutes.privacy}>Privacy</a><br /><a href={motionRelayRoutes.support}>Contact Netherwood</a></div>
      </section>
      <SiteFooter />
      <ChatWidget />
    </main>
  );
}
