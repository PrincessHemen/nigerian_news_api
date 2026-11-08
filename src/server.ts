import express from "express";
import articlesRouter from "./routes/articles.js";

const app = express();

app.use("/api/articles", articlesRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`News API running on port ${PORT}`));;

app.get("/debug", async (_req, res) => {
    const out: Record<string, unknown> = {};
    for (const site of ["https://punchng.com", "https://www.premiumtimesng.com"]) {
        const start = Date.now();
        try {
            const r = await fetch(site, {
                signal: AbortSignal.timeout(15000),
                headers: { "User-Agent": "Mozilla/5.0" },
            });
            out[site] = { status: r.status, ms: Date.now() - start, server: r.headers.get("server") };
        } catch (e) {
            out[site] = { error: String(e), ms: Date.now() - start };
        }
    }
    res.json(out);
});