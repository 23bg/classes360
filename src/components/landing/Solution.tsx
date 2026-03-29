import { useTranslations } from "next-intl";

export default function Solution() {
    const t = useTranslations("solution");
    const solutions = [t("item1"), t("item2"), t("item3"), t("item4"), t("item5")];

    return (
        <section className="w-full border-b ">
            <div className="mx-auto w-full max-w-7xl px-4 py-14 md:px-6">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h2>
                <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {solutions.map((item) => (
                        <li key={item} className="rounded-lg border p-4 text-muted-foreground">
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

