import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
//import { msg } from "./utils";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4002;

app.get("/", (req: Request, res: Response) => {
  res.send("OK!")
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});