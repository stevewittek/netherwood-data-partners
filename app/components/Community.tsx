import "../community.css";

export function CommunityPhoto({
  name,
  alt,
  priority = false,
}: {
  name: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <img
      className="community-photo"
      src={`/images/community/${name}.webp`}
      srcSet={`/images/community/${name}-768.webp 768w, /images/community/${name}.webp 1536w`}
      sizes="(max-width: 760px) 100vw, 55vw"
      width={1536}
      height={1024}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

const towns = [
  "Newark",
  "Cranford",
  "Westfield",
  "Fanwood",
  "Netherwood",
  "Plainfield",
  "Dunellen",
  "Bound Brook",
  "Somerville",
];

export function CommunityRoots() {
  return (
    <section className="community-roots" id="community">
      <div className="community-roots-backdrop" aria-hidden="true">
        <img
          src="/images/community/netherwood-station.webp"
          alt=""
          width={1536}
          height={1020}
          loading="lazy"
        />
      </div>
      <div className="studio-wrap community-roots-content">
        <p className="eyebrow">The place behind the name</p>
        <h2>
          Connected by a line.
          <br />
          Rooted in a community.
        </h2>
        <p>
          Netherwood, Plainfield and the communities along the Raritan Valley
          Line. A place of independent businesses, different backgrounds and
          people building something of their own.
        </p>
        <p>
          That’s the spirit behind Netherwood Data Partners: personal service,
          local roots and practical technical help.
        </p>
        <div
          className="community-rail"
          aria-label="Selected communities along the Raritan Valley Line"
        >
          <ol>
            {towns.map((town) => (
              <li
                key={town}
                className={
                  town === "Netherwood" ? "community-rail-home" : undefined
                }
              >
                <span className="community-rail-stop" aria-hidden="true" />
                <span>{town}</span>
                {town === "Netherwood" && <small>Our namesake</small>}
              </li>
            ))}
          </ol>
        </div>
        <div className="community-map-caption">
          <span>Selected local communities · Schematic, not a transit map</span>
          <a href="/#contact">
            Let’s talk, neighbor <span aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="community-station-credit">
          Netherwood station photograph:{" "}
          <a href="https://commons.wikimedia.org/wiki/File:NETHERWOOD_STATION,_UNION_COUNTY,_NJ.jpg">
            Jerrye & Roy Klotz MD
          </a>{" "}
          ·{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">
            CC BY-SA 4.0
          </a>{" "}
          · Resized; display crop and overlay. Community motif inspired by the{" "}
          <a href="https://www.njtransit.com/abc_Raritan_Valley_Line">
            Raritan Valley Line
          </a>
          ; no transit affiliation.
        </p>
      </div>
    </section>
  );
}
