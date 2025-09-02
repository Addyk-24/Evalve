import { Twitter, Linkedin, Github, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const navigationLinks = [
    {
      title: "Platform",
      links: [
        { name: "Home", href: "#home" },
        { name: "About", href: "#about" },
        { name: "Features", href: "#features" },
        { name: "Startups", href: "#startups" }
      ]
    },
    {
      title: "For Users",
      links: [
        { name: "Developers", href: "#developers" },
        { name: "Entrepreneurs", href: "#entrepreneurs" },
        { name: "Investors", href: "#investors" },
        { name: "Join Platform", href: "#join" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "#blog" },
        { name: "Help Center", href: "#help" },
        { name: "API Docs", href: "#api" },
        { name: "Success Stories", href: "#stories" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about-us" },
        { name: "Careers", href: "#careers" },
        { name: "Contact", href: "#contact" },
        { name: "Press", href: "#press" }
      ]
    }
  ];

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#twitter" },
    { name: "LinkedIn", icon: Linkedin, href: "#linkedin" },
    { name: "GitHub", icon: Github, href: "#github" }
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Terms of Service", href: "#terms" },
    { name: "Cookie Policy", href: "#cookies" },
    { name: "Security", href: "#security" }
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <footer
        id="investors"
        className="bg-black dark:bg-white text-white dark:text-black"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {/* Newsletter Section */}
        <div className="bg-gray-900 dark:bg-gray-100 border-b border-gray-800 dark:border-gray-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4 text-white dark:text-black">
                Stay in the loop
              </h3>
              <p className="text-xl text-gray-300 dark:text-gray-600 mb-8 max-w-2xl mx-auto">
                Get the latest updates on funding opportunities, new partnerships, and success stories from our community
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <div className="relative flex-1 w-full sm:w-auto">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-700 dark:border-gray-300 bg-white dark:bg-gray-50 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-black"
                  />
                </div>
                <button className="w-full sm:w-auto bg-white dark:bg-black text-black dark:text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <span className="text-3xl font-bold text-white dark:text-black">INDEV.Ai</span>
              </div>
              <p className="text-gray-300 dark:text-gray-600 mb-6 leading-relaxed">
                Connecting developers, entrepreneurs, and investors to build the future of technology. 
                Join our community and turn your ideas into successful ventures.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300 dark:text-gray-600">San Francisco, CA & Remote</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300 dark:text-gray-600">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300 dark:text-gray-600">hello@indev.ai</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            {navigationLinks.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-4 text-white dark:text-black">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-300 dark:text-gray-600 hover:text-white dark:hover:text-black text-sm transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 dark:border-gray-300 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Legal Links */}
              <div className="flex flex-wrap gap-6">
                {legalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-black transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      className="w-10 h-10 bg-gray-800 dark:bg-gray-200 hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-white dark:hover:text-black transition-all duration-200"
                      aria-label={social.name}
                    >
                      <IconComponent size={18} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center mt-8 pt-6 border-t border-gray-800 dark:border-gray-300">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                © 2024 INDEV.Ai. All rights reserved. Building the future, one connection at a time.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-900 dark:bg-gray-100 border-t border-gray-800 dark:border-gray-300">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
                <span className="text-sm text-gray-300 dark:text-gray-600">SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
                <span className="text-sm text-gray-300 dark:text-gray-600">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
                <span className="text-sm text-gray-300 dark:text-gray-600">256-bit SSL Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}