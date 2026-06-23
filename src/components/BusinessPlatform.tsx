import { BarChart3, CreditCard, FileText, Globe2, Mail, Search } from 'lucide-react';

const included = [
  { icon: FileText, title: 'Professional Website', desc: 'A clean, modern website customized with your business name, services, colors, photos, and calls to action.' },
  { icon: Mail, title: 'Professional Email', desc: 'Use a business email like yourname@yourbusiness.com instead of a personal Gmail address.' },
  { icon: Search, title: 'Google Visibility', desc: 'Google-friendly structure helps customers find your business online and contact you faster.' },
  { icon: Globe2, title: 'Mobile Friendly', desc: 'Your website looks polished on phones, tablets, and computers so customers can reach you anywhere.' },
];

const dashboard = [
  'View customer messages',
  'Receive quote requests',
  'Manage website photos',
  'Update your gallery',
  'Track leads',
  'Manage customer inquiries',
];

const paymentFeatures = [
  'Pay invoices',
  'Purchase services',
  'Make deposits',
  'Book appointments',
];

export default function BusinessPlatform() {
  return (
    <section id="business-platform" className="section-padding bg-[#041F19] text-white">
      <div className="container-max">
        <div className="max-w-3xl mb-6">
          <span className="inline-block text-sm font-semibold text-orange-300 bg-orange-500/10 border border-orange-500/25 rounded-full px-4 py-1.5 mb-4">
            What's Included
          </span>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
            Get Found. Get Customers. Grow Your Business.
          </h2>
          <p className="text-lg text-white/75 leading-relaxed">
            digitalBizconnect.com helps small local businesses launch a professional website for only $59.99,
            with no monthly website fee, no contracts, and a 14-day money-back guarantee.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {included.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#052E24] border border-white/10 rounded-2xl p-5 shadow-lg shadow-black/10">
              <div className="w-11 h-11 rounded-xl bg-orange-500/12 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
              <p className="text-sm text-white/65 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h3 className="font-display font-bold text-2xl text-white mb-3">
              Already Have a Website?
            </h3>
            <p className="text-white/70 leading-relaxed mb-6">
              If your website was built with AI, GoDaddy, Wix, Squarespace, or WordPress but
              it does not generate leads or look professional, we can help. We build real
              custom-coded websites made for your business.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                'Custom-coded professional website',
                'Business dashboard access',
                'Update gallery and photos yourself',
                'Manage content without a developer',
                'Online payment integration available',
                'Mobile-friendly design',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5 bg-white/7 border border-white/10 rounded-xl px-4 py-3">
                  <span className="w-5 h-5 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                  </span>
                  <span className="text-sm font-medium text-white/85">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-2xl text-white mb-3">
              Your Business Dashboard
            </h3>
            <p className="text-white/70 leading-relaxed mb-6">
              Give your business a simple place to receive messages, manage inquiries,
              update photos, and track leads after your website is online.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {dashboard.map((item) => (
                <div key={item} className="flex items-center gap-2.5 bg-white/7 border border-white/10 rounded-xl px-4 py-3">
                  <BarChart3 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-white/85">{item}</span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#052E24] p-5">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-orange-400" />
                <h4 className="font-display font-bold text-xl text-white">Accept Payments Online</h4>
              </div>
              <p className="text-sm leading-relaxed text-white/65 mb-4">
                Want customers to pay online? We can integrate payments directly into your website.
              </p>
              <div className="flex flex-wrap gap-2">
                {paymentFeatures.map((feature) => (
                  <span key={feature} className="rounded-full bg-white/7 border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/75">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
