import Link from "next/link";
import { Building2, Facebook, Instagram, Twitter, Mail, Phone, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Rented<span className="text-primary">Room</span>
              </span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed">
              Giải pháp quản lý và tìm kiếm phòng trọ hàng đầu Việt Nam. Chúng tôi kết nối niềm tin và sự thuận tiện giữa chủ hộ và khách thuê.
            </p>
            <div className="flex items-center space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button key={i} className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all">
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Dịch vụ</h4>
            <ul className="space-y-4">
              {["Tìm kiếm phòng", "Dành cho chủ trọ", "Bảng giá dịch vụ", "Hợp đồng mẫu"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 font-medium hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Công ty</h4>
            <ul className="space-y-4">
              {["Về chúng tôi", "Chính sách bảo mật", "Điều khoản dịch vụ", "Trung tâm trợ giúp"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 font-medium hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-slate-500 font-medium">
                <Phone className="h-5 w-5 text-primary" />
                <span>0901 234 567</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-500 font-medium">
                <Mail className="h-5 w-5 text-primary" />
                <span>support@rentedroom.vn</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-500 font-medium">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Quận 1, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-400 text-sm font-medium italic">
            © 2026 RentedRoom Platform. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Tiếng Việt
            </span>
            <Link href="#" className="hover:text-primary transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
