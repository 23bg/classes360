import { BookOpenText, GraduationCap, School, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

export default function UseCases() {
    const t = useTranslations("useCasesSection");
    const useCases = [
        { title: t("item1Title"), description: t("item1Description"), icon: GraduationCap },
        { title: t("item2Title"), description: t("item2Description"), icon: School },
        { title: t("item3Title"), description: t("item3Description"), icon: BookOpenText },
        { title: t("item4Title"), description: t("item4Description"), icon: Users },
    ];

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">{t("title")}</h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {useCases.map((useCase) => {
                        const Icon = useCase.icon;
                        return (
                            <Card key={useCase.title} className="border-border bg-card h-full">
                                <CardContent className="p-4 md:p-6 flex flex-col gap-2 h-full">
                                    <Icon className="h-5 w-5 text-primary mb-2" aria-hidden />
                                    <h3 className="text-base md:text-lg font-medium text-foreground">{useCase.title}</h3>
                                    <p className="text-sm text-muted-foreground">{useCase.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
