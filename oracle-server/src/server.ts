import { makeApp } from "./app.js";
import { getEnvVar } from "./utils/getEnvVar.js";

makeApp({ logger: true }).then((app) => {
  app.listen({ port: Number(getEnvVar("PORT")) }, (err, address) => {
    console.log(`Server is now listening on ${address}`);
    if (err) {
      console.log(err);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    }
  });
});

