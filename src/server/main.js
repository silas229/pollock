import { engine } from "express-handlebars";
import express from "express";
import session from "express-session";
import cors from "cors";
import { xss } from "express-xss-sanitizer";
import ip from "ip";

import router from "./routes.js";
import { checkAcceptsHeader, getUser } from "./middlewares.js";

const app = express();
export const port = 49725;
export const baseUrl = "http://" + ip.address() + ":" + port;

app.get(cors());
app.use(express.static("public"));
app.use(checkAcceptsHeader);
app.use(express.json());
app.use(xss());
app.use(
  session({
    secret: "HnUJpFtpHumrE4WmgVqfbWuDnev72EvJjCmPDemphHZYpXjTjTuVcbXCsjm5pTdj",
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(getUser);

app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    helpers: {
      pluralize: function (number, single, plural) {
        if (number == 1) {
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

app.listen(port, () =>
  console.log("\n\nServer is running:  " + baseUrl + "\n\n"),
);

export default app;
