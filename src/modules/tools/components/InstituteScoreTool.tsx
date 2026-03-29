"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const questions = [
    "Is your institute using digital attendance?",
    "Do you collect online leads?",
    "Do you use WhatsApp communication?",
    "Do you track admissions digitally?",
    "Do you use Excel?",
    "Do you have website?",
    "Do you send SMS updates?",
    "Do you track fees digitally?",
];

export default function InstituteScoreTool() {
    const [answers, setAnswers] = useState<Record<number, "yes" | "no">>({});
    const [showScore, setShowScore] = useState(false);

    const score = useMemo(() => {
        const yesCount = Object.values(answers).filter((answer) => answer === "yes").length;
        return Math.round((yesCount / questions.length) * 100);
    }, [answers]);

    return (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <Card>
                <CardHeader>
                    <CardTitle>Institute Digital Score</CardTitle>
                    <CardDescription>Answer all questions to get your digital maturity score</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {questions.map((question, index) => (
                        <div key={question} className="space-y-2">
                            <p className="text-sm font-medium">{index + 1}. {question}</p>
                            <RadioGroup
                                value={answers[index]}
                                onValueChange={(value) => setAnswers((prev) => ({ ...prev, [index]: value as "yes" | "no" }))}
                                className="flex gap-5"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem id={`q-${index}-yes`} value="yes" />
                                    <Label htmlFor={`q-${index}-yes`}>Yes</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem id={`q-${index}-no`} value="no" />
                                    <Label htmlFor={`q-${index}-no`}>No</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    ))}

                    <Button onClick={() => setShowScore(true)} disabled={Object.keys(answers).length !== questions.length}>
                        Calculate Score
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Result</CardTitle>
                </CardHeader>
                <CardContent>
                    {showScore ? (
                        <>
                            <p className="text-3xl font-bold">{score}/100</p>
                            <p className="mt-2 text-sm text-muted-foreground">Improve your score using Classes360</p>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">Complete all answers to see score.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
