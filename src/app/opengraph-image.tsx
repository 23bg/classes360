import { ImageResponse } from "next/og";

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "64px",
                    background: "linear-gradient(135deg, #0f172a 0%, #14532d 100%)",
                    color: "#ffffff",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ fontSize: 36, opacity: 0.9 }}>Classes360</div>
                <div style={{ marginTop: 16, fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
                    Admission CRM for Coaching Institutes
                </div>
                <div style={{ marginTop: 18, fontSize: 28, opacity: 0.92 }}>
                    Capture enquiries, manage admissions, track students and fees.
                </div>
            </div>
        ),
        size
    );
}
