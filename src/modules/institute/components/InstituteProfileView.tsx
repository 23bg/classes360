import { Button } from "@/components/ui/button";
import Image from "next/image";

type InstituteOverview = {
    name: string;
    slug: string;
    description: string;
    phone: string;
    address: string;
    website: string;
    logo: string;
    banner: string;
    coursesCount: number;
    studentsCount: number;
};

type InstituteProfileViewProps = {
    data: InstituteOverview;
    onEdit: () => void;
};

export default function InstituteProfileView({ data, onEdit }: InstituteProfileViewProps) {
    const initials = (data.name || "I").slice(0, 1).toUpperCase();

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className=" text-2xl font-semibold">{data.name || "Institute Profile"}</h1>
                    <p className="text-sm text-muted-foreground mt-1">Public slug: /i/{data.slug || "your-slug"}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onEdit}>Edit Profile</Button>
                    <Button asChild>
                        <a href={`/i/${data.slug}`} target="_blank" rel="noreferrer">Public Page</a>
                    </Button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[80px_1fr]">
                <div>
                    {data.logo ? (
                        <Image
                            src={data.logo}
                            alt="Institute logo"
                            width={64}
                            height={64}
                            unoptimized
                            className="h-16 w-16 rounded-xl border object-cover"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-xl border bg-linear-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/20 flex items-center justify-center text-lg font-semibold">
                            {initials}
                        </div>
                    )}
                </div>
                <div>
                    {data.banner ? (
                        <Image
                            src={data.banner}
                            alt="Institute banner"
                            width={1200}
                            height={160}
                            unoptimized
                            className="h-16 w-full rounded-xl border object-cover"
                        />
                    ) : (
                        <div className="h-16 w-full rounded-xl border bg-linear-to-r from-indigo-500/20 via-violet-500/20 to-sky-500/20" />
                    )}
                </div>
            </div>

            <div className="rounded-lg border p-4 grid gap-3 md:grid-cols-2">
                <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{data.description || "-"}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{data.phone || "-"}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm">{data.address || "-"}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Website</p>
                    <p className="text-sm break-all">{data.website || "-"}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Courses Count</p>
                    <p className="text-sm font-medium">{data.coursesCount}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Students Count</p>
                    <p className="text-sm font-medium">{data.studentsCount}</p>
                </div>
            </div>
        </div>
    );
}
