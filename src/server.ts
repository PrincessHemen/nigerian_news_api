import express from "express";
import articlesRouter from "./routes/articles.js";

const app = express();

app.use("/api/articles", articlesRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`News API running on port ${PORT}`));;