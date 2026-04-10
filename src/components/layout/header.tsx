'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ContactModal } from "@/components/shared/contact-modal";
import { Building2, Menu, X, LogIn, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.includes('/dashboard')) return null;

  const navLinks = [
    { name: "Trang chủ", href: "/" },
    { name: "Xem phòng", href: "/view-room" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isScrolled ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/20 backdrop-blur-sm text-white'
            }`}>
              <Building2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${
              isScrolled ? 'text-slate-900' : 'text-white'
            }`}>
              Rented<span className="text-indigo-500">Room</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-semibold transition-colors hover:text-indigo-500 ${
                  isScrolled ? 'text-slate-600' : 'text-white/90'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center text-sm font-semibold transition-colors hover:text-indigo-500 focus:outline-none ${
                    isScrolled ? 'text-slate-600' : 'text-white/90'
                  }`}>
                  Đối tác <ChevronDown className="ml-1 h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border-slate-100">
                <DropdownMenuItem asChild>
                  <Link href="/login" className="cursor-pointer">Quản trị hệ thống</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tenants/login" className="cursor-pointer">Dành cho khách thuê</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center space-x-4 ml-4">
              <ContactModal 
                trigger={
                  <Button variant="ghost" className={`font-semibold ${
                    isScrolled ? 'text-slate-600 hover:text-indigo-600 bg-slate-100' : 'text-white hover:text-white bg-white/10'
                  }`}>
                    Liên hệ
                  </Button>
                }
              />
              <Link href="/login">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all border-0 rounded-lg">
                  <LogIn className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen 
              ? <X className={`h-6 w-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} /> 
              : <Menu className={`h-6 w-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden bg-slate-900 transition-all duration-500 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-8 p-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl font-bold text-white hover:text-indigo-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px w-24 bg-white/20" />
          <Link 
            href="/login" 
            className="text-xl font-semibold text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Quản trị viên
          </Link>
          <Link 
            href="/tenants/login" 
            className="text-xl font-semibold text-white/80 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Khách thuê
          </Link>
          <ContactModal 
            trigger={
              <Button size="lg" variant="outline" className="text-white border-white/20 bg-white/5 w-full max-w-xs">
                Liên hệ hỗ trợ
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}
