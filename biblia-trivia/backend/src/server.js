require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const paymentsRoutes = require("./routes/payments");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/payments", paymentsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Trivia Bíblica backend escuchando en el puerto ${PORT}`);
});
