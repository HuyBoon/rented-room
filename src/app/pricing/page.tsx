'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  Building2, 
  Users2, 
  ShieldCheck, 
  MessageCircle,
  ArrowRight
} from "lucide-react";

const pricingTiers = [
  {
    name: "Phổ thông",
    id: "tier-basic",
    href: "/dang-ky",
    price: "299.000đ",
    description: "Giải pháp hoàn hảo cho chủ nhà có dưới 5 phòng trọ.",
    features: [
      "Quản lý tối đa 5 phòng",
      "Tính toán hóa đơn tự động",
      "Gửi hóa đơn qua Zalo/Email",
      "Quản lý hợp đồng cơ bản",
      "Hỗ trợ qua trung tâm trợ giúp",
    ],
    mostPopular: false,
    icon: <Users2 className="h-6 w-6" />,
  },
  {
    name: "Chuyên nghiệp",
    id: "tier-pro",
    href: "/dang-ky",
    price: "799.000đ",
    description: "Dành cho các dãy trọ lớn và mini-apartment chuyên nghiệp.",
    features: [
      "Quản lý tối đa 50 phòng",
      "Tất cả tính năng bản Phổ thông",
      "Thu tiền qua mã QR tự động",
      "Thông báo nhắc nợ tự động",
      "Báo cáo doanh thu & chi phí",
      "Hỗ trợ ưu tiên 24/7",
    ],
    mostPopular: true,
    icon: <Zap className="h-6 w-6" />,
  },
  {
    name: "Doanh nghiệp",
    id: "tier-enterprise",
    href: "/contact",
    price: "Liên hệ",
    description: "Giải pháp tùy chỉnh cho các đơn vị vận hành chuỗi căn hộ.",
    features: [
      "Không giới hạn số phòng",
      "Tất cả tính năng bản Chuyên nghiệp",
      "Tùy chỉnh thương hiệu riêng",
      "Phân quyền nhân viên quản lý",
      "API tích hợp hệ thống riêng",
      "Quản lý đa chi nhánh",
    ],
    mostPopular: false,
    icon: <Building2 className="h-6 w-6" />,
  },
];

const faqs = [
  {
    question: "Tôi có thể thay đổi gói dịch vụ sau khi đã đăng ký không?",
    answer: "Hoàn toàn được. Bạn có thể nâng cấp hoặc hạ cấp gói dịch vụ bất kỳ lúc nào. Chi phí sẽ được tính toán lại dựa trên thời gian sử dụng thực tế của bạn.",
  },
  {
    question: "Có giới hạn số lượng ảnh tải lên cho mỗi phòng không?",
    answer: "Với gói Chuyên nghiệp và Doanh nghiệp, chúng tôi không giới hạn số lượng ảnh. Gói Phổ thông hỗ trợ tối đa 5 ảnh cho mỗi phòng.",
  },
  {
    question: "Dữ liệu của tôi có được an toàn không?",
    answer: "Chúng tôi sử dụng công nghệ mã hóa SSL và sao lưu dữ liệu hàng ngày trên hệ thống đám mây bảo mật. Quyền riêng tư của bạn và khách thuê là ưu tiên hàng đầu của chúng tôi.",
  },
  {
    question: "Hệ thống có hỗ trợ in hóa đơn tại chỗ không?",
    answer: "Có, hệ thống hỗ trợ xuất file PDF chuẩn in ấn để bạn có thể in ra giấy nếu khách thuê có nhu cầu nhận hóa đơn vật lý.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/4 w-[1000px] h-[1000px] bg-brand-green/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
            Minh bạch & Linh hoạt
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Gói dịch vụ phù hợp với <br />
            <span className="text-primary italic">mọi nhu cầu quản lý</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-0 font-medium leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Chọn một kế hoạch phù hợp với quy mô kinh doanh của bạn. Bắt đầu ngay hôm nay để tối ưu hóa quy trình vận hành.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={tier.id} 
                className={`flex flex-col relative overflow-hidden h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-slate-100 ${
                  tier.mostPopular ? 'ring-2 ring-primary shadow-xl scale-105 z-10' : 'shadow-md'
                } animate-in fade-in slide-in-from-bottom-12 duration-700`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {tier.mostPopular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-10 py-1.5 transform rotate-45 translate-x-3 translate-y-3">
                      Phổ biến nhất
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-8 pt-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                    tier.mostPopular ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900">{tier.name}</CardTitle>
                  <CardDescription className="text-slate-500 font-medium min-h-[40px] mt-2">
                    {tier.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1 pb-10">
                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                    {tier.price !== "Liên hệ" && <span className="text-slate-400 font-bold ml-2">/tháng</span>}
                  </div>
                  
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start text-slate-600 font-medium text-sm">
                        <CheckCircle2 className="h-5 w-5 text-brand-green mr-3 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-0 pb-10 px-8">
                  <Link href={tier.href} className="w-full">
                    <Button 
                      variant={tier.mostPopular ? "default" : "outline"} 
                      className={`w-full h-14 rounded-xl font-black uppercase tracking-widest text-xs ${
                        tier.mostPopular ? 'shadow-lg shadow-primary/20' : ''
                      }`}
                    >
                      {tier.name === "Doanh nghiệp" ? "Yêu cầu tư vấn" : "Bắt đầu sử dụng"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Cam kết bảo mật <br /> 
                <span className="text-primary">& An tâm vận hành</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed">
                Chúng tôi không chỉ cung cấp công cụ quản lý, chúng tôi cung cấp sự an tâm cho doanh nghiệp của bạn với các tiêu chuẩn khắt khe nhất.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <ShieldCheck className="h-6 w-6 text-brand-green shrink-0" />
                  <div>
                    <h4 className="font-black text-white mb-1 uppercase tracking-widest text-[10px]">Tối mật</h4>
                    <p className="text-sm text-slate-400">Mã hóa AES-256 nội dung nhạy cảm.</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <Zap className="h-6 w-6 text-brand-yellow shrink-0" />
                  <div>
                    <h4 className="font-black text-white mb-1 uppercase tracking-widest text-[10px]">Tốc độ</h4>
                    <p className="text-sm text-slate-400">Tốc độ truy xuất nhanh dưới 100ms.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-brand-green/20 border border-white/10 flex items-center justify-center p-12">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white text-primary mb-4 shadow-2xl">
                    <MessageCircle className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-black">Cần hỗ trợ riêng biệt?</h3>
                  <p className="text-slate-400 font-medium">Chúng tôi luôn sẵn sàng lắng nghe các yêu cầu cụ thể từ quy trình của bạn.</p>
                  <Link href="/contact" className="inline-block">
                    <Button variant="outline" className="h-14 px-10 rounded-full border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all font-black uppercase tracking-widest text-xs">
                      Liên hệ đội ngũ sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Câu hỏi thường gặp</h2>
            <p className="text-slate-500 text-lg font-medium">Mọi thứ bạn cần biết về chính sách và thanh toán.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all duration-300 bg-slate-50/30 hover:bg-white hover:shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-4">
                  <HelpCircle className="h-6 w-6 text-primary shrink-0 opacity-50" />
                  <div>
                    <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{faq.question}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center text-slate-400 font-medium">
            Vẫn còn thắc mắc? <Link href="/contact" className="text-primary font-black underline underline-offset-4 hover:text-primary/80 transition-colors">Gửi tin nhắn cho chúng tôi</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
