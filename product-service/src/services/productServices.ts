import { AppDataSource } from "../../data-source";
import { Product } from "../entities/Product";

const productRepository = AppDataSource.getRepository(Product);

export const getAllProducts = async (): Promise<Product[]> => {
  return await productRepository.find();
};

export const getProductById = async (id: string): Promise<Product | null> => {
  return await productRepository.findOneBy({ id: parseInt(id) });
};

export const createProduct = async (data: {
  name: string;
  description: string;
  price: number;
}): Promise<Product> => {
  const product = productRepository.create(data);
  return await productRepository.save(product);
};

export const updateProduct = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
  },
): Promise<Product | null> => {
  const product = await productRepository.findOneBy({ id: parseInt(id) });
  if (!product) return null;
  Object.assign(product, data);
  return await productRepository.save(product);
};

export const deleteProduct = async (id: string): Promise<Product | null> => {
  const product = await productRepository.findOneBy({ id: parseInt(id) });
  if (!product) return null;
  await productRepository.remove(product);
  return product;
};
