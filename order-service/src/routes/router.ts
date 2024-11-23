import express from "express";
import * as orderController from "../controllers/orderControllers";
import { verifyJWT } from "../middlewares/verifyJWT";

const router = express.Router();

router.get("/", verifyJWT, orderController.getAllOrders);
router.get("/:id", verifyJWT, orderController.getOrderById);
router.post("/", verifyJWT, orderController.createNewOrder);

export default router;
