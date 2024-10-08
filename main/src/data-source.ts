import {DataSource} from "typeorm";
import { Product } from "./entity/product";

export const AppDataSource = new DataSource({
    type: "mongodb",
    host: "127.0.0.1",
    port: 27017,
    username: "",
    password: "",
    database: "node-admin",
    entities: [Product],
    synchronize: true,
    logging: false,
})