"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var data_source_1 = require("./data-source");
var product_1 = require("./entity/product");
var amqp = require("amqplib");
console.clear();
// AppDataSource.initialize().then(() => {
//     console.log("Data Source has been initialized!");}).catch((err) => {
//     console.error("Error during Data Source initialization", err);});
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var dataSource, productRepository_1, app, connection, channel_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, data_source_1.AppDataSource.initialize()];
            case 1:
                dataSource = _a.sent();
                productRepository_1 = dataSource.getRepository(product_1.Product);
                app = express();
                app.use(express.json());
                app.use(cors({
                    origin: ["http://localhost:3000",]
                }));
                return [4 /*yield*/, amqp.connect('amqp://localhost')];
            case 2:
                connection = _a.sent();
                return [4 /*yield*/, connection.createChannel()];
            case 3:
                channel_1 = _a.sent();
                app.get("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var products;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, productRepository_1.find()];
                            case 1:
                                products = _a.sent();
                                res.json(products);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.post("/api/products", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var _a, title, image, product, result;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _a = req.body, title = _a.title, image = _a.image;
                                console.log({ title: title, image: image });
                                return [4 /*yield*/, productRepository_1.create({ title: title, image: image })];
                            case 1:
                                product = _b.sent();
                                return [4 /*yield*/, productRepository_1.save(product)];
                            case 2:
                                result = _b.sent();
                                channel_1.sendToQueue("product_created", Buffer.from(JSON.stringify(result)));
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                app.put("/api/products/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, product, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = req.params.id;
                                return [4 /*yield*/, productRepository_1.findOneBy({ id: parseInt(id) })];
                            case 1:
                                product = _a.sent();
                                productRepository_1.merge(product, req.body);
                                return [4 /*yield*/, productRepository_1.save(product)];
                            case 2:
                                result = _a.sent();
                                channel_1.sendToQueue("product_updated", Buffer.from(JSON.stringify(result)));
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                app.get("/api/products/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, product;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = req.params.id;
                                return [4 /*yield*/, productRepository_1.findOneBy({ id: parseInt(id) })];
                            case 1:
                                product = _a.sent();
                                res.json(product);
                                return [2 /*return*/];
                        }
                    });
                }); });
                app.delete("/api/products/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = req.params.id;
                                return [4 /*yield*/, productRepository_1.delete(id)];
                            case 1:
                                result = _a.sent();
                                channel_1.sendToQueue("product_deleted", Buffer.from(id));
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                app.post("/api/products/:id/like", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
                    var id, product, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                id = req.params.id;
                                return [4 /*yield*/, productRepository_1.findOneBy({ id: parseInt(id) })];
                            case 1:
                                product = _a.sent();
                                product.likes++;
                                return [4 /*yield*/, productRepository_1.save(product)];
                            case 2:
                                result = _a.sent();
                                return [2 /*return*/, res.send(result)];
                        }
                    });
                }); });
                app.listen(8000, function () {
                    console.log("Listening on port 8000");
                });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.log(error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); })();
