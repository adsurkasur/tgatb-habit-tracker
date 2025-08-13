import React from "react";

interface FirebaseErrorBoundaryProps {
  children: React.ReactNode;
}

interface FirebaseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FirebaseErrorBoundary extends React.Component<FirebaseErrorBoundaryProps, FirebaseErrorBoundaryState> {
  constructor(props: FirebaseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log errorInfo to an error reporting service here
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error?.message.includes("Firebase configuration error")) {
      return (
        <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c", background: "#fff0f0" }}>
          <h2>⚠️ Firebase Configuration Error</h2>
          <p>{this.state.error.message}</p>
          <p>Please check your .env or build configuration and try again.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
