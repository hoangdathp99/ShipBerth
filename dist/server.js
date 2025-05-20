"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const node_http_1 = require("node:http");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const mime_1 = __importDefault(require("mime")); // npm i mime
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const dev = process.env.NODE_ENV !== "production";
const host = process.env.NEXT_PUBLIC_HOST || "localhost";
const port = parseInt(process.env.NEXT_PUBLIC_APP_PORT || "3000");
const app = (0, next_1.default)({ dev, hostname: host, port: port });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, node_http_1.createServer)((req, res) => {
        var _a;
        if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/uploads/")) {
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            const cleanPath = parsedUrl.pathname.replace("/uploads/", "");
            // 👉 Serve từ thư mục ./uploads (nằm ngang hàng với public, NOT public/uploads)
            const filePath = node_path_1.default.join(process.cwd(), "uploads", cleanPath);
            node_fs_1.default.readFile(filePath, (err, data) => {
                if (err) {
                    res.statusCode = 404;
                    res.end("File not found");
                }
                else {
                    res.setHeader("Content-Type", mime_1.default.getType(filePath) || "application/octet-stream");
                    res.end(data);
                }
            });
        }
        else {
            handle(req, res);
        }
    });
    const io = new socket_io_1.Server(httpServer);
    let ship = [];
    io.on("connection", (socket) => {
        console.log(`New connection established. Total connections: ${io.engine.clientsCount}`);
        // ✅ Chỉ emit dữ liệu tới client vừa kết nối
        socket.on("requestShipData", () => {
            socket.emit("shipData", ship);
        });
        socket.on("updateShip", (data) => {
            ship = data;
            io.emit("shipData", data); // Cập nhật cho tất cả các client
        });
        socket.on("addShip", (shipSelected) => {
            if (ship.find((item) => item.id === shipSelected.id))
                return;
            ship.push(shipSelected);
            io.emit("shipData", ship); // Cập nhật cho tất cả các client
        });
        socket.on("removeShip", (shipId) => {
            ship = ship.filter((item) => item.id !== shipId);
            io.emit("shipData", ship);
        });
        socket.on("updateShipImage", () => {
            io.emit("message", "updatedImage"); // Cập nhật cho tất cả các client
        });
        socket.on("disconnect", () => {
            console.log("Client disconnected");
        });
    });
    httpServer.listen(port, () => {
        console.log(`Server started on http://${host}:` + port, `dev: ${dev}`);
    });
});
