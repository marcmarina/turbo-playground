import express from "express";

const app = express();

app.get("/favicon.ico", (req, res) => {
  return res.status(204).send();
});

app.get("/_health", (req, res) => {
  res.send(`OK`);
});

app.get("/", (req, res) => {
  res.send(process.env);
});

export default app;
