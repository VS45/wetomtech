# WetomTech Premium Node.js + EJS + MongoDB Website

A complete responsive corporate website for **Wetom Technology Resources Ltd** and **wetomtech.com**.

The design follows a service-led broadband and engineering information architecture while using WetomTech's company profile, services, project photographs, mission, vision, quality statement, safety approach and contact details. It is an original implementation rather than a copy of another provider's website.

## Technology stack

- Node.js 18+
- Express
- EJS and `express-ejs-layouts`
- MongoDB
- Mongoose ODM
- Vanilla JavaScript and responsive CSS
- Nodemailer for optional email notifications

## Main features

- Premium responsive homepage
- Reusable EJS layouts and partials
- Fiber coverage and technical site-assessment form
- Contact and quotation form
- Careers expression-of-interest form
- MongoDB lead storage through Mongoose
- Automatic JSON fallback when MongoDB is disabled or temporarily unavailable
- Atomic JSON fallback writes to reduce concurrent-write corruption
- Filterable project gallery and image lightbox
- Service and project showcase pages
- Quality, health, safety, training and CSR page
- Search-engine metadata, sitemap and robots routes
- Helmet security headers, rate limiting and request-size limits
- Optional SMTP notifications through Nodemailer
- Downloadable WetomTech company profile
- Mobile navigation, FAQ accordion, reveal animation and floating WhatsApp button
- Graceful HTTP and MongoDB shutdown
- Docker Compose configuration for local MongoDB

## Requirements

- Node.js 18 or newer
- npm
- MongoDB locally, MongoDB Atlas, or the included Docker Compose service when database persistence is enabled

## Run immediately without MongoDB

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:3000
```

With this setting:

```text
DB_ENABLED=false
```

form submissions are saved to:

```text
storage/submissions.json
```

## Use a local MongoDB database

Start MongoDB on your computer and update `.env`:

```env
DB_ENABLED=true
MONGODB_URI=mongodb://127.0.0.1:27017/wetomtech
```

Use `127.0.0.1` rather than `localhost` for a local database to avoid common IPv6 resolution issues in Node.js 18+.

Initialise the collection indexes and start the website:

```bash
npm run db:init
npm start
```

MongoDB creates the `wetomtech` database and `leads` collection when the first document is saved.

## Run MongoDB with Docker

```bash
docker compose up -d mongodb
cp .env.example .env
```

Set:

```env
DB_ENABLED=true
MONGODB_URI=mongodb://127.0.0.1:27017/wetomtech
```

Then run:

```bash
npm run db:init
npm run dev
```

## Use MongoDB Atlas

Create an Atlas cluster and place its connection string in `.env`:

```env
DB_ENABLED=true
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/wetomtech?retryWrites=true&w=majority
```

Encode special characters in the database username or password before placing them in the URI. Allow the application server's IP address in Atlas Network Access.

## Lead document structure

Each contact, quote, coverage or career submission is stored in the `leads` collection with fields including:

```text
type
fullName
organisation
email
phone
service
address
message
status
sourceIp
createdAt
updatedAt
```

The schema includes indexes for submission type, email, service, status and creation time.

## Configure email notifications

Add SMTP details to `.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_user
SMTP_PASS=your_password
MAIL_FROM="WetomTech Website <no-reply@wetomtech.com>"
MAIL_TO=wetomtech@yahoo.com
```

Form submissions are still stored when SMTP is not configured.

## Validate the project

```bash
npm run check
```

## Important review before launch

1. Confirm the final company email addresses and telephone numbers.
2. Decide whether `wetomtech@yahoo.com` should be replaced by `info@wetomtech.com` or another domain email.
3. Replace or expand project photographs when higher-resolution originals are available.
4. Confirm the privacy notice with the company's legal or compliance adviser.
5. Connect the domain and enforce HTTPS.
6. Configure MongoDB backups and restrict production database network access.
7. Keep `.env` outside source control.

## Production environment example

```env
NODE_ENV=production
BASE_URL=https://wetomtech.com
PORT=3000
DB_ENABLED=true
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/wetomtech?retryWrites=true&w=majority
```

The project can be deployed to a Node.js-enabled VPS, Render, Railway, DigitalOcean, AWS, or cPanel. Use HTTPS and a reverse proxy such as Nginx for a VPS deployment.
