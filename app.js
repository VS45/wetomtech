const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const webRoutes = require('./routes/web');
const siteData = require('./data/siteData');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

app.use(expressLayouts);

// Updated Helmet CSP to allow Flutterwave
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.flutterwave.com",
          "https://*.flutterwave.com"
        ],
        scriptSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.flutterwave.com",
          "https://*.flutterwave.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", 'data:', "https://fonts.gstatic.com"],
        imgSrc: ["'self'", 'data:', "https:"],
        frameSrc: [
          "'self'", 
          "https://checkout.flutterwave.com", 
          "https://checkout-v3.flutterwave.com", 
          "https://*.flutterwave.com"
        ],
        connectSrc: [
          "'self'", 
          "https://api.flutterwave.com", 
          "https://*.flutterwave.com", 
          "https://api.ravepay.co", 
          "https://*.ravepay.co"
        ],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(compression());
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(express.json({ limit: '100kb' }));

app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
    etag: true
  })
);

const leadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests. Please wait and try again.'
});

app.locals.site = siteData;
app.locals.currentYear = new Date().getFullYear();
app.locals.formatPhone = (phone) => phone.replace(/\s+/g, '');

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.locals.formStatus = req.query.status || null;
  res.locals.canonicalPath = null;
  next();
});

app.use(['/contact', '/coverage', '/quote'], leadLimiter);
app.use('/', webRoutes);
app.use('/payments', require('./routes/paymentRoutes'));

app.use((req, res) => {
  res.status(404).render('pages/404', {
    title: 'Page Not Found',
    description: 'The page you requested could not be found.'
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('pages/error', {
    title: 'Something Went Wrong',
    description: 'We could not complete your request. Please try again.'
  });
});

module.exports = app;