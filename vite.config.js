import { defineConfig } from "vite";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";

export default defineConfig({
  root: "src",
  build: {},
  // server: {
  //   // port: port,
  //   middlewareMode: true,
  // },
  plugins: [
    // vitePluginExpress({
    //   // app: () => app,
    //   middlewareFiles: "src/routes.js",
    //   prefixUrl: "/",
    // }),
  ],
  css: {
    postcss: {
      plugins: [postcssImport(), tailwindcss()],
    },
  },
});

// createServer({}).then((vite) => {
//   app.use(vite.middlewares);
//   app.listen(port, () => {
//     console.log("Server is running on port " + port);
//   });
// });
