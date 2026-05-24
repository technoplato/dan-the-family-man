/* server.js - Premium Handyman Web Server, APIs & IP Rate Limiter */

const express = require("express");
const path = require("path");
const fs = require("fs");
const { Resend } = require("resend");

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");
const PORT = process.env.PORT || 3000;

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve dynamic metadata for category.html to enable rich link previews
app.get("/category.html", (req, res) => {
  const categoryId = req.query.id;
  const categoryHtmlPath = path.join(__dirname, "public", "category.html");
  const dataPath = path.join(__dirname, "public/uploads/data/projects.json");

  fs.readFile(categoryHtmlPath, "utf8", (err, html) => {
    if (err) {
      return res.status(500).send("Error loading page.");
    }

    if (!categoryId) {
      return res.send(html);
    }

    fs.readFile(dataPath, "utf8", (dbErr, dbData) => {
      if (dbErr) {
        return res.send(html);
      }

      try {
        const db = JSON.parse(dbData);
        const category = db.categories.find(c => c.id === categoryId);

        if (category) {
          let modifiedHtml = html;

          // 1. Replace title tag
          modifiedHtml = modifiedHtml.replace(
            /<title>Category Projects \| Dan the Family Man<\/title>/g,
            `<title>${category.name} Portfolio | Dan the Family Man</title>`
          );

          // 2. Replace og:title
          modifiedHtml = modifiedHtml.replace(
            /<meta property="og:title" content="Category Projects \| Dan the Family Man">/g,
            `<meta property="og:title" content="${category.name} Portfolio | Dan the Family Man">`
          );

          // 3. Replace og:description and meta description
          const nameLower = category.name.toLowerCase();
          const cleanName = nameLower.startsWith("custom") ? nameLower : `custom ${nameLower}`;
          const catDesc = `Explore beautiful ${cleanName} carpentry and professional home improvement projects completed by Dan the Family Man.`;
          modifiedHtml = modifiedHtml.replace(
            /<meta property="og:description" content="[^"]*">/g,
            `<meta property="og:description" content="${catDesc}">`
          );
          modifiedHtml = modifiedHtml.replace(
            /<meta name="description" content="[^"]*">/g,
            `<meta name="description" content="${catDesc}">`
          );

          // 4. Replace og:image
          const absoluteImgUrl = `https://dan-the-family-man.onrender.com${category.image || "/uploads/images/og_preview.png"}`;
          modifiedHtml = modifiedHtml.replace(
            /<meta property="og:image" content="https:\/\/dan-the-family-man\.onrender\.com\/uploads\/images\/og_preview\.png">/g,
            `<meta property="og:image" content="${absoluteImgUrl}">`
          );

          return res.send(modifiedHtml);
        }
      } catch (parseErr) {
        // Fallback
      }
      res.send(html);
    });
  });
});

// Serve dynamic metadata for project.html to enable rich link previews (e.g. iMessage, Slack, Facebook)
app.get("/project.html", (req, res) => {
  const projectId = req.query.id;
  const projectHtmlPath = path.join(__dirname, "public", "project.html");
  const dataPath = path.join(__dirname, "public/uploads/data/projects.json");

  fs.readFile(projectHtmlPath, "utf8", (err, html) => {
    if (err) {
      return res.status(500).send("Error loading page.");
    }

    if (!projectId) {
      return res.send(html);
    }

    fs.readFile(dataPath, "utf8", (dbErr, dbData) => {
      if (dbErr) {
        return res.send(html);
      }

      try {
        const db = JSON.parse(dbData);
        const project = db.projects.find(p => p.id === projectId);

        if (project) {
          let modifiedHtml = html;

          // 1. Replace title tag
          modifiedHtml = modifiedHtml.replace(
            /<title>Project Details \| Dan the Family Man<\/title>/g,
            `<title>${project.title} | Dan the Family Man</title>`
          );

          // 2. Replace og:title
          modifiedHtml = modifiedHtml.replace(
            /<meta property="og:title" content="Project Details \| Dan the Family Man">/g,
            `<meta property="og:title" content="${project.title} | Dan the Family Man">`
          );

          // 3. Replace og:description and meta description
          modifiedHtml = modifiedHtml.replace(
            /<meta property="og:description" content="[^"]*">/g,
            `<meta property="og:description" content="${project.description}">`
          );
          modifiedHtml = modifiedHtml.replace(
            /<meta name="description" content="[^"]*">/g,
            `<meta name="description" content="${project.description}">`
          );

          // 4. Replace og:image (use project's specific showcase photo)
          const absoluteImgUrl = `https://dan-the-family-man.onrender.com${project.og_image || project.after || "/uploads/images/og_preview.png"}`;
          modifiedHtml = modifiedHtml.replace(
            /<meta property="og:image" content="https:\/\/dan-the-family-man\.onrender\.com\/uploads\/images\/og_preview\.png">/g,
            `<meta property="og:image" content="${absoluteImgUrl}">`
          );

          return res.send(modifiedHtml);
        }
      } catch (parseErr) {
        // Fallback
      }
      res.send(html);
    });
  });
});

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// Seeding standard assets with mockups we generated (so we don't have broken images!)
const mockupsSource = path.join(__dirname, "../mock-ups");
const imagesDest = path.join(__dirname, "public/uploads/images");

