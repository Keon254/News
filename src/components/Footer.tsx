import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl font-serif">C</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">CHRONICLE</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Your trusted source for breaking news, in-depth analysis, and comprehensive coverage of world events.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-white font-semibold mb-6">Sections</h3>
            <ul className="space-y-3">
              {['Politics', 'Technology', 'Business', 'Science', 'Health', 'Entertainment', 'Sports'].map(section => (
                <li key={section}>
                  <Link
                    to={`/category/${section.toLowerCase()}`}
                    className="hover:text-white transition-colors"
                  >
                    {section}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {['About Us', 'Our Team', 'Careers', 'Advertise', 'Contact'].map(item => (
                <li key={item}>
                  <Link to="/" className="hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>123 News Street, Media City, MC 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>contact@chronicle.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} CHRONICLE. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="text-gray-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="text-gray-500 hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
