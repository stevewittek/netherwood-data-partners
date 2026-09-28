import type { Metadata } from 'next';
import { ProductsIndex } from '../components/ProductPages';
import { productsMetadata } from '../content/products';
export const metadata: Metadata = {...productsMetadata, alternates: {canonical: '/products/'}, openGraph: {...productsMetadata, url: '/products/'}, twitter: {...productsMetadata}};
export default ProductsIndex;
