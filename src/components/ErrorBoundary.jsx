import { Component } from "react";
import { YELLOW, INK } from "../theme.js";

/**
 * Catches render/runtime errors anywhere below it so a single bad screen can't
 * take down the whole app to a blank white page. Shows a recoverable fallback.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[Zigi] render error", error, info?.componentStack);
  }

  handleReset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: '"Inter", system-ui, sans-serif',
          background: "#fff",
          color: INK,
        }}
      >
        <div style={{ fontSize: 40 }}>😕</div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Something went wrong</div>
        <div style={{ color: "#666", fontWeight: 500, maxWidth: 320, lineHeight: 1.5 }}>
          Zigi hit an unexpected error. Your money is safe — nothing was sent. You can try again.
        </div>
        <button
          type="button"
          onClick={this.handleReset}
          style={{
            background: YELLOW,
            color: INK,
            border: "none",
            borderRadius: 24,
            padding: "12px 28px",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}
