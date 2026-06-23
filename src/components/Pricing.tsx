import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CheckCircle, ArrowRight, Star, CreditCard, ShoppingCart, X } from 'lucide-react';
import { formatTemplatePrice, saveWebsitePayment, subscribeToTemplateSettings } from '../lib/templatePricing';

interface CheckoutProductBase {
  planName: string;
  templateId: string;
  title: string;
  summaryTitle: string;
  defaultPrice: number;
  description: string;
}

type CheckoutProduct = CheckoutProductBase & { price: number };

const checkoutProductDefaults: Record<'launch' | 'existingDomain', CheckoutProductBase> = {
  launch: {
    planName: 'Website Launch',
    templateId: 'webfor59-launch',
    title: 'Launch Website Today',
    summaryTitle: 'Website launch',
    defaultPrice: 59.99,
    description: 'Includes mobile-friendly website, contact and quote request form, professional email setup support, and Google-friendly structure.',
  },
  existingDomain: {
    planName: 'Use Existing Domain',
    templateId: 'webfor59-existing-domain',
    title: 'Use Your Existing Domain',
    summaryTitle: 'Existing domain setup',
    defaultPrice: 49.99,
    description: 'Includes DNS setup assistance and connecting your current domain to your new digitalBizconnect.com website.',
  },
} as const;

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function buildPlans(products: { launch: CheckoutProduct; existingDomain: CheckoutProduct }) {
  return [
  {
    name: 'Website Launch',
    tagline: 'Get online today',
    price: formatTemplatePrice(products.launch.price),
    suffix: 'one time',
    highlight: true,
    badge: 'Best Value',
    features: [
      'Professional business website',
      'Mobile-friendly design',
      'Contact and quote request form',
      'Professional business email setup',
      'Google-friendly structure',
      'No monthly website fee',
      'No contracts',
      '14-day money-back guarantee',
    ],
    cta: 'Launch Today',
  },
  {
    name: 'Use Existing Domain',
    tagline: 'Do you want to use your existing domain?',
    price: formatTemplatePrice(products.existingDomain.price),
    suffix: 'one time',
    highlight: false,
    features: [
      'Connect your current domain',
      'DNS setup assistance',
      'Use professional business email',
      'Keep your brand easy to remember',
      'Move your domain to the new website',
      'Perfect if you already own a domain',
    ],
    cta: 'Use My Existing Domain',
  },
  {
    name: 'Reserve & Pay Later',
    tagline: 'Not ready to launch?',
    price: 'Reserve',
    suffix: 'pay later',
    highlight: false,
    features: [
      'Reserve your website today',
      'Send business details when ready',
      'Preview before launch',
      'Launch when you are ready',
      'Ideal for businesses still preparing',
      'No long-term commitment',
    ],
    cta: 'Reserve My Website',
  },
  ];
}

const perfectFor = [
  'Cleaning Services',
  'Landscaping',
  'Pressure Washing',
  'Handyman Services',
  'Roofing',
  'Painting',
  'Auto Detailing',
  'Junk Removal',
  'Contractors',
  'Small Local Businesses',
];

const faqs = [
  { question: 'How much does it cost?', answer: 'Only $59.99 to launch your website.' },
  { question: 'Are there monthly fees?', answer: 'No monthly website fees and no contracts.' },
  { question: 'Do I need a domain name?', answer: 'No. We can help you get one starting at $9.99 per year.' },
  { question: 'How long does it take?', answer: 'Most websites can be launched within 24 hours after we receive your business details.' },
  { question: 'What if I am not satisfied?', answer: 'We offer a 14-day money-back guarantee.' },
];

