import * as express from "express";
import * as cors from "cors";
import { AppDataSource } from "./data-source";
import { Request,Response } from "express";
import { Product } from "./entity/product";
import { json } from "stream/consumers";
import * as amqp from "amqplib";
import axios from "axios";
import { FindOneOptions, FindOptionsWhere } from "typeorm";
import { ObjectId } from "mongodb";
console.clear(); 

(async () => {
    try {
        const dataSource = await AppDataSource.initialize();
        const productRepository = dataSource.getRepository(Product);
        
        const app = express();
        app.use(express.json());
        app.use(cors({
            origin: ["http://localhost:3000",]
        }));
        app.listen(8001,()=>{
            console.log("Listening on port 8001");
        });

        app.get("/api/products",async (req: Request, res: Response) => {
            const products = await productRepository.find();
            return res.json(products);
        })

        app.post("/api/products/:id/like",async (req:Request,res:Response) =>{ 
            try {
                const {id} = req.params;
                const product = await productRepository.findOneBy({ _id:new ObjectId(id) });
                axios.post(`http://localhost:8000/api/products/${product.admin_id}/like`,{});
                product.likes++;
                await productRepository.save(product);
                return res.json(product);
            } catch (error) {
                console.log(error);
            }
        })

        // RabbitMQ
        const connection = await amqp.connect('amqp://localhost',)
        const channel = await connection.createChannel();

        channel.assertQueue("product_created",{durable: false});
        channel.assertQueue("product_updated",{durable:false});
        channel.assertQueue("product_deleted",{durable:false})

        channel.consume("product_created",async (msg) => {
            const eventProduct = JSON.parse(msg.content.toString());
            const product = new Product();
            product.admin_id = parseInt(eventProduct.id);
            product.title = eventProduct.title;
            product.image = eventProduct.image;
            product.likes = eventProduct.likes;
            await productRepository.save(product);
            console.log("product created");
        },{noAck: true});

        channel.consume("product_updated",async (msg) => {
            const eventProduct = JSON.parse(msg.content.toString());
            const product = await productRepository.findOneBy({admin_id: parseInt(eventProduct.id)});
            productRepository.merge(product,{
                title: eventProduct.title,
                image: eventProduct.image,
                likes: eventProduct.likes
            });
            await productRepository.save(product);
            console.log("product updated");
        },{noAck: true});

        channel.consume("product_deleted",async (msg) => {
            const admin_id:number = parseInt(msg.content.toString());
            await productRepository.delete({admin_id: admin_id});
            console.log("product deleted");
        },{noAck: true});

        process.on("beforeExit",()=>{
            console.log("Closing");
            connection.close();
        })

    } catch (error) {
        console.log(error)
    }
})();

