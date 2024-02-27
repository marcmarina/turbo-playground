import path from "path";

import dotenv from "dotenv";

import { string } from "@app/config";

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const greeting = string("GREETING");

console.log(greeting);
