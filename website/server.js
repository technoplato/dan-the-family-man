/* server.js - Premium Handyman Web Server, APIs & IP Rate Limiter */

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// Seeding standard assets with mockups we generated (so we don't have broken images!)
const mockupsSource = path.join(__dirname, "../mock-ups");
const imagesDest = path.join(__dirname, "public/images");

try {
  if (fs.existsSync(mockupsSource)) {
    const mockupFiles = fs.readdirSync(mockupsSource);
    mockupFiles.forEach(file => {
      const srcFile = path.join(mockupsSource, file);
      const destFile = path.join(imagesDest, file);
      if (fs.lstatSync(srcFile).isFile() && !fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }
    });
    // Create categories fallback placeholder image
    const sampleMock = path.join(mockupsSource, "smoke_test_mockup.png");
    const placeholders = [
      "bookshelves_category.png",
      "beams_category.png",
      "fans_category.png",
      "cabinetry_category.png",
      "bars_category.png",
      "childproofing_category.png",
      "barndoors_category.png",
      "custombuilds_category.png"
    ];
    placeholders.forEach(ph => {
      const phFile = path.join(imagesDest, ph);
      if (!fs.existsSync(phFile) && fs.existsSync(sampleMock)) {
        fs.copyFileSync(sampleMock, phFile);
      }
    });
  }
} catch (err) {
  console.warn("Seeding initial mock-up images warned:", err.message);
}

// 🛡️ Client Submission IP Rate Limiter Memory Store
const submissionLimits = new Map(); // Store client IP and array of timestamps

const checkRateLimit = (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  if (!submissionLimits.has(ip)) {
    submissionLimits.set(ip, [now]);
    return next();
  }
  
  // Filter out timestamps older than 1 hour
  let timestamps = submissionLimits.get(ip).filter(time => now - time < ONE_HOUR);
  
  if (timestamps.length >= 5) {
    console.warn(`[SECURITY] Rate Limit Triggered for IP: ${ip}`);
    return res.status(429).json({ error: "Too many submissions. Max 5 per hour." });
  }
  
  timestamps.push(now);
  submissionLimits.set(ip, timestamps);
  next();
};

// 🛡️ Sanitation utility (strips tags to prevent HTML injection/XSS)
const sanitizeText = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/<[^>]*>/g, "").trim();
};

// -------------------------------------------------------------
// APIs
// -------------------------------------------------------------

// 1. Fetch dynamic projects portfolio list
app.get("/api/projects", (req, res) => {
  const dataPath = path.join(__dirname, "public/data/projects.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading database." });
    }
    res.json(JSON.parse(data));
  });
});

// 2. Add Category or Project dynamically (Admin Page Builder Interface API)
app.post("/api/projects/add", (req, res) => {
  const dataPath = path.join(__dirname, "public/data/projects.json");
  const { category, project } = req.body;

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Database read failed." });
    
    let db = JSON.parse(data);
    
    // Add category if present
    if (category) {
      const sanitizedCat = {
        id: sanitizeText(category.id).toLowerCase(),
        name: sanitizeText(category.name),
        image: sanitizeText(category.image || "/images/smoke_test_mockup.png"),
        seo_phrase: sanitizeText(category.seo_phrase)
      };
      
      if (db.categories.some(c => c.id === sanitizedCat.id)) {
        return res.status(400).json({ error: "Category ID already exists." });
      }
      db.categories.push(sanitizedCat);
    }
    
    // Add project if present
    if (project) {
      const sanitizedProj = {
        id: sanitizeText(project.id).toLowerCase(),
        categoryId: sanitizeText(project.categoryId),
        title: sanitizeText(project.title),
        description: sanitizeText(project.description),
        before: sanitizeText(project.before || "/images/smoke_test_mockup.png"),
        after: sanitizeText(project.after || "/images/smoke_test_mockup.png"),
        phases: Array.isArray(project.phases) ? project.phases.map(p => ({
          name: sanitizeText(p.name),
          image: sanitizeText(p.image || "/images/smoke_test_mockup.png"),
          description: sanitizeText(p.description)
        })) : []
      };
      
      if (db.projects.some(p => p.id === sanitizedProj.id)) {
        return res.status(400).json({ error: "Project ID already exists." });
      }
      db.projects.push(sanitizedProj);
    }
    
    // Save database back to projects.json
    fs.writeFile(dataPath, JSON.stringify(db, null, 2), "utf8", (writeErr) => {
      if (writeErr) return res.status(500).json({ error: "Database save failed." });
      res.json({ success: true, db });
    });
  });
});

// 3. Process Lead Form with Rate Limiter and Strict Input Sanitation
app.post("/api/inquire", checkRateLimit, (req, res) => {
  const { name, contact, city, description, project_title, project_link } = req.body;
  
  // Sanitation
  const cleanName = sanitizeText(name);
  const cleanContact = sanitizeText(contact);
  const cleanCity = sanitizeText(city);
  const cleanDesc = sanitizeText(description);
  const cleanTitle = sanitizeText(project_title);
  const cleanLink = sanitizeText(project_link);
  
  if (!cleanName || !cleanContact || !cleanCity || !cleanDesc) {
    return res.status(400).json({ error: "Missing required contact details." });
  }
  
  // Format Lead Payload
  const leadLog = {
    timestamp: new Date().toISOString(),
    name: cleanName,
    contact: cleanContact,
    city: cleanCity,
    description: cleanDesc,
    context: {
      inquired_project_title: cleanTitle || "None (General Inquiry)",
      inquired_project_link: cleanLink || "None"
    }
  };
  
  console.log("-----------------------------------------");
  console.log("[LEAD GENERATION RECEIVED]");
  console.log(JSON.stringify(leadLog, null, 2));
  console.log("-----------------------------------------");
  
  // Save lead locally to an inquiry file log system (append format)
  const leadsPath = path.join(__dirname, "public/data/leads.jsonl");
  fs.appendFile(leadsPath, JSON.stringify(leadLog) + "\n", "utf8", (err) => {
    if (err) console.error("Failed to append lead logs locally:", err);
  });
  
  res.json({ success: true, message: "Lead submitted successfully." });
});

// Fallback HTML router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Dan the Family Man server started successfully.`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
