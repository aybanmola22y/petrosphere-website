import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="md:col-span-4 lg:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <span className="font-bold text-2xl tracking-tight text-foreground">
                Petrosphere
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Petrosphere Incorporated is a one-stop-shop training, review and consultancy company that caters the needs of companies across industries ranging from oil and gas, construction, mining, manufacturing, service, call center, and many others.
            </p>
          </div>

          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-sm text-foreground">Platform</h4>
              <Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Curriculum</Link>
              <Link href="/schedule" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Schedule</Link>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Consulting</Link>
              <Link href="/contact?intent=corporate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Enterprise Sales</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-sm text-foreground">Company</h4>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-semibold text-sm text-foreground">Legal</h4>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Petrosphere Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:justify-end">
            <Link
              href="/admin"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">ISO 9001:2015 Certified</span>
            <span className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
