import express from "express";
import homeRouter from "./routes/home.js";
import articlesRouter from "./routes/articles.js";

const app = express();

app.use("/", homeRouter);
app.use("/api/articles", articlesRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`News API running on port ${PORT}`));;

