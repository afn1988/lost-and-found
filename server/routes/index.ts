/**
 * App routes definitions.
 */

import { Express, Request, Response } from "express";

function setRoutes(app: Express) {
  app.get("/healthcheck", (req: Request, res: Response) => {
    res.send("200");
  });
}

export default setRoutes;
