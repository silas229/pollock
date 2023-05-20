import router from "./routes.js";
import { engine } from "express-handlebars";
import express from "express";
import ViteExpress from "vite-express";

const app = express();
export const port = 49725;
export const baseUrl = "http://localhost:" + port;
ViteExpress.config({
  printViteDevServerHost: true,
});

app.use(router);

app.use(express.static("public"));

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./src/client/views");

app.get("/message", (_, res) => res.send("Hello from vite!"));

ViteExpress.listen(app, port, () =>
  console.log("Server is running:  " + baseUrl),
);

export default app;
