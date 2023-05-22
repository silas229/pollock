import router from "./routes.js";
import { engine } from "express-handlebars";
import express from "express";
import cors from "cors";
import ViteExpress from "vite-express";

const app = express();
export const port = 49725;
export const baseUrl = "http://localhost:" + port;
ViteExpress.config({
  printViteDevServerHost: true,
});

app.get(cors());
app.use(express.json());

app.use(express.static("public"));

app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: {
      pluralize: function (number, single, plural) {
        if (number === 1) {
          return single;
        } else {
          return plural;
        }
      },
    },
    runtimeOptions: { allowProtoPropertiesByDefault: true },
  }),
);
app.set("view engine", ".hbs");
app.set("views", "./src/client/views");
app.use(router);

app.get("/message", (_, res) => res.send("Hello from vite!"));

// ViteExpress.listen(app, port, () =>
//   console.log("Server is running:  " + baseUrl),
// );

app.listen(port, () => console.log("Server is running:  " + baseUrl));

export default app;
