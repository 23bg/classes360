import { BookOpen, Clock3, GraduationCap, MapPin, MessageCircle, Phone, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import PublicEnquiryForm from "@/modules/institute/components/PublicEnquiryForm";
import {
    courseRouteSlug,
    formatFees,
    getInstituteAddress,
    getWhatsAppUrl,
    instituteRoute,
    STUDENT_PORTAL_URL,
    type InstituteBatch,
    type InstituteCourse,
    type InstitutePublicData,
    type InstituteTeacher,
} from "@/app/i/[slug]/_lib/public-institute";

const FALLBACK_HERO = "https://images.unsplash.com/photo-1523240795612-9a054b0db644";

type InstitutePageShellProps = {
    slug: string;
    institute: InstitutePublicData;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
};

export function InstitutePageShell({ slug, institute, title, subtitle, children }: InstitutePageShellProps) {
    const links = [
        { label: "Home", href: instituteRoute.home(slug) },
        { label: "Courses", href: instituteRoute.courses(slug) },
        { label: "Faculty", href: instituteRoute.faculty(slug) },
        { label: "Announcements", href: instituteRoute.announcements(slug) },
        { label: "Contact", href: instituteRoute.contact(slug) },
        { label: "Student", href: instituteRoute.student(slug) },
    ];

    return (
        <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 md:py-10">
            <header className="rounded border bg-card p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-muted-foreground">Institute Website</p>
                        <h1 className="text-2xl font-semibold">{institute.name || "Institute"}</h1>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <a href={STUDENT_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                            Student Login
                        </a>
                    </Button>
                </div>

                <Separator className="my-4" />

                <nav className="flex flex-wrap gap-2">
                    {links.map((link) => (
                        <Button key={link.href} asChild variant="secondary" size="sm">
                            <Link href={link.href}>{link.label}</Link>
                        </Button>
                    ))}
                </nav>
            </header>

            <section className="space-y-2">
                <h2 className="text-2xl font-semibold">{title}</h2>
                {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </section>

            {children}

            <footer className="rounded-xl border bg-muted/30 p-5 text-sm text-muted-foreground">
                Powered by Classes360
            </footer>
        </main>
    );
}

type HeroSectionProps = {
    slug: string;
    institute: InstitutePublicData;
};

export function InstituteHeroSection({ slug, institute }: HeroSectionProps) {
    const heroImage = institute.heroImage || institute.banner || FALLBACK_HERO;
    const addressText = getInstituteAddress(institute);
    const whatsappUrl = getWhatsAppUrl(institute);

    return (
        <Dialog>
            <section className="relative overflow-hidden rounded border">
                <Image
                    src={heroImage}
                    alt={institute.name || "Institute"}
                    width={1400}
                    height={480}
                    className="h-[300px] w-full object-cover md:h-[420px]"
                    unoptimized
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-x-0 bottom-0 space-y-4 p-5 text-white md:p-8">
                    <div className="space-y-2">
                        <Badge className="bg-white/15 text-white">Admissions Open</Badge>
                        <h2 className="text-3xl font-bold md:text-4xl">{institute.name || "Institute"}</h2>
                        <p className="text-sm text-white/80 md:text-base">{addressText || "India"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
                        {institute.phone ? (
                            <Button asChild className="justify-start bg-white text-black hover:bg-white/90">
                                <a href={`tel:${institute.phone}`}>
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call
                                </a>
                            </Button>
                        ) : null}

                        {whatsappUrl ? (
                            <Button asChild variant="secondary" className="justify-start">
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </a>
                            </Button>
                        ) : null}

                        <DialogTrigger asChild>
                            <Button variant="outline" className="justify-start border-white/50 bg-transparent text-white hover:bg-white/10">
                                Enquiry
                            </Button>
                        </DialogTrigger>

                        <Button asChild variant="outline" className="justify-start border-white/50 bg-transparent text-white hover:bg-white/10">
                            <Link href={instituteRoute.student(slug)}>Student Login</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Send Enquiry</DialogTitle>
                    <DialogDescription>Share your details and the institute team will contact you.</DialogDescription>
                </DialogHeader>
                <PublicEnquiryForm slug={slug} />
            </DialogContent>
        </Dialog>
    );
}

type CoursesGridProps = {
    slug: string;
    courses: InstituteCourse[];
    maxItems?: number;
    showDescription?: boolean;
};

export function CoursesGrid({ slug, courses, maxItems, showDescription = true }: CoursesGridProps) {
    const visible = maxItems ? courses.slice(0, maxItems) : courses;

    if (!visible.length) {
        return <Card><CardContent className="pt-6 text-sm text-muted-foreground">No courses available yet.</CardContent></Card>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((course) => (
                <Card key={course.id}>
                    <CardHeader>
                        <CardTitle>{course.name}</CardTitle>
                        {showDescription ? (
                            <CardDescription className="line-clamp-2">
                                {course.description || "Course details are available on the detail page."}
                            </CardDescription>
                        ) : null}
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4" />
                            Duration: {course.duration || "N/A"}
                        </p>
                        <p className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Fees: {formatFees(course.defaultFees)}
                        </p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button size="sm">Enquiry</Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Enquire for {course.name}</DialogTitle>
                                    <DialogDescription>Fill in your details and we will get in touch.</DialogDescription>
                                </DialogHeader>
                                <PublicEnquiryForm slug={slug} />
                            </DialogContent>
                        </Dialog>
                        <Button asChild variant="outline" size="sm">
                            <Link href={instituteRoute.course(slug, courseRouteSlug(course))}>View details</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

type FacultyGridProps = {
    teachers: InstituteTeacher[];
    maxItems?: number;
};

export function FacultyGrid({ teachers, maxItems }: FacultyGridProps) {
    const visible = maxItems ? teachers.slice(0, maxItems) : teachers;

    if (!visible.length) {
        return <Card><CardContent className="pt-6 text-sm text-muted-foreground">Faculty details will be published soon.</CardContent></Card>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((teacher) => (
                <Card key={teacher.id}>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <Avatar className="size-12 border">
                            <AvatarFallback>{(teacher.name || "T").slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <CardTitle className="text-base">{teacher.name}</CardTitle>
                            <CardDescription>{teacher.subject || "Faculty"}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Experience: {teacher.experience ? "Experienced" : "Available"}
                        </p>
                        <p>{teacher.experience || "Subject expert guiding students with practical teaching methods."}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

type LocationBlockProps = {
    institute: InstitutePublicData;
};

export function LocationBlock({ institute }: LocationBlockProps) {
    const address = getInstituteAddress(institute);
    const mapQuery = encodeURIComponent(address || institute.name || "Institute");

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                </CardTitle>
                <CardDescription>{address || "Address will be updated soon."}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border">
                    <iframe
                        title="Institute map"
                        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                        className="h-72 w-full"
                        loading="lazy"
                    />
                </div>
            </CardContent>
        </Card>
    );
}

type BatchTimingsProps = {
    batches: InstituteBatch[];
};

export function BatchTimings({ batches }: BatchTimingsProps) {
    if (!batches.length) {
        return <p className="text-sm text-muted-foreground">Batch timings will be shared during counselling.</p>;
    }

    return (
        <ul className="space-y-2 text-sm text-muted-foreground">
            {batches.slice(0, 8).map((batch) => (
                <li key={batch.id} className="rounded-md border p-3">
                    <p className="font-medium text-foreground">{batch.name}</p>
                    <p>{batch.schedule || "Schedule will be shared by institute"}</p>
                </li>
            ))}
        </ul>
    );
}

type EnquirySectionProps = {
    slug: string;
};

export function EnquirySection({ slug }: EnquirySectionProps) {
    return (
        <section className="space-y-3">
            <h3 className="text-xl font-semibold">Contact / Enquiry</h3>
            <PublicEnquiryForm slug={slug} />
        </section>
    );
}

type StudentPortalCardProps = {
    title?: string;
    description?: string;
};

export function StudentPortalCard({
    title = "Student Portal",
    description = "Login to access your classes and updates.",
}: StudentPortalCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <a href={STUDENT_PORTAL_URL} target="_blank" rel="noopener noreferrer">
                        Student Login
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}
