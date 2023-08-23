import * as express from "express";
import * as cors from "cors";
import { AppDataSource } from "./data-source";
import { Request,Response } from "express";
import { Product } from "./entity/product";
import { json } from "stream/consumers";
import * as amqp from "amqplib/callback_api";


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

        const connection =  await amqp.connect('amqp://localhost ');
        const ch1 = await connection.createChannel();
        await ch1.assertQueue("hello",{durable:false});
        ch1.consume("hello",(msg)=>{
            console.log(msg.content.toString());
        })
        
        app.listen(8001,()=>{
            console.log("Listening on port 8000");
        });


    } catch (error) {
        console.log(error)
    }
})();

