import {DataSource} from "typeorm";
import { Product } from "./entity/product";

export const AppDataSource = new DataSource({
    type: "mongodb",
    host: "localhost",
    port: 27017,
    username: "root",
    password: "example",
    database: "node-admin",
    entities: [Product],
    synchronize: true,
    logging: false,
})