function DigitalBizconnectCheckoutForm({
  product,
  onPaid,
}: {
  product: CheckoutProduct;
  onPaid: (paymentIntentId: string) => void | Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    domain: '',
    notes: '',
  });

  const handleChange = (field: keyof typeof customerInfo, value: string) => {
    setCustomerInfo((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const orderId = `${product.templateId}-${Date.now()}`;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${apiUrl}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price,
          promoPrice: product.price,
          balanceDue: 0,
          orderId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          businessName: customerInfo.businessName,
          websiteDomain: customerInfo.domain,
          templateId: product.templateId,
          productType: 'website-template',
          notes: customerInfo.notes,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to start checkout. Please try again.');
      }

      const { clientSecret } = await response.json();
      if (!clientSecret) throw new Error('Stripe did not return a client secret.');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            phone: customerInfo.phone,
          },
        },
      });

      if (error) throw new Error(error.message || 'Payment failed. Please try again.');

      if (paymentIntent?.status === 'succeeded') {
        await saveWebsitePayment({
          templateId: product.templateId,
          businessName: customerInfo.businessName || `digitalBizconnect.com ${product.summaryTitle}`,
          websiteDomain: customerInfo.domain,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          amountPaid: product.price,
          promoPrice: product.price,
          balanceDue: 0,
          checkoutMode: 'full',
          paymentIntentId: paymentIntent.id,
          notes: customerInfo.notes,
        });
        await onPaid(paymentIntent.id);
      } else {
        throw new Error('Payment was not completed.');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form className="space-y-4 p-6" onSubmit={handleSubmit}>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required placeholder="Your name" value={customerInfo.name} onChange={(event) => handleChange('name', event.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500" />
        <input required type="email" placeholder="Email address" value={customerInfo.email} onChange={(event) => handleChange('email', event.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input required type="tel" placeholder="Phone number" value={customerInfo.phone} onChange={(event) => handleChange('phone', event.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500" />
        <input required placeholder="Business name" value={customerInfo.businessName} onChange={(event) => handleChange('businessName', event.target.value)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500" />
      </div>
      <input
        value={customerInfo.domain}
        onChange={(event) => handleChange('domain', event.target.value)}
        placeholder="Preferred domain name"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
      />
      <textarea
        rows={3}
        value={customerInfo.notes}
        onChange={(event) => handleChange('notes', event.target.value)}
        placeholder="Services you offer, colors, logo notes, photos, service area, or special instructions"
        className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
      />
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
          <CreditCard className="h-4 w-4" />
          Card Information
        </label>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#0f172a',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  '::placeholder': { color: '#94a3b8' },
                },
                invalid: { color: '#dc2626' },
              },
            }}
          />
        </div>
      </div>
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <p className="text-xs leading-5 text-slate-500">
        Secure payment powered by Stripe. Your card details are encrypted and never stored on this site.
      </p>
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs leading-5 text-orange-900">
        14-day money-back guarantee if you are not satisfied. Our service team will contact you
        by email, text, or phone with a preview link and to collect any extra details needed for
        your website.
      </div>
      <button type="submit" disabled={!stripe || isProcessing} className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-4 font-bold text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60">
        <CreditCard className="h-5 w-5" />
        {isProcessing ? 'Processing...' : `Pay ${formatTemplatePrice(product.price)} Securely`}
      </button>
    </form>
  );
}

function DigitalBizconnectCheckoutModal({
  product,
  onClose,
}: {
  product: CheckoutProduct;
  onClose: () => void;
}) {
  const [paid, setPaid] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState('');

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">digitalBizconnect.com Checkout</p>
              <h2 className="font-display text-2xl font-bold text-slate-950">{product.title}</h2>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {paid ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="font-display text-2xl font-bold text-slate-950">Payment received</h3>
              <p className="mx-auto mt-3 max-w-md text-slate-600">
                Your digitalBizconnect.com payment is complete. We will contact you to collect your business details and begin the setup.
              </p>
              {paymentIntentId && <p className="mt-3 text-xs font-semibold text-slate-400">Payment ID: {paymentIntentId}</p>}
              <button onClick={onClose} className="mt-7 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-500">
                Close
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_260px]">
              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <DigitalBizconnectCheckoutForm
                    product={product}
                    onPaid={(id) => {
                      setPaymentIntentId(id);
                      setPaid(true);
                    }}
                  />
                </Elements>
              ) : (
                <div className="p-6">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                    Stripe checkout needs <span className="font-bold">VITE_STRIPE_PUBLISHABLE_KEY</span> in the frontend environment before card payment can load.
                  </div>
                </div>
              )}

              <aside className="border-t border-slate-100 bg-slate-50 p-6 lg:border-l lg:border-t-0">
                <div className="rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                      <ShoppingCart className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{product.summaryTitle}</p>
                      <p className="text-xs text-slate-500">One-time payment. No monthly fee.</p>
                    </div>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">digitalBizconnect.com service</span>
                      <span className="font-semibold text-slate-900">{formatTemplatePrice(product.price)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Monthly fee</span>
                      <span className="font-semibold text-slate-900">$0</span>
                    </div>
                    <div className="border-t border-slate-100 pt-3 flex justify-between gap-3">
                      <span className="font-bold text-slate-950">Total</span>
                      <span className="font-display text-2xl font-bold text-orange-600">{formatTemplatePrice(product.price)}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-500">
                  {product.description}
                </p>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [checkoutProduct, setCheckoutProduct] = useState<CheckoutProduct | null>(null);
  const [productPrices, setProductPrices] = useState({
    launch: checkoutProductDefaults.launch.defaultPrice,
    existingDomain: checkoutProductDefaults.existingDomain.defaultPrice,
  });
  const checkoutProducts = {
    launch: { ...checkoutProductDefaults.launch, price: productPrices.launch },
    existingDomain: { ...checkoutProductDefaults.existingDomain, price: productPrices.existingDomain },
  };
  const plans = buildPlans(checkoutProducts);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }); },
      { threshold: 0.1 }
    );
    document.querySelectorAll('#pricing .animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const openCheckout = (event: Event) => {
      const product = (event as CustomEvent<{ product?: string }>).detail?.product;

      if (product === 'launch') {
        setCheckoutProduct(checkoutProducts.launch);
      }
    };

    window.addEventListener('webfor59:open-checkout', openCheckout);
    return () => window.removeEventListener('webfor59:open-checkout', openCheckout);
  }, [checkoutProducts.launch]);

  useEffect(() => {
    return subscribeToTemplateSettings((settings) => {
      setProductPrices({
        launch: settings[checkoutProductDefaults.launch.templateId]?.price ?? checkoutProductDefaults.launch.defaultPrice,
        existingDomain: settings[checkoutProductDefaults.existingDomain.templateId]?.price ?? checkoutProductDefaults.existingDomain.defaultPrice,
      });
    });
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePlanClick = (planName: string) => {
    if (planName === checkoutProducts.launch.planName) {
      setCheckoutProduct(checkoutProducts.launch);
      return;
    }

    if (planName === checkoutProducts.existingDomain.planName) {
      setCheckoutProduct(checkoutProducts.existingDomain);
      return;
    }

    scrollTo('#contact');
  };

  return (
    <section id="pricing" className="section-padding bg-[#052E24]">
      <div className="container-max">
        <div className="text-center mb-14 animate-on-scroll">
          <span className="inline-block text-sm font-semibold text-orange-300 bg-orange-500/10 border border-orange-500/25 rounded-full px-4 py-1.5 mb-4">
            Simple Pricing
          </span>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
            Launch Today or <span className="text-orange-400">Reserve and Pay Later</span>
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Your website can be online today. Reserve now if you are not ready to launch.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start mb-12">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`animate-on-scroll relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                plan.highlight
                  ? 'bg-[#041F19] border border-orange-500/45 shadow-2xl shadow-black/35 ring-2 ring-orange-500 ring-offset-2 ring-offset-[#052E24] scale-[1.02]'
                  : 'bg-white/7 border border-white/10 shadow-lg shadow-black/10 hover:bg-white/10 hover:-translate-y-0.5'
              }`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              {'badge' in plan && plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1.5 bg-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-orange-600/30">
                    <Star className="w-3 h-3 fill-white" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.highlight ? 'text-orange-400' : 'text-orange-300'}`}>
                  {plan.name}
                </p>
                <h3 className="font-display font-bold text-xl text-white">
                  {plan.tagline}
                </h3>
              </div>

              <div className="mb-6 pb-6 border-b border-white/10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display font-bold text-4xl text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-white/45">{plan.suffix}</span>
                </div>
                <p className="text-sm mt-1 text-white/60">Fast setup for small businesses</p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-orange-400' : 'text-green-400'}`} />
                    <span className="text-sm text-white/75">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan.name)}
                className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  plan.highlight
                    ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30'
                    : 'bg-white/10 hover:bg-white/15 border border-white/15 text-white shadow-sm hover:shadow-md'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <div className="animate-on-scroll rounded-2xl border border-white/10 bg-white/7 p-6">
            <h3 className="font-display text-2xl font-bold text-white mb-4">Perfect For</h3>
            <div className="flex flex-wrap gap-2">
              {perfectFor.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/7 px-3 py-1.5 text-sm font-semibold text-white/75">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-on-scroll rounded-2xl border border-white/10 bg-white/7 p-6">
            <h3 className="font-display text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <p className="font-semibold text-white">{faq.question}</p>
                  <p className="text-sm leading-6 text-white/60">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 text-center animate-on-scroll">
          <p className="text-sm text-white/60">
            Launch Today - Reserve & Pay Later - 14-Day Money-Back Guarantee
          </p>
        </div>
      </div>
      {checkoutProduct && (
        <DigitalBizconnectCheckoutModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
        />
      )}
    </section>
  );
}
