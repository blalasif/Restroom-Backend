import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configureApp = (app) => {
  app.use(express.json());

  app.use("/images", express.static(path.join(__dirname, "uploads")));
};

export { configureApp, __dirname };
