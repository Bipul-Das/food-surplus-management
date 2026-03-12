// client/src/components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-8 border-t border-brand-blue/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <span className="text-2xl font-extrabold tracking-tight text-white mb-4 block">
              Food<span className="text-brand-light">Surplus</span>
            </span>
            <p className="text-sm text-blue-200 max-w-md leading-relaxed">
              An enterprise-grade platform dedicated to eliminating food waste by connecting hotels, superstores, and restaurants with NGOs and community kitchens.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-blue-100 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/services" className="text-sm text-blue-100 hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/contribute" className="text-sm text-blue-100 hover:text-white transition-colors">Contribute</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/apply" className="text-sm text-blue-100 hover:text-white transition-colors">Submit Application</Link></li>
              <li><Link href="/login" className="text-sm text-blue-100 hover:text-white transition-colors">Staff Portal</Link></li>
              <li><Link href="/contact" className="text-sm font-semibold text-brand-light hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-blue-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-blue-400">
            &copy; {new Date().getFullYear()} FoodSurplus Management System. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-blue-400 hover:text-white">Privacy Policy</Link>
            <Link href="#" className="text-xs text-blue-400 hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}