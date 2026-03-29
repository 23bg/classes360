import { BookOpen, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import PublicEnquiryForm from "@/modules/institute/components/PublicEnquiryForm";
import { DEMO_VIDEO_URL } from "@/constants/external-links";

const FALLBACK_HERO = "https://images.unsplash.com/photo-1523240795612-9a054b0db644";

export default function InstitutePublicView({ slug, institute }: any) {
    const instituteName = institute.name || "Institute";
    const heroImage = institute.heroImage || institute.banner || FALLBACK_HERO;

    const addressText = [
        institute.address?.addressLine1,
        institute.address?.city,
        institute.address?.state,
    ]
        .filter(Boolean)
        .join(", ");

    const whatsappRaw = institute.whatsapp || institute.phone || "";
    const whatsappDigits = whatsappRaw.replace(/\D/g, "");
    const whatsapp = whatsappDigits.length === 10 ? `91${whatsappDigits}` : whatsappDigits;

    const establishedYear = institute.createdAt ? new Date(institute.createdAt).getFullYear() : "N/A";
    const mode = institute.timings?.toLowerCase().includes("online") ? "Online" : "Offline";
    const website = institute.website || institute.socialLinks?.website;

    return (
        <Dialog>
            <main className="mx-auto max-w-6xl space-y-12 px-4 py-10">
                <section className="relative overflow-hidden rounded border">
                    <Image
                        src={heroImage}
                        alt="hero"
                        width={1200}
                        height={400}
                        className="h-72 w-full object-cover"
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-black/50" />

                    <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-2 text-white">
                            <h1 className="text-4xl font-bold">{instituteName}</h1>
                            <p className="text-white/80">{addressText}</p>
                            <Badge className="bg-primary text-white">Admissions Open</Badge>
                        </div>

                        <div className="flex gap-2">
                            {institute.phone && (
                                <Button asChild size="sm">
                                    <a href={`tel:${institute.phone}`}>
                                        <Phone className="mr-2 h-4 w-4" />
                                        Call
                                    </a>
                                </Button>
                            )}

                            {whatsapp && (
                                <Button asChild variant="secondary" size="sm">
                                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        WhatsApp
                                    </a>
                                </Button>
                            )}

                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    Enquiry
                                </Button>
                            </DialogTrigger>

                            <Button asChild variant="outline" size="sm">
                                <Link href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">
                                    View Demo
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 md:grid-cols-3">
                    <div className="space-y-4 md:col-span-2">
                        <h2>About Institute</h2>
                        <p className="text-muted-foreground leading-7">
                            {institute.description || "Admissions open. Contact institute for details."}
                        </p>
                    </div>

                    <div className="rounded-xl border p-5 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Established</span>
                            <span>{establishedYear}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Students</span>
                            <span>{institute.studentsCount || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Mode</span>
                            <span>{mode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">City</span>
                            <span>{institute.address?.city || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">State</span>
                            <span>{institute.address?.state || "N/A"}</span>
                        </div>
                        {website && (
                            <a href={website} target="_blank" rel="noopener noreferrer" className="block pt-2 underline">
                                Visit Website
                            </a>
                        )}
                    </div>
                </section>

                <section className="space-y-6">
                    <h2 className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Courses
                    </h2>

                    {institute.courses.length === 0 ? (
                        <div className="border rounded-xl p-6 text-center text-muted-foreground">No courses available</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {institute.courses.map((course: any) => (
                                <div key={course.id} className="rounded-xl border overflow-hidden">
                                    {course.banner && (
                                        <Image
                                            src={course.banner}
                                            alt=""
                                            width={600}
                                            height={200}
                                            className="h-40 w-full object-cover"
                                            unoptimized
                                        />
                                    )}

                                    <div className="p-5 space-y-3">
                                        <h3>{course.name}</h3>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Duration: {course.duration || "N/A"}</p>
                                            <p>Fees: {course.defaultFees ? `?${course.defaultFees}` : "N/A"}</p>
                                        </div>
                                        <DialogTrigger asChild>
                                            <Button size="sm">Enquire</Button>
                                        </DialogTrigger>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <h2 className="flex gap-2">
                        <MapPin className="h-5 w-5" />
                        Location
                    </h2>

                    <div className="border rounded-xl p-5 space-y-3">
                        <p>{addressText}</p>
                        <div className="flex gap-3">
                            {whatsapp && (
                                <Button asChild>
                                    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                                        WhatsApp
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                <section className="rounded border bg-muted/30 p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-primary">Powered by Classes360</p>
                            <h3 className="text-xl font-semibold">Run admissions and student operations with Classes360</h3>
                            <p className="text-sm text-muted-foreground">
                                Capture enquiries, manage students, and launch your institute page in minutes.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button asChild>
                                <Link href="/signup">Start Free Trial</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">
                                    View Demo
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Send Enquiry</DialogTitle>
                    <DialogDescription>
                        Share your details and the institute will contact you soon.
                    </DialogDescription>
                </DialogHeader>
                <PublicEnquiryForm slug={slug} />
            </DialogContent>
        </Dialog>
    );
}