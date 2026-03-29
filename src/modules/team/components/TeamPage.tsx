"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TeamForm, { TeamFormValues as TeamFormState } from "@/modules/team/forms/TeamForm";
import TeamTable, { TeamRow } from "@/modules/team/components/TeamTable";
import ListWidget from "@/components/custom/ListWidget";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { deleteTeamMember, fetchTeamData, saveTeamMember } from "@/features/appTeam/appTeamSlice";

const emptyForm: TeamFormState = {
    name: "",
    phone: "",
    email: "",
    role: "MANAGER",
    active: true,
    subjects: "",
    experience: "",
    bio: "",
};

export default function TeamPage() {
    const dispatch = useAppDispatch();
    const rows = useAppSelector((state) => state.appTeam.data);
    const sessionRole = useAppSelector((state) => state.appTeam.sessionRole);
    const loading = useAppSelector((state) => state.appTeam.loading);
    const saving = useAppSelector((state) => state.appTeam.mutationLoading);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<TeamRow | null>(null);
    const [form, setForm] = useState<TeamFormState>(emptyForm);

    useEffect(() => {
        void dispatch(fetchTeamData());
    }, [dispatch]);

    const canManage = useMemo(() => sessionRole === "OWNER", [sessionRole]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpen(true);
    };

    const openEdit = (member: TeamRow) => {
        setEditing(member);
        setForm({
            name: member.name,
            phone: member.phone,
            email: member.email,
            role: member.role,
            active: member.active,
            subjects: member.subjects ?? "",
            experience: member.experience ?? "",
            bio: member.bio ?? "",
        });
        setOpen(true);
    };

    const save = async (values: TeamFormState) => {
        try {
            await dispatch(saveTeamMember({ values, editing })).unwrap();
            toast.success(editing ? "Team member updated" : "Team member created");
            setOpen(false);
            await dispatch(fetchTeamData()).unwrap();
        } catch (error: any) {
            const apiErrorCode = error?.response?.data?.error?.code;
            if (apiErrorCode === "PLAN_USER_LIMIT_REACHED") {
                toast.error("User limit reached for your current plan. Upgrade billing to add more users.", {
                    action: {
                        label: "Upgrade",
                        onClick: () => {
                            window.location.href = "/billing";
                        },
                    },
                });
            } else {
                toast.error(error?.response?.data?.error?.message ?? "Failed to save member");
            }
        }
    };

    const remove = async (member: TeamRow) => {
        try {
            await dispatch(deleteTeamMember(member)).unwrap();
            toast.success("Team member removed");
            await dispatch(fetchTeamData()).unwrap();
        } catch (error: any) {
            toast.error(error?.response?.data?.error?.message ?? "Failed to remove member");
        }
    };

    return (
        <>
            <ListWidget
                title="Team"
                description="Manage owners, managers, counselors, teachers, and viewers."
                loading={loading}
                isEmpty={!loading && rows.length === 0}
                emptyMessage="No team members found."
                actions={canManage ? <Button onClick={openCreate}>Add Team Member</Button> : null}
            >
                <div className="space-y-4 px-6 py-4">
                    <div className="rounded border p-3 text-sm">
                        <p className="mb-2 font-medium">Role Access</p>
                        <p><span className="font-medium">OWNER</span> - Full control over team, data, and billing.</p>
                        <p><span className="font-medium">EDITOR</span> - Manage leads, students, courses, batches, and fees.</p>
                        <p><span className="font-medium">VIEWER</span> - Read-only access.</p>
                        <p className="mt-2 text-muted-foreground">Need more seats? Upgrade from <Link href="/billing" className="underline">Billing</Link>.</p>
                    </div>

                    <TeamTable rows={rows} canManage={canManage} onEdit={openEdit} onDelete={remove} />
                </div>
            </ListWidget>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
                    </DialogHeader>
                    <TeamForm
                        initialValues={form}
                        saving={saving}
                        isEdit={Boolean(editing)}
                        onCancel={() => setOpen(false)}
                        onSubmit={save}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
