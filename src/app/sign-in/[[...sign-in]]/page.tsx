import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        gap: "24px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "var(--accent)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
          </svg>
        </div>
        <h1
          style={{
            fontFamily: "system-ui",
            fontWeight: 800,
            fontSize: "24px",
            color: "var(--text)",
            letterSpacing: "-0.5px",
          }}
        >
          FlowSpace
        </h1>
        <p style={{ color: "var(--text2)", fontSize: "14px", marginTop: "4px" }}>
          Your personal project manager
        </p>
      </div>
      <SignIn />
    </div>
  );
}
