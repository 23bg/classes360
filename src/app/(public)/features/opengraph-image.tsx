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
                    background: "linear-gradient(135deg, #111827 0%, #065f46 100%)",
                    color: "#ffffff",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ fontSize: 34, opacity: 0.9 }}>Classes360 Features</div>
                <div style={{ marginTop: 16, fontSize: 58, fontWeight: 700, lineHeight: 1.15 }}>
                    Enquiry to Admission Workflow
                </div>
                <div style={{ marginTop: 18, fontSize: 26, opacity: 0.92 }}>
                    Student records, course mapping, fees and portal in one place.
                </div>
            </div>
        ),
        size
    );
}
