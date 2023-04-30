import router from "./routes.js";
import express from "express";

const app = express();
export const port = 49725;
export const baseUrl = "http://localhost:" + port;
export const dbFile = "data.base"; // relative to root directory

// app.use(router);
app.use(express.static("public"));

/* app.listen(port, () => console.log("Server is running on port " + port));

export default app; */
