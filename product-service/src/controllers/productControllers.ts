import { Request, Response } from "express";
import * as productService from "../services/productServices"; // Import productService
import { ResponseHandler } from "../utils/responseHandler"; // Import ResponseHandler

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await productService.getAllProducts();
    if (!products || products.length === 0) {
      return ResponseHandler.error(res, "No products found", 404);
    }
    ResponseHandler.success(res, "Products fetched successfully", products);
  } catch (err) {
    console.error(err);
    ResponseHandler.error(res, "Internal Server Error", 500);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await productService.getProductById(id);
    if (!product) {
      return ResponseHandler.error(res, "Product not found", 404);
    }
    ResponseHandler.success(res, "Product fetched successfully", product);
  } catch (err) {
    console.error(err);
    ResponseHandler.error(res, "Internal Server Error", 500);
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, description, price, stock } = req.body;
  try {
    const product = await productService.createProduct({
      name,
      description,
      price,
      stock,
    });
    ResponseHandler.success(res, "Product created successfully", product);
  } catch (err) {
    console.error(err);
    ResponseHandler.error(res, "Internal Server Error", 500);
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price } = req.body;
  try {
    const updatedProduct = await productService.updateProduct(id, {
      name,
      description,
      price,
    });
    if (!updatedProduct) {
      return ResponseHandler.error(res, "Product not found", 404);
    }
    ResponseHandler.success(
      res,
      "Product updated successfully",
      updatedProduct,
    );
  } catch (err) {
    console.error(err);
    ResponseHandler.error(res, "Internal Server Error", 500);
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedProduct = await productService.deleteProduct(id);
    if (!deletedProduct) {
      return ResponseHandler.error(res, "Product not found", 404);
    }
    ResponseHandler.success(
      res,
      "Product deleted successfully",
      deletedProduct,
    );
  } catch (err) {
    console.error(err);
    ResponseHandler.error(res, "Internal Server Error", 500);
  }
};
