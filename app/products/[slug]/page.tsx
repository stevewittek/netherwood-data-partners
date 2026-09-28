import type { Metadata } from 'next';
import { ProductDetailPage } from '../../components/ProductPages';
import { products, getProduct, productMetadata } from '../../content/products';
export function generateStaticParams() { return products.map(product => ({slug: product.slug})); }
export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params;
  const product = getProduct(slug);
  return product ? productMetadata(product) : {title: 'Product not found | Netherwood', robots: {index: false}};
}
export default async function ProductPage({params}: {params: Promise<{slug: string}>}) { const {slug} = await params; return <ProductDetailPage slug={slug} />; }
