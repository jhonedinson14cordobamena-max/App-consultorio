const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cambia-esta-clave';
const JOBS_FILE = path.join(__dirname, 'data', 'jobs.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readJobs() {
  const raw = fs.readFileSync(JOBS_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeJobs(jobs) {
  fs.writeFileSync(JOBS_FILE, JSON.stringify(jobs, null, 2));
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token || !timingSafeEqual(token, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// --- Auth ---
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && timingSafeEqual(password, ADMIN_PASSWORD)) {
    return res.json({ token: ADMIN_PASSWORD });
  }
  res.status(401).json({ error: 'Contraseña incorrecta' });
});

// --- Ofertas públicas ---
app.get('/api/jobs', (req, res) => {
  const jobs = readJobs().sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const jobs = readJobs();
  const job = jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Oferta no encontrada' });
  res.json(job);
});

// --- Administración (protegido) ---
app.post('/api/jobs', requireAdmin, (req, res) => {
  const jobs = readJobs();
  const body = req.body || {};
  if (!body.title || !body.company || !body.city) {
    return res.status(400).json({ error: 'Título, empresa y ciudad son obligatorios' });
  }
  const job = {
    id: crypto.randomUUID(),
    title: body.title,
    company: body.company,
    city: body.city,
    modality: body.modality || 'Presencial',
    salary: body.salary || '',
    category: body.category || '',
    description: body.description || '',
    requirements: body.requirements || '',
    contactType: body.contactType || 'whatsapp',
    contact: body.contact || '',
    featured: !!body.featured,
    postedAt: new Date().toISOString(),
  };
  jobs.push(job);
  writeJobs(jobs);
  res.status(201).json(job);
});

app.put('/api/jobs/:id', requireAdmin, (req, res) => {
  const jobs = readJobs();
  const idx = jobs.findIndex((j) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Oferta no encontrada' });
  jobs[idx] = { ...jobs[idx], ...req.body, id: jobs[idx].id };
  writeJobs(jobs);
  res.json(jobs[idx]);
});

app.delete('/api/jobs/:id', requireAdmin, (req, res) => {
  const jobs = readJobs();
  const next = jobs.filter((j) => j.id !== req.params.id);
  if (next.length === jobs.length) return res.status(404).json({ error: 'Oferta no encontrada' });
  writeJobs(next);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Empleo 48 horas corriendo en http://localhost:${PORT}`);
  if (ADMIN_PASSWORD === 'cambia-esta-clave') {
    console.warn('ADVERTENCIA: define la variable de entorno ADMIN_PASSWORD antes de publicar el sitio.');
  }
});