try {
  if (fs.existsSync(mockupsSource)) {
    // Make sure public/uploads/images exists
    if (!fs.existsSync(imagesDest)) {
      fs.mkdirSync(imagesDest, { recursive: true });
    }
    const mockupFiles = fs.readdirSync(mockupsSource);
    mockupFiles.forEach(file => {
      const srcFile = path.join(mockupsSource, file);
      const destFile = path.join(imagesDest, file);
      if (fs.lstatSync(srcFile).isFile() && !fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }
    });
    // Create categories fallback placeholder image
    const sampleMock = path.join(mockupsSource, "likes/option_5_category_details_bookshelves.PNG");
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
  const dataPath = path.join(__dirname, "public/uploads/data/projects.json");
  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading database." });
    }
    res.json(JSON.parse(data));
  });
});

// 2. Add Category or Project dynamically (Admin Page Builder Interface API)
app.post("/api/projects/add", (req, res) => {
  const dataPath = path.join(__dirname, "public/uploads/data/projects.json");
  const { category, project } = req.body;

  fs.readFile(dataPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Database read failed." });
    
    let db = JSON.parse(data);
    
    // Add category if present
    if (category) {
      const sanitizedCat = {
        id: sanitizeText(category.id).toLowerCase(),
        name: sanitizeText(category.name),
        image: sanitizeText(category.image || "/uploads/images/bookshelves_category.png"),
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
        before: sanitizeText(project.before || "/uploads/images/bookshelves_category.png"),
        after: sanitizeText(project.after || "/uploads/images/bookshelves_category.png"),
        phases: Array.isArray(project.phases) ? project.phases.map(p => ({
          name: sanitizeText(p.name),
          image: sanitizeText(p.image || "/uploads/images/bookshelves_category.png"),
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
  const leadsPath = path.join(__dirname, "public/uploads/data/leads.jsonl");
  fs.appendFile(leadsPath, JSON.stringify(leadLog) + "\n", "utf8", (err) => {
    if (err) console.error("Failed to append lead logs locally:", err);
  });

  // Dispatches secure lead notifications if Resend API Key is defined (Render Env Vars)
  if (process.env.RESEND_API_KEY) {
    const notifyEmails = [];
    if (process.env.NOTIFICATION_EMAIL) {
      notifyEmails.push(process.env.NOTIFICATION_EMAIL);
    }
    if (process.env.SMS_GATEWAY_EMAIL) {
      notifyEmails.push(process.env.SMS_GATEWAY_EMAIL);
    }

    if (notifyEmails.length > 0) {
      resend.emails.send({
        from: 'Dan Handyman Leads <onboarding@resend.dev>',
        to: notifyEmails,
        subject: `🛠️ New Handyman Lead: ${cleanName} - ${cleanCity}`,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; border: 1px solid #d2c5c3; border-radius: 8px; overflow: hidden; background: #faf9f6; margin: 0 auto; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="background: #1a365d; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 1.8rem; font-weight: bold; letter-spacing: 1px;">DAN // <span style="color: #8c5a3c;">FAMILY MAN</span></h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.95rem;">New Carpentry & Woodwork Lead Inquiry</p>
            </div>
            
            <div style="padding: 24px;">
              <h2 style="color: #1a365d; font-size: 1.25rem; margin-top: 0; border-bottom: 2px solid #8c5a3c; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Client Details</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; width: 35%; border-bottom: 1px solid #e2e8f0;">Client Name:</td>
                  <td style="padding: 8px 0; color: #222; border-bottom: 1px solid #e2e8f0;">${cleanName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; border-bottom: 1px solid #e2e8f0;">Contact Info:</td>
                  <td style="padding: 8px 0; color: #222; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${cleanContact}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; border-bottom: 1px solid #e2e8f0;">Neighborhood/City:</td>
                  <td style="padding: 8px 0; color: #222; border-bottom: 1px solid #e2e8f0;">${cleanCity}</td>
                </tr>
              </table>
              
              <h2 style="color: #1a365d; font-size: 1.25rem; border-bottom: 2px solid #8c5a3c; padding-bottom: 6px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">Job Description</h2>
              <div style="background: #faf4eb; border-left: 4px solid #8c5a3c; padding: 16px; border-radius: 4px; margin-bottom: 24px; color: #333; font-style: italic; font-size: 1.05rem; line-height: 1.5;">
                "${cleanDesc}"
              </div>
              
              <h2 style="color: #1a365d; font-size: 1.25rem; border-bottom: 2px solid #8c5a3c; padding-bottom: 6px; margin-top: 0; text-transform: uppercase; letter-spacing: 0.5px;">Context Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; width: 35%; border-bottom: 1px solid #e2e8f0;">Inquired Project:</td>
                  <td style="padding: 8px 0; color: #222; border-bottom: 1px solid #e2e8f0;">${cleanTitle || "None (General Inquiry)"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; border-bottom: 1px solid #e2e8f0;">Referral Link:</td>
                  <td style="padding: 8px 0; color: #0284c7; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; word-break: break-all;">${cleanLink || "None"}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e2e8f0; color: #666; padding: 12px; font-size: 0.75rem; text-align: center;">
              Dispatched securely by Resend at: ${new Date().toLocaleString()} (ET)
            </div>
          </div>
        `
      }).then(response => {
        console.log("Lead email dispatched successfully via Resend:", response);
      }).catch(err => {
        console.error("Resend email dispatch failure:", err);
      });
    }
  }
  
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
