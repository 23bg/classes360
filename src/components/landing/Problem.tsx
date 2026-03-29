import { Card, CardContent } from "@/components/ui/card";

export default function Problem() {
    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <div className="max-w-2xl space-y-4">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                        Stop managing admissions across WhatsApp, Excel, and notebooks.
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Replace fragmented workflows with one structured system that your full team can follow.
                    </p>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-border bg-muted/80">
                        <CardContent className="p-4 md:p-6 opacity-80">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Before</p>
                            <h3 className="mt-2 text-base md:text-lg font-medium text-foreground">WhatsApp + Excel</h3>
                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <li>• Follow-ups scattered across personal chats</li>
                                <li>• Duplicate entries in multiple sheets</li>
                                <li>• No clear ownership between counselors</li>
                                <li>• Enquiries lost during peak admission months</li>
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="border-border bg-card">
                        <CardContent className="p-4 md:p-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">After</p>
                            <h3 className="mt-2 text-base md:text-lg font-medium text-foreground">Classes360 System</h3>
                            <ul className="mt-4 space-y-2 text-sm text-foreground">
                                <li>• Every enquiry captured in one pipeline</li>
                                <li>• Follow-ups assigned with clear accountability</li>
                                <li>• Team-level visibility across each stage</li>
                                <li>• Admission outcomes tracked end-to-end</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

