import { AppDataSource } from "../../data-source";
import { Order } from "../entities/Order";

const orderRepository = AppDataSource.getRepository(Order);

export const createOrder = async (
  userId: string,
  products: Array<{
    productId: string;
    quantity: number;
  }>,
  totalPrice: number,
): Promise<Order> => {
  const order = orderRepository.create({ userId, products, totalPrice });
  return await orderRepository.save(order);
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  return await orderRepository.findOne({
    where: { id },
  });
};

export const getAllOrders = async (): Promise<Order[]> => {
  return await orderRepository.find();
};
