import { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#a855f7",
    colorBackground: "#2C2638",
    colorInputBackground: "#3D3347",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255, 255, 255, 0.6)",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-sans), sans-serif",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "100%",
      backgroundColor: "transparent",
    },
    card: {
      backgroundColor: "transparent",
      borderRadius: "0",
      boxShadow: "none",
      border: "none",
      padding: "2rem 2.5rem",
    },
    header: {
      paddingTop: "2rem",
      paddingBottom: "0",
      paddingLeft: "0",
      paddingRight: "0",
    },
    headerTitle: {
      color: "#ffffff",
      fontSize: "1.875rem",
      fontWeight: "700",
      textAlign: "left",
      marginBottom: "0",
      paddingTop: "0",
      paddingBottom: "1rem",
      lineHeight: "1.3",
      letterSpacing: "-0.02em",
    },
    headerSubtitle: {
      color: "rgba(255, 255, 255, 0.65)",
      textAlign: "left",
      marginBottom: "0",
      fontSize: "0.9375rem",
      lineHeight: "1.5",
      paddingTop: "0",
      paddingBottom: "2.5rem",
    },
    socialButtonsBlock: {
      marginTop: "0",
      marginBottom: "0",
      paddingTop: "0",
      paddingBottom: "0",
      display: "flex",
      gap: "0.875rem",
    },
    socialButtonsBlockButton: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "0.5rem",
      color: "#000000",
      padding: "0.9375rem 1.125rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      marginBottom: "0",
      paddingBottom: "0.9375rem",
      paddingTop: "0.9375rem",
      marginTop: "0",
      transition: "all 0.2s ease",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      width: "100%",
      height: "auto",
      minHeight: "3rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      "&:not(:last-child)": {
        marginBottom: "0",
      },
      "&:hover": {
        backgroundColor: "#f8f8f8",
        borderColor: "rgba(255, 255, 255, 0.25)",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "translateY(0)",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#000000",
      fontSize: "0.875rem",
      fontWeight: "500",
      letterSpacing: "0.01em",
    },
    formButtonPrimary: {
      background: "linear-gradient(180deg, #4A3A65 0%, #3D2D5A 50%, #2A1E42 100%)",
      borderRadius: "0.75rem",
      fontSize: "1rem",
      fontWeight: "600",
      padding: "1rem 1.75rem",
      width: "100%",
      marginTop: "0",
      marginBottom: "0",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)",
      letterSpacing: "0.02em",
      border: "none",
      outline: "none",
      "&:hover": {
        background: "linear-gradient(180deg, #5A4A75 0%, #4A3A65 50%, #3D2D5A 100%)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.25)",
        transform: "translateY(-1px)",
      },
      "&:active": {
        transform: "translateY(0)",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.3)",
      },
      "&:focus": {
        outline: "none",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)",
      },
    },
    formActions: {
      paddingTop: "1.75rem",
      paddingBottom: "1.25rem",
    },
    formFieldInput: {
      backgroundColor: "#3D3347",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      borderRadius: "0.5rem",
      color: "#ffffff",
      padding: "0.9375rem 1.125rem",
      fontSize: "1rem",
      marginBottom: "0",
      paddingBottom: "0.9375rem",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: "#a855f7",
        boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
        outline: "none",
        backgroundColor: "#3D3347",
      },
      "&:hover": {
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.5)",
      },
    },
    formFieldLabel: {
      color: "rgba(255, 255, 255, 0.85)",
      fontSize: "0.875rem",
      fontWeight: "500",
      marginBottom: "0",
      marginTop: "0",
      paddingBottom: "0.75rem",
      letterSpacing: "0.01em",
    },
    formField: {
      marginBottom: "0",
      paddingBottom: "1.5rem",
    },
    footerActionLink: {
      color: "#a855f7",
      textDecoration: "underline",
      fontSize: "0.875rem",
      transition: "color 0.2s ease",
      "&:hover": {
        color: "#9333ea",
        textDecoration: "underline",
      },
    },
    formFieldRow: {
      marginBottom: "0",
      paddingBottom: "0",
    },
    dividerLine: {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      marginTop: "0",
      marginBottom: "0",
    },
    dividerText: {
      color: "rgba(255, 255, 255, 0.65)",
      fontSize: "0.875rem",
      padding: "0 1rem",
      letterSpacing: "0.02em",
    },
    divider: {
      paddingTop: "2rem",
      paddingBottom: "2rem",
    },
    identityPreviewEditButton: {
      color: "#a855f7",
    },
    formFieldAction: {
      color: "#a855f7",
    },
    alertText: {
      color: "rgba(255, 255, 255, 0.8)",
    },
    otpCodeFieldInput: {
      backgroundColor: "#3D3347",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#ffffff",
    },
    formFieldSuccessText: {
      color: "#10b981",
    },
    formFieldErrorText: {
      color: "#ef4444",
    },
    formFieldInputShowPasswordButton: {
      color: "rgba(255, 255, 255, 0.6)",
      "&:hover": {
        color: "#ffffff",
      },
    },
    formResendCodeLink: {
      color: "#a855f7",
      "&:hover": {
        color: "#9333ea",
      },
    },
    footer: {
      display: "none",
    },
    footerPages: {
      display: "none",
    },
    footerPagesLink: {
      display: "none",
    },
    formButtonReset: {
      display: "none",
    },
  },
};
