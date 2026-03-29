import { Database, ShieldCheck, WalletCards, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const trustItems = [
    { icon: XCircle, text: "No commission" },
    { icon: WalletCards, text: "Cancel anytime" },
    { icon: ShieldCheck, text: "Secure payments" },
    { icon: Database, text: "Data ownership" },
];

type TrustBarProps = {
    compact?: boolean;
};

export default function TrustBar({ compact = false }: TrustBarProps) {
    return (
        <div className={compact ? "w-full border-b bg-background py-6" : "w-full border-b bg-background py-8 md:py-12"}>
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {trustItems.map(({ icon: Icon, text }) => (
                        <Card key={text} className="border-border bg-card h-full">
                            <CardContent className="p-4 flex items-center gap-2 h-full">
                                <Icon className="h-5 w-5 text-primary" aria-hidden />
                                <span className="text-sm font-medium text-foreground">{text}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
