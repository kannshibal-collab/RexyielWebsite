
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "support.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

function readMessages() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

app.get("/api/support", (req, res) => {
  res.json(readMessages().slice(-50).reverse());
});

app.post("/api/support", (req, res) => {
  const name = String(req.body?.name || "").trim().slice(0, 24);
  const message = String(req.body?.message || "").trim().slice(0, 240);

  if (!name || message.length < 3) {
    return res.status(400).json({
      error: "Isi nama panggilan dan pesan minimal 3 karakter."
    });
  }

  const messages = readMessages();

  const entry = {
    name,
    message,
    date: new Date().toISOString()
  };

  messages.push(entry);

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(messages.slice(-200), null, 2)
  );

  res.status(201).json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("REXYIEL WEBSITE AKTIF!");
  console.log(`http://localhost:${PORT}`);
});

