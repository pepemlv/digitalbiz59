import { useEffect, useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
  LockKeyhole,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { subscribeToContactMessages } from '../lib/firebase';
import { formatTemplatePrice, subscribeToWebsitePayments, type WebsitePayment } from '../lib/templatePricing';

const footerLinks = {
  Services: ['Professional Website', 'Quote Request Forms', 'Professional Email', 'Custom Domain', 'Dashboard Access', 'Payment Integration'],
  Industries: ['Cleaning Services', 'Landscaping', 'Pressure Washing', 'Handyman Services', 'Roofing', 'Contractors'],
  Company: ['Pricing', 'Templates', 'FAQ', 'Contact'],
};

const socials = [
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'Twitter' },
  { icon: Linkedin, label: 'LinkedIn' },
  { icon: Instagram, label: 'Instagram' },
];

export default function Footer() {
  const [newRequestCount, setNewRequestCount] = useState(0);
  const [payments, setPayments] = useState<WebsitePayment[]>([]);

  useEffect(() => {
    return subscribeToContactMessages(
      (messages) => setNewRequestCount(messages.filter((message) => message.status === 'new').length),
      () => setNewRequestCount(0),
    );
  }, []);

  useEffect(() => {
    return subscribeToWebsitePayments(
      setPayments,
      () => setPayments([]),
    );
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openLaunchCheckout = () => {
    window.dispatchEvent(new CustomEvent('webfor59:open-checkout', { detail: { product: 'launch' } }));
  };

  const latestPayment = payments[0];
  const PaymentAlertIcon = latestPayment?.checkoutMode === 'reserve' ? AlertTriangle : AlertCircle;

  return (
    <footer className="bg-[#041F19]">
      <div className="border-t border-white/8 bg-[#052E24] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            Ready To Get Online for $59.99?
          </h2>
          <p className="text-white/65 mb-7">
            Launch today, reserve and pay later, or ask about a custom domain starting at $9.99 per year.
          </p>
          <button
            onClick={openLaunchCheckout}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-orange-600/25"
          >
            Launch My Website <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-white/6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="WebFor59" className="w-12 h-12 object-contain" />
              <span className="font-display font-bold text-white text-lg tracking-tight">
                WebFor<span className="text-orange-300">59</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
              Professional websites for small local businesses. Get found, get customers, and grow your business.
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span>(704) 281-0980</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span>contact@webfor59.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span>Nationwide Service</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => scrollTo(category === 'Company' && link === 'Templates' ? '#industries' : '#pricing')}
                      className="text-sm text-white/60 hover:text-orange-200 transition-colors text-left"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} WebFor59. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ icon: Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-8 h-8 bg-white/5 hover:bg-orange-500/15 border border-white/6 hover:border-orange-500/25 rounded-lg flex items-center justify-center transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-white/55" />
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-white/40">
            <button className="hover:text-orange-200 transition-colors">Privacy Policy</button>
            <button className="hover:text-orange-200 transition-colors">Terms of Service</button>
            {latestPayment && (
              <a
                href="/superadmin"
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors ${
                  latestPayment.checkoutMode === 'reserve'
                    ? 'bg-yellow-500/10 text-yellow-200 ring-1 ring-yellow-500/20 hover:bg-yellow-500/15'
                    : 'bg-red-500/10 text-red-200 ring-1 ring-red-500/20 hover:bg-red-500/15'
                }`}
                title={`${latestPayment.customerName} ${latestPayment.checkoutMode === 'reserve' ? 'reserved' : 'paid'} ${formatTemplatePrice(latestPayment.amountPaid)}`}
              >
                <PaymentAlertIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{latestPayment.checkoutMode === 'reserve' ? 'Reserved' : 'Paid'}</span>
                <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-white/15 px-1.5 text-[0.65rem] font-bold text-white">
                  {payments.length}
                </span>
              </a>
            )}
            <a href="/admin" className="relative inline-flex items-center gap-1.5 hover:text-orange-200 transition-colors">
              <LockKeyhole className="w-3.5 h-3.5" />
              Admin Login
              {newRequestCount > 0 && (
                <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-[0.65rem] font-bold text-white">
                  {newRequestCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
