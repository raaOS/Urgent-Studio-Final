'use client';

import { Button } from '@/components/ui/button';
import { Star, Copy } from 'lucide-react';

type CouponTicketProps = {
    onCopy: (code: string) => void;
};

export function CouponTicket({ onCopy }: CouponTicketProps) {
    const couponCode = 'ARTISANT15';
    return (
        <div className="bg-gradient-to-br from-accent/80 to-amber-500/80 p-1 rounded-2xl shadow-lg relative max-w-md mx-auto">
            <div className="bg-background rounded-xl p-6 flex items-center gap-6 relative">
                <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-background"></div>
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-background"></div>
                <div className="flex-shrink-0 text-amber-500">
                    <Star className="w-16 h-16" fill="currentColor"/>
                </div>
                <div className="border-l-2 border-dashed border-amber-500/50 pl-6 flex-grow">
                    <h3 className="text-lg font-bold text-gray-800">Diskon Spesial!</h3>
                    <p className="text-gray-600 mb-2">Gunakan kode di bawah ini untuk diskon 15%</p>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/50 border border-amber-500/50">
                        <span className="font-code text-amber-700 font-bold text-lg flex-grow">{couponCode}</span>
                        <Button size="sm" variant="ghost" className="text-amber-700 hover:bg-amber-200" onClick={() => onCopy(couponCode)}>
                            <Copy className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
