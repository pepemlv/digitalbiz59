import { BookOpen, CreditCard, Globe2, ReceiptText } from 'lucide-react';

const trust = [
  { icon: Globe2, label: 'Website only $59.99' },
  { icon: CreditCard, label: 'Reserve & pay later' },
  { icon: BookOpen, label: 'Dashboard access available' },
  { icon: ReceiptText, label: '14-day money-back guarantee' },
];

export default function TrustBar() {
  return (
    <div className="bg-[#052E24] border-y border-white/10 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {trust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-orange-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-white">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
