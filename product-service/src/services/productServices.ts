import { AppDataSource } from "../../data-source";
import { Product } from "../entities/Product";
import redisClient from "../config/redisClient";

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
  stock?: number;
}): Promise<Product> => {
  const product = productRepository.create(data);
  return await productRepository.save(product);
};
export const validateProducts = async (productId: string, quantity: number) => {
  const isProduct = (entity: any): entity is Product => {
    return (
      entity &&
      typeof entity.stock === "number" &&
      typeof entity.version === "number"
    );
  };

  try {
    let productEntity: string | null | Product;
    let lockResult;

    productEntity = await productRepository.findOneBy({ productId });

    if (productEntity) {
      console.log("Found in DB, caching in Redis...");

      // Cache the product info in Redis with a lock to avoid multiple updates
      // lockResult = await redisClient.set(
      //   `product:${productId}`,
      //   "locked", // Cache product data
      //   "NX", // Only set if the key does not exist
      // );

      productEntity.timestamp = Date.now();

      lockResult = await redisClient.set(
        `product:${productId}`,
        JSON.stringify(productEntity),
      );

      console.log("lockResult", lockResult);
    } else {
      console.log("Product not found in DB either.");
      return {
        productId,
        status: "not_available",
        version: 0,
      };
    }

    // At this point, we should have a valid product entity
    if (isProduct(productEntity)) {
      console.log("Valid product entity found.");
      const status =
        productEntity.stock < quantity ? "insufficient_stock" : "available";
      return {
        productId,
        status,
        version: productEntity.version,
        stock: productEntity.stock,
      };
    }

    // Fallback for unexpected cases
    console.log("Unexpected product data format.");
    return {
      productId,
      status: "invalid_product_data",
      version: 0,
    };
  } catch (error) {
    console.error("Error validating product:", error);
    throw error;
  }
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
