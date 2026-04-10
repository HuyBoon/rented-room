'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname.includes('/dashboard')) return null;

  return (
    <footer className="bg-slate-950 text-slate-400 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-600 text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Rented<span className="text-indigo-500">Room</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Giải pháp quản lý và thuê phòng trọ hiện đại, minh bạch và tiện lợi. Mang lại trải nghiệm tốt nhất cho cả chủ trọ và khách thuê.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-indigo-500 transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-indigo-500 transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-indigo-500 transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Liên kết nhanh</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="hover:text-indigo-500 transition-colors">Trang chủ</Link></li>
              <li><Link href="/view-room" className="hover:text-indigo-500 transition-colors">Xem phòng</Link></li>
              <li><Link href="/login" className="hover:text-indigo-500 transition-colors">Đăng nhập Quản trị</Link></li>
              <li><Link href="/tenants/login" className="hover:text-indigo-500 transition-colors">Dành cho Khách thuê</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Dịch vụ</h3>
            <ul className="space-y-4">
              <li><span className="cursor-default hover:text-indigo-500 transition-colors">Thuê phòng trọ</span></li>
              <li><span className="cursor-default hover:text-indigo-500 transition-colors">Quản lý tòa nhà</span></li>
              <li><span className="cursor-default hover:text-indigo-500 transition-colors">Thanh toán hóa đơn</span></li>
              <li><span className="cursor-default hover:text-indigo-500 transition-colors">Hỗ trợ kỹ thuật</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0" />
                <span className="text-sm">123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0" />
                <span className="text-sm">0901 234 567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-indigo-500 flex-shrink-0" />
                <span className="text-sm">info@rentedroom.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
          <p>© {currentYear} RentedRoom. Tất cả các quyền được bảo lưu.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
