import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Partner with Us", href: "/partner" },
    { label: "Press", href: "/press" }
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns", href: "/returns" }
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" }
  ]
};

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://facebook.com/bloomspace" },
  { icon: Instagram, href: "https://instagram.com/bloomspace" },
  { icon: Twitter, href: "https://twitter.com/bloomspace" }
];

export function Footer() {
  return (
    <footer className="bg-[#2D312A] text-[#E8E3DD]/80">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand and Contact */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-2xl font-bold text-[#E8E3DD] mb-6 block">
              BloomSpace
            </Link>
            <p className="text-[#E8E3DD]/60 mb-6 max-w-md">
              Connecting flower lovers with talented local florists across Australia. 
              Fresh, beautiful flowers delivered with care.
            </p>
            <div className="space-y-3">
              <a href="tel:1800FLOWERS" className="flex items-center gap-2 hover:text-[#E8E3DD]">
                <Phone className="w-5 h-5" />
                1800 FLOWERS
              </a>
              <a href="mailto:hello@bloomspace.com.au" className="flex items-center gap-2 hover:text-[#E8E3DD]">
                <Mail className="w-5 h-5" />
                hello@bloomspace.com.au
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-[#E8E3DD] font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-[#E8E3DD]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-[#E8E3DD] font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-[#E8E3DD]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-[#E8E3DD] font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-[#E8E3DD]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#4A4F41] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[#E8E3DD]/60">
            © {new Date().getFullYear()} BloomSpace. All rights reserved.
          </div>
          <div className="flex gap-6">
            {SOCIAL_LINKS.map((link) => (
              <a 
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#E8E3DD]"
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
} 