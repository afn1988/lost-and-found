import { Router, Request, Response } from "express";

const router: Router = Router();

router.get("/", function healthCheck(req: Request, res: Response) {
    res.sendStatus(200);
});

export default router;