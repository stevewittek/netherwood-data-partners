import { SiteFooter, SiteHeader } from "./SiteChrome";
import { favoriteJokes, gameSteps, hangDadProduct, redditGameUrl } from "../content/hang-in-there-dad";
import "../products.css";
import "../hang-in-there-dad.css";

export function HangInThereDadPage() {
  return (
    <main className="products-page product-detail-page hang-dad-page">
      <SiteHeader currentPage="products" />
      <section className="hang-dad-hero studio-wrap">
        <div>
          <a className="studio-text-link" href="/products/#fun-projects">← Fun Projects</a>
          <p className="eyebrow">Word puzzles · Family fun</p>
          <h1 id="main-content" tabIndex={-1}>Hang in There, Dad!</h1>
          <p className="product-detail-summary">A little word game, some terrible jokes, and a dad who keeps getting into trouble.</p>
          <a className="button button-primary" href={redditGameUrl}>Play Free on Reddit <span aria-hidden="true">↗</span></a>
        </div>
        <figure className="hang-dad-art">
          <img src={hangDadProduct.image!.src} alt={hangDadProduct.image!.alt} width="870" height="520" fetchPriority="high" />
          <figcaption>Dad’s rescue mission. Oreo’s afternoon entertainment.</figcaption>
        </figure>
      </section>
      <section className="hang-dad-section studio-wrap" aria-labelledby="how-to-play-title">
        <p className="eyebrow">One letter at a time</p><h2 id="how-to-play-title">How to Play</h2>
        <ol className="hang-dad-steps">{gameSteps.map((step, index) => <li key={step}><span aria-hidden="true">0{index + 1}</span><p>{step}</p></li>)}</ol>
      </section>
      <section className="hang-dad-section studio-wrap" aria-labelledby="game-gallery-title">
        <p className="eyebrow">A look at the game</p><h2 id="game-gallery-title">A cat to rescue. A punchline to guess.</h2>
        <p className="hang-dad-hint">Game previews and scenes from Dad’s adventures.</p>
        <div className="hang-dad-gallery">
          <figure><a href="/images/hang-in-there-dad/splash-390.webp" aria-label="View the full game opening screen"><img src="/images/hang-in-there-dad/splash-390.webp" alt="Game opening screen with Dad hanging from the tree, Oreo above, and the ladder tipping away." width="390" height="620" loading="lazy" decoding="async" /></a><figcaption>Oreo’s Great Escape: an ordinary afternoon gets out of hand.</figcaption></figure>
          <figure><a href="/images/hang-in-there-dad/puzzle-390.webp" aria-label="View the full letter-guessing game screen"><img src="/images/hang-in-there-dad/puzzle-390.webp" alt="A dad-joke puzzle with missing punchline letters, guesses remaining, and the on-screen letter keyboard below Dad and Oreo." width="390" height="650" loading="lazy" decoding="async" /></a><figcaption>Read the joke, choose a letter, and see how Dad gets on.</figcaption></figure>
          <figure><a href="/images/hang-in-there-dad/ball-pit-scene.webp" aria-label="View the full indoor ball-pit scene"><img src="/images/hang-in-there-dad/ball-pit-scene.webp" alt="Dad hoists himself into a soft-play tunnel while his daughters watch beside the indoor ball pit." width="362" height="204" loading="lazy" decoding="async" /></a><figcaption>Dad vs. the Ball Pit: the kids make it look so easy.</figcaption></figure>
          <figure><a href="/images/hang-in-there-dad/playground-scene.webp" aria-label="View the full playground scene"><img src="/images/hang-in-there-dad/playground-scene.webp" alt="Dad balances beneath the playground monkey bars while children celebrate around him." width="362" height="204" loading="lazy" decoding="async" /></a><figcaption>Playground Takeover: still on duty, even after the rescue.</figcaption></figure>
        </div>
      </section>
      <section className="hang-dad-section studio-wrap" aria-labelledby="favorite-jokes-title">
        <p className="eyebrow">A groan is as good as a laugh</p><h2 id="favorite-jokes-title">A Few of Our Favorite Jokes</h2>
        <p className="hang-dad-hint">Tap a question to reveal the punchline.</p>
        <div className="hang-dad-jokes">{favoriteJokes.map(joke => <details key={joke.question}><summary>{joke.question}</summary><p>{joke.answer}</p></details>)}</div>
      </section>
      <section className="hang-dad-section hang-dad-play studio-wrap" aria-labelledby="game-play-title">
        <h2 id="game-play-title">Dad could use a hand.</h2>
        <p>Hang in There, Dad! is free to play directly on Reddit. No separate app to install.</p>
        <a className="button button-primary" href={redditGameUrl}>Play Free on Reddit <span aria-hidden="true">↗</span></a>
      </section>
      <SiteFooter />
    </main>
  );
}
