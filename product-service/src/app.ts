import express from 'express';
import router from "./routes/router";

const app = express();

app.use(express.json());

app.use('/api/products', router);

const PORT =  4000;

app.listen(PORT, () => {
    console.log(`Product Service is running on port ${PORT}`);
});

export default app;
