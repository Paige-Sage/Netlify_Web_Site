/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://paigeandsage.club',
  generateRobotsTxt: true,
  exclude: ['/pricing', '/careers', '/casting', '/casting/*', '/privacy', '/terms', '/sms-opt-in'],
}
