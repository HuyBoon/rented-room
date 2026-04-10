'use client';

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Send, Globe, ChevronRight } from "lucide-react";

interface ContactModalProps {
  trigger?: React.ReactNode;
}

export function ContactModal({ trigger }: ContactModalProps) {
  const contactLinks = [
    {
      name: "Hotline Tư vấn 24/7",
      icon: <Phone className="h-5 w-5" />,
      href: "tel:0901234567",
      color: "bg-primary text-white hover:shadow-lg hover:shadow-primary/20",
      description: "0901 234 567"
    },
    {
      name: "Nhắn tin qua Zalo",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "https://zalo.me/0901234567",
      color: "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary",
      description: "@rentedroom_support"
    },
    {
      name: "Facebook Messenger",
      icon: <Send className="h-5 w-5" />,
      href: "https://m.me/yourpage",
      color: "bg-white border border-slate-200 text-slate-700 hover:border-primary hover:text-primary",
      description: "Hỗ trợ trực tuyến"
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="rounded-2xl shadow-lg">
            Liên hệ ngay
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-0 shadow-3xl text-slate-900 rounded-[2.5rem] p-8">
        <DialogHeader className="mb-8">
          <div className="flex items-center gap-3 text-primary mb-4">
             <div className="h-px w-8 bg-primary/30" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em]">Hotline hỗ trợ</p>
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight">KẾT NỐI <span className="text-primary italic">HỖ TRỢ</span></DialogTitle>
          <DialogDescription className="text-slate-500 font-medium mt-4 leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về dịch vụ thuê phòng.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {contactLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center p-6 rounded-2xl transition-all duration-300 transform group ${link.color}`}
            >
              <div className="bg-primary/5 p-3 rounded-xl mr-5 group-hover:bg-primary/10 transition-colors">
                {link.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm mb-1">{link.name}</div>
                <div className="text-[10px] font-bold uppercase opacity-60 tracking-widest">{link.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </a>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phục vụ tận tâm // Uy tín hàng đầu</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
