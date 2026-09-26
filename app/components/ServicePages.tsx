import { getService, services, type Service } from "../content/services";
import { SiteFooter, SiteHeader } from "./SiteChrome";
import "../services.css";
import { CommunityPhoto } from "./Community";

function ServiceContact({ assessment = false }: { assessment?: boolean }) {
  return (
    <section
      className="services-contact"
      aria-labelledby="services-contact-heading"
    >
      <div className="studio-wrap services-contact-inner">
        <div>
          <p className="eyebrow">A useful place to start</p>
          <h2 id="services-contact-heading">
            Tell us what’s getting in the way.
          </h2>
          <p>
            Bring the application question, the data problem or the change you
            are considering. We can work out a useful next step together.
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
              : "Talk about your business"}
            <span aria-hidden="true">↗</span>
          </a>
          <a href="mailto:contact@netherwooddatapartners.com">
            contact@netherwooddatapartners.com
          </a>
          <p>Work directly with founder and database engineer Steven Wittek.</p>
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
        <p className="eyebrow">Software · Data · Support</p>
        <h1>
          The technology behind
          <br />
          your everyday business.
        </h1>
        <p className="services-lede">
          Software that needs attention. Data that needs to make sense. Systems
          that need to work together. Get personal, technically grounded help
          for the work in front of you.
        </p>
        <div className="studio-actions">
          <a className="button button-primary" href="/#contact">
            Talk about your business <span aria-hidden="true">↗</span>
          </a>
          <a
            className="studio-text-link"
            href="/migration-intake/?intent=assessment"
          >
            Request a systems assessment
          </a>
        </div>
        <p className="services-location">
          Based in New Jersey · Central NJ, the Tri-State region and practical
          remote US projects
        </p>
        <figure className="community-service-photo">
          <CommunityPhoto
            name="software-support"
            alt="Illustrative scene of a business manager and consultant investigating an application together"
            priority
          />
          <figcaption>
            AI-generated illustrative scene; not actual clients or staff.
          </figcaption>
        </figure>
      </section>

      <section className="services-band">
        <div className="studio-wrap services-split">
          <div>
            <p className="eyebrow">A specialist in your corner</p>
            <h2>
              Someone who can connect the business problem to the technical
              detail.
            </h2>
          </div>
          <div className="services-prose">
            <p>
              Your staff knows the work. Your vendor knows its product.
              Netherwood helps investigate the application, the data and the
              connections between them, then works with you on a practical fix.
            </p>
            <p>
              A focused issue, a planned project or ongoing support: agree the
              scope and responsibilities before work begins. You keep control of
              your software choices and your data.
            </p>
          </div>
        </div>
      </section>

      <section
        className="studio-wrap services-section"
        aria-labelledby="services-list-heading"
      >
        <div className="services-section-heading">
          <div>
            <p className="eyebrow">Find your starting point</p>
            <h2 id="services-list-heading">
              Help for today.
              <br />A plan for what’s next.
            </h2>
          </div>
          <p>
            Start with an application problem, a database question, a workflow
            or a planned change. The scope follows what your business needs.
          </p>
        </div>
        <div className="services-list">
          {services.map((service, index) => (
            <ServiceLink key={service.slug} service={service} index={index} />
          ))}
        </div>
      </section>

      <section className="services-band">
        <div className="studio-wrap services-split">
          <div>
            <p className="eyebrow">Specialist capability, a defined project</p>
            <h2>You shouldn’t need an entire data department.</h2>
          </div>
          <div className="services-prose">
            <p>
              Established small and midsize businesses face difficult data
              problems without an in-house DBA, data engineer or migration
              specialist. Work directly with Steven, a senior database engineer
              comfortable with complex production systems.
            </p>
            <p>
              Start with the issue you need to solve. That may become a focused
              investigation, a systems assessment, a project or ongoing support.
              Fees, responsibilities and the way we will check the result are
              agreed before work begins.
            </p>
            <a className="studio-text-link" href="/about/">
              Meet Steven <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="studio-wrap services-section services-split">
        <div>
          <p className="eyebrow">Not sure how involved it will be?</p>
          <h2>Thinking about replacing a system?</h2>
        </div>
        <div className="services-prose">
          <p>
            The migration readiness tool helps identify what is known, what
            needs planning and where to ask for help. Your result is available
            without providing contact details.
          </p>
          <a className="studio-text-link" href="/migration-readiness/">
            Check your migration readiness <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <ServiceContact />
      <SiteFooter />
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
          <h1>Service not found</h1>
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
        <h1>{service.headline}</h1>
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
              : "Tell us about your project"}{" "}
            <span aria-hidden="true">↗</span>
          </a>
          <a className="studio-text-link" href="#service-approach">
            See how the work fits together <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="services-band">
        <div className="studio-wrap services-split">
          <div>
            <p className="eyebrow">Sound familiar?</p>
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
            <p className="eyebrow">How Netherwood helps</p>
            <h2 id="services-approach-heading">
              A clear scope.
              <br />
              Careful technical work.
            </h2>
          </div>
          <p>
            Start with the business need, inspect the actual environment and
            agree how the result will be checked.
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
            <p className="eyebrow">Something useful to take forward</p>
            <h2>What the engagement can include.</h2>
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
          <p className="eyebrow">Database engineering underneath</p>
          <h2>
            Business language.
            <br />
            Technical depth.
          </h2>
        </div>
        <div className="services-prose">
          <p>{service.technical}</p>
          <p>{service.boundary}</p>
          <a className="studio-text-link" href="/about/">
            Work directly with Steven <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section
        className="studio-wrap services-faq"
        aria-labelledby="services-questions-heading"
      >
        <p className="eyebrow">Before we talk</p>
        <h2 id="services-questions-heading">A couple of useful questions.</h2>
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
        <p className="eyebrow">Depending on where you are starting</p>
        <h2 id="services-related-heading">Related work.</h2>
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
