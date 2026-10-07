import { getService, services, type Service } from "../content/services";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../services.css";

function ServiceContact({ assessment = false }: { assessment?: boolean }) {
  return (
    <section
      className="services-contact"
      aria-labelledby="services-contact-heading"
    >
      <div className="studio-wrap services-contact-inner">
        <div>
          <p className="eyebrow">Contact</p>
          <h2 id="services-contact-heading">
            Discuss a data or software problem.
          </h2>
          <p>
            Describe the issue, the system and the result you need.
          </p>
        </div>
        <div className="services-contact-actions">
          <a
            className="button button-light"
            href={
              assessment ? "/migration-intake/?intent=assessment" : "/#contact"
            }
          >
            {assessment
              ? "Request a systems assessment"
              : "Send an inquiry"}
            <span aria-hidden="true">↗</span>
          </a>
          <a href="mailto:contact@netherwooddatapartners.com">
            contact@netherwooddatapartners.com
          </a>
          <p>Software and database consulting from Netherwood Data Partners.</p>
        </div>
      </div>
    </section>
  );
}

function ServiceLink({ service, index }: { service: Service; index?: number }) {
  return (
    <article className="services-list-item">
      {index !== undefined && (
        <span className="services-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div>
        <h3>
          <a href={`/services/${service.slug}/`}>
            {service.title} <span aria-hidden="true">↗</span>
          </a>
        </h3>
        <p>{service.description}</p>
      </div>
    </article>
  );
}

export function ServicesIndex() {
  return (
    <main className="services-page community-services-index">
      <SiteHeader currentPage="services" />
      <section className="studio-wrap services-hero">
        <p className="eyebrow">Consulting</p><h1 id="main-content" tabIndex={-1}>Database and<br />software expertise.</h1>
        <p className="services-lede">Netherwood helps businesses investigate SQL Server problems, move data and connect applications. Work is scoped around a specific problem or change.</p>
        <div className="studio-actions"><a className="button button-primary" href="/#contact">Discuss a project <span aria-hidden="true">↗</span></a><a className="studio-text-link" href="/products/">Explore products <span aria-hidden="true">↗</span></a></div>
        <p className="services-location">New Jersey · Meetings by appointment</p>
      </section>
      <section className="studio-wrap services-section" aria-labelledby="services-list-heading">
        <div className="services-section-heading"><div><p className="eyebrow">Areas of work</p><h2 id="services-list-heading">Databases, migrations<br />and integrations.</h2></div><p>Choose the area closest to your question. Scope, fees and availability are agreed before work begins.</p></div>
        <div className="services-list">{services.map((service,index)=><ServiceLink key={service.slug} service={service} index={index} />)}</div>
      </section>
      <section className="services-band"><div className="studio-wrap services-split"><div><p className="eyebrow">The process</p><h2>Investigate. Agree. Check.</h2></div><div className="services-prose"><p>Each project starts with the evidence, an agreed scope and a way to check the result. You receive findings and handover notes for the agreed scope.</p><p>Your existing software provider remains involved where its access or product knowledge is needed.</p><a className="studio-text-link" href="/about/">About Netherwood <span aria-hidden="true">↗</span></a></div></div></section>
      <section className="studio-wrap services-section services-split"><div><p className="eyebrow">Planning a move</p><h2>Check what needs preparation.</h2></div><div className="services-prose"><p>The migration self-check highlights questions to investigate. Results are available without contact details.</p><a className="studio-text-link" href="/migration-readiness/">Check migration readiness <span aria-hidden="true">↗</span></a><br /><a className="studio-text-link" href="/migration-intake/">Describe a migration</a></div></section>
      <ServiceContact /><SiteFooter />
    </main>
  );
}

export function ServiceDetailPage({ slug }: { slug: string }) {
  const service = getService(slug);
  if (!service) {
    return (
      <main className="services-page community-services-index">
        <SiteHeader currentPage="services" />
        <section className="studio-wrap services-hero">
          <h1 id="main-content" tabIndex={-1}>Service not found</h1>
          <p>Explore the available software, data and support services.</p>
          <a className="studio-text-link" href="/services/">
            View services
          </a>
        </section>
        <SiteFooter />
      </main>
    );
  }
  const assessment = service.slug === "legacy-systems-assessment";
  const related = service.related
    .map(getService)
    .filter((item): item is Service => Boolean(item));

  return (
    <main className="services-page community-services-index">
      <SiteHeader currentPage="services" />
      <section className="studio-wrap services-hero services-detail-hero">
        <a className="services-back" href="/services/">
          ← All services
        </a>
        <p className="eyebrow">{service.title}</p>
        <h1 id="main-content" tabIndex={-1}>{service.headline}</h1>
        <p className="services-lede">{service.intro}</p>
        <div className="studio-actions">
          <a
            className="button button-primary"
            href={
              assessment ? "/migration-intake/?intent=assessment" : "/#contact"
            }
          >
            {assessment
              ? "Request a systems assessment"
              : "Discuss a project"}{" "}
            <span aria-hidden="true">↗</span>
          </a>
          <a className="studio-text-link" href="#service-approach">
            See the approach <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="services-band">
        <div className="studio-wrap services-split">
          <div>
            <p className="eyebrow">When this helps</p>
            <h2>{service.situation}</h2>
          </div>
          <ul className="services-situations">
            {service.situations.map((situation) => (
              <li key={situation}>{situation}</li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="studio-wrap services-section"
        id="service-approach"
        aria-labelledby="services-approach-heading"
      >
        <div className="services-section-heading">
          <div>
            <p className="eyebrow">The work</p>
            <h2 id="services-approach-heading">
              How I approach it.
            </h2>
          </div>
          <p>
            The exact steps depend on your system and agreed scope.
          </p>
        </div>
        <ol className="services-steps">
          {service.approach.map((step, index) => (
            <li key={step.title}>
              <span className="services-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="services-band">
        <div className="studio-wrap services-split">
          <div>
            <p className="eyebrow">Deliverables</p>
            <h2>What the work can include.</h2>
            <p className="services-body">
              Exact deliverables, access, responsibilities and
              professional-services fees are agreed for your project.
            </p>
          </div>
          <ul className="services-deliverables">
            {service.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="studio-wrap services-section services-split">
        <div>
          <p className="eyebrow">Scope and limits</p>
          <h2>
            What to know before starting.
          </h2>
        </div>
        <div className="services-prose">
          <p>{service.technical}</p>
          <p>{service.boundary}</p>
          <a className="studio-text-link" href="/about/">
            About the company <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section
        className="studio-wrap services-faq"
        aria-labelledby="services-questions-heading"
      >
        <p className="eyebrow">Before we talk</p>
        <h2 id="services-questions-heading">Common questions.</h2>
        {service.questions.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>

      <section
        className="studio-wrap services-section"
        aria-labelledby="services-related-heading"
      >
        <p className="eyebrow">Other services</p>
        <h2 id="services-related-heading">Related services.</h2>
        <div className="services-related">
          {related.map((item) => (
            <ServiceLink key={item.slug} service={item} />
          ))}
        </div>
      </section>
      <ServiceContact assessment={assessment} />
      <SiteFooter />
    </main>
  );
}
