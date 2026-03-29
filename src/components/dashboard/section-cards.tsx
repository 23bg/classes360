import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionCards() {
    const cardsData = [
        { label: "Leads This Month", value: "—" },
        { label: "Admissions This Month", value: "—" },
        { label: "Total Students", value: "—" },
        { label: "Conversion", value: "—" },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {cardsData.map((card, index) => (
                <Card key={index} className="@container/card">
                    <CardHeader>
                        <CardDescription>{card.label}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {card.value}
                        </CardTitle>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}

