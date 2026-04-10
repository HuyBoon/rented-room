'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Gửi tin nhắn thành công!", {
        description: "Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ tới.",
      });
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-slate-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto relative z-10 text-center max-w-4xl">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary animate-in fade-in slide-in-from-top-4 duration-700">
            Kết nối với chúng tôi
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-top-8 duration-700 delay-100">
            Chúng tôi luôn lắng nghe <br />
            <span className="text-primary italic">mọi thắc mắc của bạn</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-0 font-medium leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-top-8 duration-700 delay-200">
            Hãy để lại lời nhắn, đội ngũ của chúng tôi sẽ liên hệ lại ngay để hỗ trợ bạn giải quyết mọi vấn đề.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Contact Info Column */}
            <div className="lg:col-span-5 space-y-12 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thông tin liên hệ</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">
                  Bạn có thể ghé thăm văn phòng hoặc liên hệ trực tiếp qua các kênh bên dưới.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  {
                    icon: <MapPin className="h-6 w-6" />,
                    title: "Địa chỉ văn phòng",
                    content: "Khu Công nghệ cao, Quận 9, TP. Hồ Chí Minh",
                  },
                  {
                    icon: <Phone className="h-6 w-6" />,
                    title: "Hotline hỗ trợ",
                    content: "1900 1234 (8:00 - 21:00)",
                  },
                  {
                    icon: <Mail className="h-6 w-6" />,
                    title: "Email công việc",
                    content: "contact@huyboon.rentals",
                  },
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: "Thời gian làm việc",
                    content: "Thứ 2 - Thứ 7: 08:30 - 18:00",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-1">{item.title}</h4>
                      <p className="text-slate-900 font-bold text-lg">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Theo dõi chúng tôi</h4>
                <div className="flex gap-4">
                  {[
                    { icon: <Facebook className="h-5 w-5" />, href: "#" },
                    { icon: <Twitter className="h-5 w-5" />, href: "#" },
                    { icon: <Instagram className="h-5 w-5" />, href: "#" },
                    { icon: <Linkedin className="h-5 w-5" />, href: "#" },
                  ].map((social, i) => (
                    <a 
                      key={i} 
                      href={social.href} 
                      className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-700">
              <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                <CardContent className="p-8 md:p-12">
                  {isSuccess ? (
                    <div className="text-center py-20 space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-brand-green/10 text-brand-green mb-4">
                        <CheckCircle2 className="h-12 w-12" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-900">Cảm ơn bạn đã liên hệ!</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        Tin nhắn của bạn đã được gửi thành công. Đội ngũ hỗ trợ sẽ phản hồi sớm nhất có thể.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsSuccess(false)}
                        className="rounded-full px-8"
                      >
                        Gửi tin nhắn khác
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Họ và tên</Label>
                          <Input 
                            id="name" 
                            placeholder="Nguyễn Văn A" 
                            required 
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all px-6"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email liên hệ</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="email@vidu.com" 
                            required 
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all px-6"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Chủ đề thắc mắc</Label>
                        <Input 
                          id="subject" 
                          placeholder="Ví dụ: Tư vấn gói Chuyên nghiệp" 
                          required 
                          className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all px-6"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nội dung chi tiết</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Nhập nội dung bạn muốn chia sẻ với chúng tôi..." 
                          required 
                          className="min-h-[180px] rounded-3xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all px-6 py-4 resize-none"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Đang xử lý...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Gửi tin nhắn ngay
                            <Send className="h-4 w-4" />
                          </div>
                        )}
                      </Button>
                      
                      <p className="text-center text-slate-400 text-[10px] font-medium px-8">
                        Bằng cách gửi tin nhắn này, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map or Secondary Info Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 text-center">
            <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Ghé thăm văn phòng của chúng tôi?</h3>
            <p className="text-slate-500 font-medium mb-10 max-w-xl mx-auto">
                Văn phòng của chúng tôi nằm tại trung tâm công nghệ của thành phố, luôn chào đón bạn ghé thăm để trao đổi kỹ hơn.
            </p>
            <div className="aspect-[21/9] w-full max-w-5xl mx-auto rounded-[3rem] bg-slate-200 overflow-hidden shadow-inner relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-slate-400 flex flex-col items-center gap-4 transition-transform group-hover:scale-110 duration-700">
                        <MapPin className="h-12 w-12 opacity-50" />
                        <span className="font-black uppercase tracking-[0.2em] text-xs">Interactive Map Placeholder</span>
                    </div>
                </div>
                {/* Simulated Google Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 opacity-50" />
            </div>
        </div>
      </section>
    </div>
  );
}
