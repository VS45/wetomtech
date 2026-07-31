const site = require('../data/siteData');

function renderPage(view, metadata = {}) {
  return (req, res) => {
    res.render(`pages/${view}`, {
      title: metadata.title,
      description: metadata.description,
      canonicalPath: req.path,
      ...metadata.locals
    });
  };
}

exports.home = renderPage('home', {
  title: 'Fiber Internet, Telecom Infrastructure and Solar Solutions',
  description:
    'Wetom Technology Resources Ltd delivers fiber internet deployment, telecom infrastructure, renewable energy and engineering site-build services in Nigeria.'
});
exports.wetomnet = renderPage('wetomnet', {
  title: 'WetomNet - Your Fiber Internet Provider',
  description:
    'Experience high-speed fiber internet with WetomNet, delivering reliable connectivity across Nigeria.'
});

exports.about = renderPage('about', {
  title: 'About Wetom Technology Resources Ltd',
  description:
    'Learn about WetomTech’s mission, vision, values, technical manpower and commitment to reliable engineering solutions.'
});

exports.services = renderPage('services', {
  title: 'Technology and Engineering Services',
  description:
    'Explore WetomTech services in fiber internet, telecom infrastructure, renewable energy, civil works and site build.'
});

exports.projects = renderPage('projects', {
  title: 'Selected Telecom, Solar and Engineering Projects',
  description:
    'View selected WetomTech projects covering rectifier cabinets, solar systems, civil works and telecom site builds.'
});

exports.qualitySafety = renderPage('quality-safety', {
  title: 'Quality, Health, Safety and Environment',
  description:
    'WetomTech’s approach to quality management, environmental responsibility, safety, training and corporate social responsibility.'
});

exports.contact = renderPage('contact', {
  title: 'Contact WetomTech',
  description:
    'Contact Wetom Technology Resources Ltd in Garki, Abuja for fiber internet, telecom, solar and engineering enquiries.'
});

exports.coverage = renderPage('coverage', {
  title: 'Request a Coverage and Site Assessment',
  description:
    'Submit your address for a WetomTech fiber coverage review, telecom site survey or renewable energy assessment.'
});

exports.careers = renderPage('careers', {
  title: 'Careers and Technical Opportunities',
  description:
    'Learn about technical career and manpower opportunities with Wetom Technology Resources Ltd.'
});

exports.privacy = renderPage('privacy', {
  title: 'Privacy Notice',
  description: 'Privacy notice for wetomtech.com website enquiries.'
});

exports.downloadProfile = (req, res) => {
  res.download(
    require('path').join(__dirname, '..', 'public', 'files', 'wetom-company-profile.pdf'),
    'Wetom-Technology-Resources-Ltd-Company-Profile.pdf'
  );
};

exports.sitemap = (req, res) => {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const pages = ['', '/about', '/services', '/projects', '/quality-safety', '/coverage', '/contact', '/careers'];
  const urls = pages.map((path) => `<url><loc>${baseUrl}${path}</loc></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
};

exports.robots = (req, res) => {
  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`);
};
