import dotenv from "dotenv";
dotenv.config();
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import mime from "mime"; // npm i mime
import path from "node:path";
import fs from "node:fs";
const dev = process.env.NODE_ENV !== "production";
const host = process.env.NEXT_PUBLIC_HOST || "localhost";
const port = parseInt(process.env.NEXT_PUBLIC_APP_PORT || "3000");
const app = next({ dev, hostname: host, port: port });
const handle = app.getRequestHandler();
app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (req.url?.startsWith("/uploads/")) {
      const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
      const cleanPath = parsedUrl.pathname.replace("/uploads/", "");
      // 👉 Serve từ thư mục ./uploads (nằm ngang hàng với public, NOT public/uploads)
      const filePath = path.join(process.cwd(), "uploads", cleanPath);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end("File not found");
        } else {
          res.setHeader("Content-Type", mime.getType(filePath) || "application/octet-stream");
          res.end(data);
        }
      });
    } else {
      handle(req, res);
    }
  });
  const io = new Server(httpServer);

  let ship = [];
  io.on("connection", (socket) => {
    console.log(
      `New connection established. Total connections: ${io.engine.clientsCount}`
    );

    // ✅ Chỉ emit dữ liệu tới client vừa kết nối
    socket.on("requestShipData", () => {
      socket.emit("shipData", ship);
    });
    socket.on("updateShip", (data) => {
      ship = data;
      io.emit("shipData", data); // Cập nhật cho tất cả các client
    });
    socket.on("addShip", (shipSelected) => {
      if(ship.find((item) => item.id === shipSelected.id)) return
      ship.push(shipSelected);
      io.emit("shipData", ship); // Cập nhật cho tất cả các client
    })
    socket.on("removeShip", (shipId) => {
      ship = ship.filter((item) => item.id !== shipId);
      io.emit("shipData", ship);
    })
    socket.on("updateShipImage", () => {
      io.emit("message", "updatedImage"); // Cập nhật cho tất cả các client
    })
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server started on http://${host}:`+port, `dev: ${dev}`);
  });
});
