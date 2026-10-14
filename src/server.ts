import express from "express";
import articlesRouter from "./routes/articles.js";

const app = express();

app.use("/api/articles", articlesRouter);

app.listen(3001, () => {
    console.log("News API running on port 3001");
});