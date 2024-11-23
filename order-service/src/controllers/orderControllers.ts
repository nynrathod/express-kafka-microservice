import { Request, Response } from "express";
import * as productService from "../services/orderServices";
import { ResponseHandler } from "../utils/responseHandler";
import IRequest from "../types/IRequest"; // Import the ResponseHandler class

export const createNewOrder = async (req: IRequest, res: Response) => {
  try {
    console.log("myhello", req.user?.id);
    const { products, totalPrice } = req.body;
    const userId = req.user?.id; // Accessing the user ID from the JWT

    if (!userId) {
      return ResponseHandler.error(res, "User ID is required", 400);
    }

    const newOrder = await productService.createOrder(
      userId,
      products,
      totalPrice,
    );
    return ResponseHandler.success(res, "Order created successfully", newOrder);
  } catch (error) {
    return ResponseHandler.error(res, "Error creating order", 500);
  }
};

export const getOrderById = async (req: IRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await productService.getOrderById(id);

    if (!order) {
      return ResponseHandler.error(res, "Order not found", 404);
    }

    return ResponseHandler.success(res, "Order fetched successfully", order);
  } catch (error) {
    return ResponseHandler.error(res, "Error fetching order", 500);
  }
};

export const getAllOrders = async (req: IRequest, res: Response) => {
  try {
    const orders = await productService.getAllOrders();
    return ResponseHandler.success(res, "Orders fetched successfully", orders);
  } catch (error) {
    console.log("feterr", error);
    return ResponseHandler.error(res, "Error fetching orders", 500);
  }
};
