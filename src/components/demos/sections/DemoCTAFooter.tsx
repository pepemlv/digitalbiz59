import { ArrowRight, Zap } from 'lucide-react';
import type { IndustryConfig } from '../industryConfigs';

interface Props {
  config: IndustryConfig;
  onDemoInquiry: (action: string) => void;
}

export default function DemoCTAFooter({ config, onDemoInquiry }: Props) {
  return (
    <section className="py-20 px-6 lg:px-8 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: config.accentHex }}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-6"
          style={{ backgroundColor: `${config.accentHex}20`, border: `1px solid ${config.accentHex}40`, color: config.accentHex }}
        >
          <Zap className="w-3.5 h-3.5" />
          Powered by digitalBizconnect.com
        </div>

        <h2 className="font-display font-bold text-3xl lg:text-4xl text-white mb-4">
          We Built This Website Demo for Your Company
        </h2>
        <p className="text-slate-400 mb-8 text-lg">
          After checking Google, we noticed your company does not have a professional website yet.
          If you like this demo, digitalBizconnect.com can customize it with your business details and help
          launch your website for only $59.99. Custom domains start at $9.99 per year.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => onDemoInquiry('pay_receipt')}
            className="group flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{ backgroundColor: config.accentHex }}
          >
            Launch for $59.99
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onDemoInquiry('more_info')}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-white/8 hover:bg-white/14 border border-white/12 text-white font-semibold rounded-xl transition-all"
          >
            Message for More Information
          </button>
        </div>

        <p className="text-slate-500 text-sm mt-5">
          Launch today - Reserve and pay later - 14-day money-back guarantee
        </p>
      </div>
    </section>
  );
}
