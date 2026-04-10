'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Home as HomeIcon, 
  LogIn, 
  ShieldCheck, 
  BarChart3, 
  Smartphone, 
  Zap, 
  ArrowRight,
  Building,
  Users,
  CreditCard,
  MessageSquare,
  Search,
  CheckCircle2,
  Heart,
  Star
} from "lucide-react";
import { ContactModal } from "@/components/shared/contact-modal";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image with Light Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Users/huyboon/.gemini/antigravity/brain/635015fa-ae8f-41a0-82bc-74706dba320c/cozy_apartment_hero_1775792418460.png" 
            alt="Cozy Modern Apartment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-6">
          <div className="max-w-3xl animate-in fade-in slide-in-from-left-8 duration-1000">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary">
              <Star className="h-3.5 w-3.5 mr-2 fill-primary/20" /> Nền tảng tìm phòng trọ tin cậy nhất
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
              Tìm nơi an cư <br />
              <span className="text-primary italic">Lý tưởng & Thuận tiện</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-xl font-medium leading-relaxed">
              Hệ thống quản lý phòng trọ minh bạch, kết nối trực tiếp chủ nhà và khách thuê. Đơn giản hóa mọi quy trình tìm kiếm và thanh toán.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center mb-12">
              <Link href="/view-room" className="w-full sm:w-auto">
                <Button size="lg" className="h-14 px-10 w-full sm:w-auto rounded-full shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
                  <Search className="h-5 w-5 mr-2" /> Khám phá phòng ngay
                </Button>
              </Link>
              <Link href="/tenants/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="h-14 px-10 w-full sm:w-auto rounded-full bg-white/50 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-white hover:border-primary transition-all">
                  Cư dân đăng nhập
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4 border-t border-slate-200/60 max-w-lg">
              <div>
                <p className="text-2xl font-black text-slate-900">5,000+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chủ trọ tin dùng</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-2xl font-black text-slate-900">25,000+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Khách thuê active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Tòa nhà vận hành", value: "850+", icon: <Building className="h-6 w-6" /> },
              { label: "Phòng trống hiện có", value: "1,200+", icon: <HomeIcon className="h-6 w-6" /> },
              { label: "Giao dịch an toàn", value: "100%", icon: <ShieldCheck className="h-6 w-6" /> },
              { label: "Hỗ trợ 24/7", value: "Active", icon: <MessageSquare className="h-6 w-6" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-3xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-slate-900 mb-2">{stat.value}</div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20 mb-4 px-4 py-1.5 uppercase font-black tracking-widest text-xs">Tại sao chọn chúng tôi</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">
              Quản lý thông minh <br /> <span className="text-primary italic">Minh bạch & Hiệu quả</span>
            </h2>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              RentedRoom mang đến giải pháp toàn diện cho cả chủ trọ và người thuê nhà, giúp tiết kiệm thời gian và tối ưu chi phí.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "Thanh toán dễ dàng",
                desc: "Hệ thống tự động tính toán hóa đơn và hỗ trợ thanh toán qua mã QR một cách an toàn.",
                icon: <CreditCard className="h-8 w-8" />,
              },
              {
                title: "Hợp đồng minh bạch",
                desc: "Lưu trữ hợp đồng thuê nhà điện tử, dễ dàng tra cứu và đảm bảo quyền lợi pháp lý.",
                icon: <ShieldCheck className="h-8 w-8" />,
              },
              {
                title: "Báo cáo sự cố 24/7",
                desc: "Gửi yêu cầu sửa chữa và theo dõi tiến độ xử lý ngay trên ứng dụng di động.",
                icon: <Zap className="h-8 w-8" />,
              }
            ].map((feature, i) => (
              <Card key={i} className="group p-10 border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all duration-500">
                <div className="mb-8 w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-primary transition-all duration-500">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container relative z-10 mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight">Sẵn sàng để bắt đầu chưa?</h2>
          <p className="text-white/80 mb-12 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Gia nhập cùng hàng nghìn chủ nhà và khách thuê đang nâng tầm trải nghiệm sống mỗi ngày.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/login">
              <Button size="lg" variant="white" className="h-16 px-12 rounded-full font-black uppercase tracking-widest text-xs">
                Dành cho chủ trọ
              </Button>
            </Link>
            <ContactModal 
              trigger={
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-full border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-xs backdrop-blur-md">
                  Tư vấn giải pháp
                </Button>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
