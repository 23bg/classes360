"use client";

import { useEffect, useState } from "react";
import InstituteProfileView from "@/modules/institute/components/InstituteProfileView";
import InstituteProfileForm, { InstituteFormValues as InstituteFormState } from "@/modules/institute/forms/InstituteProfileForm";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchInstituteSummary } from "@/features/appInstitute/appInstituteSlice";

const emptyForm: InstituteFormState = {
    name: "",
    slug: "",
    description: "",
    phone: "",
    whatsapp: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    region: "",
    postalCode: "",
    country: "India",
    countryCode: "",
    timings: "",
    logo: "",
    banner: "",
    website: "",
    instagram: "",
    facebook: "",
    youtube: "",
    linkedin: "",
};

export default function InstitutePage() {
    const dispatch = useAppDispatch();
    const summary = useAppSelector((state) => state.appInstitute.summary.data);
    const [mode, setMode] = useState<"view" | "edit">("view");

    useEffect(() => {
        void dispatch(fetchInstituteSummary());
    }, [dispatch]);

    const form = summary?.form ?? emptyForm;
    const studentsCount = summary?.studentsCount ?? 0;
    const coursesCount = summary?.coursesCount ?? 0;

    if (mode === "edit") {
        return (
            <main className="p-6">
                <InstituteProfileForm
                    initialValues={form}
                    onCancel={() => setMode("view")}
                    onSaved={async () => {
                        await dispatch(fetchInstituteSummary()).unwrap();
                        setMode("view");
                    }}
                />
            </main>
        );
    }

    return (
        <main className="p-6">
            <InstituteProfileView
                data={{
                    name: form.name,
                    slug: form.slug,
                    description: form.description,
                    phone: form.phone,
                    address: [
                        form.addressLine1,
                        form.addressLine2,
                        form.city,
                        form.state,
                        form.region,
                        form.postalCode,
                        form.country,
                    ]
                        .filter((value) => Boolean(value && value.trim().length > 0))
                        .join(", "),
                    website: form.website,
                    logo: form.logo,
                    banner: form.banner,
                    studentsCount,
                    coursesCount,
                }}
                onEdit={() => setMode("edit")}
            />
        </main>
    );
}
