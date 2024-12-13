import { Request, Response } from "express";
import * as orderService from "../services/orderServices";
import { ResponseHandler } from "../utils/responseHandler";
import IRequest from "../types/IRequest"; // Import the ResponseHandler class

export const createNewOrder = async (req: IRequest, res: Response) => {
  try {
    const { product, totalPrice } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return ResponseHandler.error(res, "User ID is required", 400);
    }

    const newOrder = await orderService.createOrder(
      userId,
      product,
      totalPrice,
    );
    return ResponseHandler.success(
      res,
      "Order created successfully, awaiting validation.",
      { orderId: newOrder },
    );
  } catch (error) {
    return ResponseHandler.error(res, "Error creating order", 500);
  }
};

export const getOrderStatusController = async (
  req: IRequest,
  res: Response,
) => {
  const { orderId } = req.params;

  console.log("masdasorderId", orderId);
  try {
    const orderExists = await orderService.getOrderStatusService(orderId);
    console.log("orderExists", orderExists);
    if (orderExists && orderExists.status == "pending") {
      return ResponseHandler.success(res, "Order pending", {
        status: "pending",
      });
    } else if (orderExists && orderExists.status == "success") {
      return ResponseHandler.success(res, "Order exists", {
        status: "success",
      });
    } else {
      return ResponseHandler.error(res, "Order not found", 400);
    }
  } catch (error) {
    // return res
    //   .status(500)
    //   .json({ message: "Error fetching order status", error: error });
  }
};

export const getOrderById = async (req: IRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

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
    const orders = await orderService.getAllOrders();
    return ResponseHandler.success(res, "Orders fetched successfully", orders);
  } catch (error) {
    console.log("feterr", error);
    return ResponseHandler.error(res, "Error fetching orders", 500);
  }
};
