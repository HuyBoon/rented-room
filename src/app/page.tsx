'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
  MessageSquare
} from "lucide-react";
import { ContactModal } from "@/components/shared/contact-modal";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/Users/huyboon/.gemini/antigravity/brain/635015fa-ae8f-41a0-82bc-74706dba320c/modern_apartment_hero_1775785873719.png" 
            alt="Modern Apartment" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-950/80 z-10" />
        </div>

        {/* Content */}
        <div className="container relative z-20 mx-auto px-4 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs md:text-sm font-medium animate-fade-in-up">
            🚀 Giải pháp quản lý phòng trọ thế hệ mới
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight animate-fade-in-up transition-all" style={{ animationDelay: '100ms' }}>
            Quản lý thông minh<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Nâng tầm giá trị</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Hệ thống quản lý phòng trọ hiện đại, tự động hóa quy trình, tối ưu doanh thu và mang lại sự hài lòng tuyệt đối cho khách thuê.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link href="/view-room" className="group">
              <Button size="lg" className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xl hover:shadow-indigo-500/20 transition-all">
                <HomeIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Xem phòng ngay
              </Button>
            </Link>
            <Link href="/login" className="group">
              <Button size="lg" variant="outline" className="h-14 px-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all">
                <LogIn className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Dành cho chủ trọ
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1">
            <div className="w-1 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Tòa nhà", value: "500+", icon: <Building className="h-6 w-6 text-indigo-500" /> },
              { label: "Phòng trọ", value: "10,000+", icon: <HomeIcon className="h-6 w-6 text-cyan-500" /> },
              { label: "Khách thuê", value: "25,000+", icon: <Users className="h-6 w-6 text-purple-500" /> },
              { label: "Giao dịch/tháng", value: "5B+", icon: <CreditCard className="h-6 w-6 text-emerald-500" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-3">Tính năng nổi bật</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Mọi thứ bạn cần để quản lý tốt hơn</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Chúng tôi cung cấp đầy đủ các công cụ để bạn có thể vận hành chuỗi phòng trọ một cách chuyên nghiệp nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Quản lý Hợp đồng",
                desc: "Tạo và quản lý hợp đồng thuê nhà điện tử minh bạch, lưu trữ trọn đời.",
                icon: <ShieldCheck className="h-6 w-6" />,
                color: "indigo"
              },
              {
                title: "Thu tiền tự động",
                desc: "Hệ thống tự động tính toán hóa đơn, chỉ số điện nước và gửi thông báo cho khách.",
                icon: <Zap className="h-6 w-6" />,
                color: "amber"
              },
              {
                title: "Báo cáo doanh thu",
                desc: "Biểu đồ trực quan giúp bạn nắm bắt tình hình tài chính mọi lúc mọi nơi.",
                icon: <BarChart3 className="h-6 w-6" />,
                color: "emerald"
              },
              {
                title: "Hỗ trợ di động",
                desc: "Quản lý ngay trên điện thoại với giao diện responsive mượt mà.",
                icon: <Smartphone className="h-6 w-6" />,
                color: "blue"
              },
              {
                title: "Báo cáo sự cố",
                desc: "Hệ thống tiếp nhận và theo dõi xử lý sự cố từ khách thuê nhanh chóng.",
                icon: <MessageSquare className="h-6 w-6" />,
                color: "rose"
              },
              {
                title: "Quản lý tòa nhà",
                desc: "Phân bổ phòng, tầng và quản lý nhiều cơ sở kinh doanh trên cùng một nền tảng.",
                icon: <Building className="h-6 w-6" />,
                color: "cyan"
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:border-indigo-500/50 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {feature.desc}
                </p>
                <div className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                  Tìm hiểu thêm <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 z-0" />
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Sẵn sàng để bắt đầu công việc kinh doanh?</h2>
          <p className="text-indigo-100 mb-10 text-lg max-w-2xl mx-auto">
            Gia nhập cùng 5,000+ chủ trọ khắp cả nước đang sử dụng RentedRoom để tối ưu công việc kinh doanh của họ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 bg-white text-indigo-600 hover:bg-slate-50 font-bold rounded-xl shadow-lg border-0">
                Đăng ký ngay
              </Button>
            </Link>
            <ContactModal 
              trigger={
                <Button size="lg" variant="outline" className="h-14 px-10 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl backdrop-blur-sm">
                  Liên hệ tư vấn
                </Button>
              }
            />
          </div>
        </div>
      </section>
      
      <style jsx global>{`
        @keyframes slow-zoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
