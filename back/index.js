const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const DB_PATH = path.join(__dirname, "db.json");

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// --- DATABASE HELPERS ---
const getDatabase = () => {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database:", err);
    return { secondSource: [] };
  }
};

const saveDatabase = (data) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
};

// --- ROUTES ---

// GET all
app.get("/", (req, res) => {
  const db = getDatabase();
  res.send(db.secondSource || []);
});

// POST new
app.post("/", (req, res) => {
  const db = getDatabase();
  const newItem = { id: String(Date.now()), ...req.body };
  db.secondSource.push(newItem);
  saveDatabase(db);
  res.status(201).send(newItem);
});

// PUT (Edit)
app.put("/:id", (req, res) => {
  const db = getDatabase();
  const targetId = String(req.params.id);
  const index = db.secondSource.findIndex((i) => String(i.id) === targetId);

  if (index !== -1) {
    db.secondSource[index] = { ...db.secondSource[index], ...req.body, id: targetId };
    saveDatabase(db);
    res.send(db.secondSource[index]);
  } else {
    res.status(404).send({ error: "Item not found" });
  }
});

// DELETE
app.delete("/:id", (req, res) => {
  const idToDelete = String(req.params.id).trim();
  
  const rawData = fs.readFileSync(DB_PATH, "utf8");
  const db = JSON.parse(rawData);

  const originalLength = db.secondSource.length;
  db.secondSource = db.secondSource.filter(item => String(item.id).trim() !== idToDelete);

  if (db.secondSource.length < originalLength) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
    console.log(`>>> HARD DELETED: ${idToDelete}`);
    return res.status(200).json(db.secondSource);
  } else {
    console.log(`>>> ID NOT FOUND: ${idToDelete}`);
    return res.status(404).json({ error: "Not found" });
  }
});

// --- START SERVER ---
const port = process.env.PORT || 8087; 

// Changed 'server.listen' to 'app.listen' to match your variable name
app.listen(port, () => {
  console.log(`EquipLink API is running on port ${port}`);
});