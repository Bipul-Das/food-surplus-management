// client/src/components/layout/Footer.tsx
import Link from "next/link";
import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    /* DESIGN UPGRADE: Midnight Green Background 
      Using #051b14 for a high-contrast, professional "Sustainability" finish.
      Border updated to a subtle green tint to match.
    */
    <footer className="bg-[#030367] text-white pt-16 pb-8 border-t border-brand-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">

            <div className="mb-6">
              <Logo iconSize="lg" />
            </div>

            <p className="text-sm text-green-50/80 max-w-md leading-relaxed">
              An enterprise-grade platform dedicated to eliminating food waste by connecting hotels, superstores, and restaurants with NGOs and community kitchens.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-green mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-gray-300 hover:text-white transition-all duration-300">About Us</Link></li>
              <li><Link href="/services" className="text-sm text-gray-300 hover:text-white transition-all duration-300">Services</Link></li>
              <li><Link href="/contribute" className="text-sm text-gray-300 hover:text-white transition-all duration-300">Contribute</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-green mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/apply" className="text-sm text-gray-300 hover:text-white transition-all duration-300">Submit Application</Link></li>
              <li><Link href="/login" className="text-sm text-gray-300 hover:text-white transition-all duration-300">Staff Portal</Link></li>
              <li><Link href="/contact" className="text-sm font-bold text-white hover:text-white transition-all duration-300">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} FoodSurplus Management System. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}