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
                    background: "linear-gradient(135deg, #0f172a 0%, #065f46 100%)",
                    color: "#ffffff",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ fontSize: 34, opacity: 0.9 }}>Classes360 Use Cases</div>
                <div style={{ marginTop: 16, fontSize: 58, fontWeight: 700, lineHeight: 1.15 }}>
                    Built for Coaching Institutes
                </div>
                <div style={{ marginTop: 18, fontSize: 26, opacity: 0.92 }}>
                    JEE/NEET, tuition classes, computer training and skill academies.
                </div>
            </div>
        ),
        size
    );
}
