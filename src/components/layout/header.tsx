'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  Menu, 
  X, 
  Building2,
  Phone,
  User,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { title: "Trang chủ", href: "/" },
    { title: "Tìm phòng", href: "/view-room" },
    { title: "Bảng giá", href: "/pricing" },
    { title: "Liên hệ", href: "/contact" },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled || isMobileMenuOpen 
        ? "bg-white border-b border-slate-100 shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="p-2 bg-primary rounded-lg text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <Building2 className="h-6 w-6" />
          </div>
          <span className={cn(
            "text-2xl font-black tracking-tight transition-colors",
            isScrolled ? "text-slate-900" : "text-slate-900"
          )}>
            Rented<span className="text-primary">Room</span>
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.title} 
              href={link.href}
              className={cn(
                "text-sm font-bold transition-colors hover:text-primary relative py-1",
                pathname === link.href ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" : "text-slate-600"
              )}
            >
              {link.title}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-bold text-slate-700 hover:text-primary hover:bg-primary/5">
              Chào chủ trọ
            </Button>
          </Link>
          <Link href="/tenants/login">
            <Button className="rounded-full px-8 shadow-lg shadow-primary/20">
              Cư dân đăng nhập
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-6 py-8 flex flex-col space-y-6 text-center">
            {navLinks.map((link) => (
              <Link 
                key={link.title} 
                href={link.href}
                className={cn(
                  "text-lg font-bold py-2",
                  pathname === link.href ? "text-primary" : "text-slate-600"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}
            <div className="pt-6 border-t border-slate-50 flex flex-col space-y-4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-12 rounded-xl text-primary border-primary">
                  Dành cho chủ trọ
                </Button>
              </Link>
              <Link href="/tenants/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full h-12 rounded-xl shadow-lg shadow-primary/20">
                  Cư dân đăng nhập
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
