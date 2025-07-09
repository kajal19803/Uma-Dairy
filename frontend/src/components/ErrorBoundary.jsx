import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Error aane par state update karo taaki fallback UI dikhe
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Aap yahan error ko kisi service mein bhej sakte hain, ya console mein log kar sakte hain
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI agar error aaye
      return (
        <div className="p-8 text-center text-red-600">
          <h1>Oops! Kuch gadbad ho gayi.</h1>
          <p>Kripya page ko refresh karein ya baad mein try karein.</p>
        </div>
      );
    }

    return this.props.children; // Normal UI render karo
  }
}

export default ErrorBoundary;
