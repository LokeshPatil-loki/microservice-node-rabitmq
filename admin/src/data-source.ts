import {DataSource} from "typeorm";
import { Product } from "./entity/product";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3307,
    username: "root", 
    password: "root",
    database: "node_admin",
    entities: [Product],
    synchronize: true,
    logging: false,
})