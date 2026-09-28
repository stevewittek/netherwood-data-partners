import { products, getProduct, productPath, productSchema, type Product } from '../content/products';
import { SiteHeader, SiteFooter } from './SiteChrome';
import '../products.css';

function ProductLinks({ product }: { product: Product }) {
  const links = [
    ['View source on GitHub', product.githubUrl], ['Documentation', product.docsUrl],
    ['Download', product.downloadUrl], ['Product website', product.productUrl]
  ];
  return <div className="product-links">{links.map(([label, href]) => href ? <a key={label} className="studio-text-link" href={href}>{label} <span aria-hidden="true">↗</span></a> : null)}</div>;
}
export function ProductCard({ product }: { product: Product }) {
  return <article className="product-card">
    <div className="product-card-top"><span className="product-initials" aria-hidden="true">{product.shortName}</span><span className="product-status">{product.status}</span></div>
    {product.image && <img src={product.image.src} alt={product.image.alt} width={product.image.width} height={product.image.height} loading="lazy" />}
    <p className="product-category">{product.category}</p>
    <h3><a href={productPath(product)}>{product.name}</a></h3>
    {product.workingName && <p className="product-name-note">Working name · may change</p>}
    {product.openSource && <p className="product-name-note">Open source</p>}
    <p>{product.summary}</p>
    <a className="studio-text-link" href={productPath(product)}>Explore {product.name} <span aria-hidden="true">↗</span></a>
    <ProductLinks product={product} />
  </article>;
}
export function FeaturedProducts() {
  return <section className="community-section studio-wrap product-home" id="products" aria-labelledby="home-products-heading">
    <div className="community-section-heading"><div><p className="eyebrow">Software by Netherwood</p><h2 id="home-products-heading">Practical tools.<br />Built from real problems.</h2></div><p>Alongside database and data engineering services, Netherwood builds tools for performance investigations, maintenance and connected data. Explore the projects and their current development status.</p></div>
    <div className="product-grid">{products.filter(product => product.featured).map(product => <ProductCard key={product.id} product={product} />)}</div>
    <a className="studio-text-link product-all-link" href="/products/">See all products <span aria-hidden="true">↗</span></a>
  </section>;
}
export function ProductsIndex() {
  return <main className="products-page"><SiteHeader currentPage="products" />
    <section className="studio-wrap product-hero"><p className="eyebrow">Software · Tools · Connectors</p><h1>Software with a<br />practical purpose.</h1><p className="product-lede">Database tools and data connectors, developed by Netherwood Data Partners.</p><p>Our consulting work gets into the systems people depend on. Our software work applies that same care to tools for database engineers, developers and people connecting their data.</p><p>These are real projects at different stages of development. Each page explains what exists today and what is still being built.</p></section>
    <section className="studio-wrap product-catalog" aria-labelledby="product-catalog-heading"><h2 id="product-catalog-heading">Current projects</h2><div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="studio-wrap product-consulting"><h2>Need help with your existing systems?</h2><p>Database performance, migrations, reporting and integrations remain core Netherwood services.</p><a className="studio-text-link" href="/services/">Explore professional services <span aria-hidden="true">↗</span></a></section><SiteFooter /></main>;
}
export function ProductDetailPage({ slug }: { slug: string }) {
  const product = getProduct(slug);
  if (!product) return <main className="products-page"><SiteHeader currentPage="products" /><section className="studio-wrap product-hero"><p className="eyebrow">Product not found</p><h1>There is no product at this address.</h1><a className="button button-primary" href="/products/">Browse products</a></section><SiteFooter /></main>;
  return <main className="products-page"><SiteHeader currentPage="products" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(productSchema(product)).replaceAll('<', '\u003c')}} />
    <section className="studio-wrap product-hero"><a className="studio-text-link" href="/products/">All products</a><p className="eyebrow">{product.category}</p><h1>{product.name}</h1><p className="product-status">{product.status}{product.openSource ? ' · Open source' : ''}</p>{product.workingName && <p className="product-name-note">Working name. The final name may change.</p>}<p className="product-lede">{product.summary}</p><p className="product-publisher">Developed by Netherwood Data Partners</p><ProductLinks product={product} /></section>
    <div className="studio-wrap product-detail-body"><section><h2>Overview</h2>{product.description.map(text => <p key={text}>{text}</p>)}</section>
      {!!product.features?.length && <section><h2>What it does</h2><ul>{product.features.map(text => <li key={text}>{text}</li>)}</ul></section>}
      {!!product.limitations?.length && <section className="product-boundaries"><h2>Current status and limits</h2>{product.limitations.map(text => <p key={text}>{text}</p>)}</section>}
      {!!product.platforms?.length && <section><h2>Platforms</h2><ul>{product.platforms.map(platform => <li key={platform}>{platform}</li>)}</ul></section>}
      {!!product.screenshots?.length && <section><h2>Screenshots</h2>{product.screenshots.map(screenshot => <figure key={screenshot.src}><img src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} loading="lazy" />{screenshot.caption && <figcaption>{screenshot.caption}</figcaption>}</figure>)}</section>}
      {!!product.privacy?.length && <section><h2>Privacy before release</h2>{product.privacy.map(text => <p key={text}>{text}</p>)}</section>}
      {!!product.releaseNotes?.length && <section><h2>Release notes</h2>{product.releaseNotes.map(note => <p key={note.version}><strong>{note.version}</strong> {note.text}</p>)}</section>}
      {!!product.relatedArticles?.length && <section><h2>Related articles</h2><ul>{product.relatedArticles.map(article => <li key={article.url}><a href={article.url}>{article.title}</a></li>)}</ul></section>}
      {product.support && <section><h2>Questions and support</h2><p>{product.support}</p><p><a href="mailto:contact@netherwooddatapartners.com">contact@netherwooddatapartners.com</a></p><a className="studio-text-link" href="/#contact">Contact Netherwood <span aria-hidden="true">↗</span></a></section>}
    </div><SiteFooter /></main>;
}
