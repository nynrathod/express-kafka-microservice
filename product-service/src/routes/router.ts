import express from "express";
import * as productController from "../controllers/productControllers";
import { startWorker, stopRepeatableJob } from "../config/productWorker";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

router.post("/start", (req, res) => {
  return startWorker();
});

router.post("/stop", (req, res) => {
  return stopRepeatableJob();
});

export default router;
