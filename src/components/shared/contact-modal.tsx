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
import { Phone, MessageCircle, Send } from "lucide-react";

interface ContactModalProps {
  trigger?: React.ReactNode;
}

export function ContactModal({ trigger }: ContactModalProps) {
  const contactLinks = [
    {
      name: "Gọi điện",
      icon: <Phone className="h-5 w-5" />,
      href: "tel:0901234567",
      color: "bg-green-500 hover:bg-green-600",
      description: "0901 234 567"
    },
    {
      name: "Zalo",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "https://zalo.me/0901234567",
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Nhắn tin qua Zalo"
    },
    {
      name: "Messenger",
      icon: <Send className="h-5 w-5" />,
      href: "https://m.me/yourpage",
      color: "bg-indigo-500 hover:bg-indigo-600",
      description: "Nhắn tin qua Messenger"
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="rounded-full shadow-lg">
            Liên hệ ngay
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-2">Kết nối với chúng tôi</DialogTitle>
          <DialogDescription className="text-center">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Chọn phương thức phù hợp nhất với bạn.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {contactLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center p-4 rounded-xl text-white transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-xl ${link.color}`}
            >
              <div className="bg-white/20 p-2 rounded-lg mr-4">
                {link.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold">{link.name}</div>
                <div className="text-xs opacity-90">{link.description}</div>
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
