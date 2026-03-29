import { ShieldCheck, Building2, CreditCard, MessageSquareQuote } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Trust() {
    const t = useTranslations("trust");
    const items = [
        { icon: Building2, label: t("item1") },
        { icon: CreditCard, label: t("item2") },
        { icon: ShieldCheck, label: t("item3") },
        { icon: MessageSquareQuote, label: t("item4") },
    ];

    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {items.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 rounded-lg border p-4 text-sm font-medium">
                            <Icon className="h-4 w-4" />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

