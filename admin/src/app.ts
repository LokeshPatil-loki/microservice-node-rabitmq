import * as express from "express";
import * as cors from "cors";
import { AppDataSource } from "./data-source";
import { Request,Response } from "express";
import { Product } from "./entity/product";
import { json } from "stream/consumers";
import * as amqp from "amqplib";

console.clear();


// AppDataSource.initialize().then(() => {
//     console.log("Data Source has been initialized!");}).catch((err) => {
//     console.error("Error during Data Source initialization", err);});

(async () => {
    try {
        const dataSource = await AppDataSource.initialize();
        const productRepository = dataSource.getRepository(Product);
        const app = express();

        
        app.use(express.json());
        app.use(cors({
            origin: ["http://localhost:3000",]
        }));
        
        // RabbitMQ Connection
        const connection = await amqp.connect('amqp://localhost',)
        const channel = await connection.createChannel();

        app.get ("/api/products",async (req:Request,res:Response) => {
            const products = await productRepository.find();
            res.json(products);
        });

        app.post("/api/products",async(req:Request,res:Response) => {
            const {title,image} = req.body;
            console.log({title,image});
            const product = await productRepository.create({title,image});
            const result = await productRepository.save(product);
            channel.sendToQueue("product_created",Buffer.from(JSON.stringify(result)));
            return res.send(result);
        });

        app.put("/api/products/:id",async(req:Request,res:Response) => {
            const {id} = req.params;
            const product = await productRepository.findOneBy({id:parseInt(id)});
            productRepository.merge(product,req.body);
            const result = await productRepository.save(product);
            channel.sendToQueue("product_updated",Buffer.from(JSON.stringify(result)));
            return res.send(result);
        })

        app.get ("/api/products/:id",async (req:Request,res:Response) => {
            const {id} = req.params;
            const product = await productRepository.findOneBy({id: parseInt(id)});
            res.json(product);
        });


        app.delete("/api/products/:id",async(req: Request, res: Response) => {
            const {id} = req.params;
            const result = await productRepository.delete(id);
            channel.sendToQueue("product_deleted",Buffer.from(id));
            return res.send(result);
        });

        app.post("/api/products/:id/like",async (req:Request,res:Response) => {
            const {id} = req.params;
            const product = await productRepository.findOneBy({id:parseInt(id)});
            product.likes++;
            const result = await productRepository.save(product);
            return res.send(result);
        });

        app.listen(8000,()=>{
            console.log("Listening on port 8000");
        });
    } catch (error) {
        console.log(error)
    }
})();

