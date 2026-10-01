import React, { useState } from 'react';
import RadialPulseLoader from "@/components/ui/loading-animation";

export default function DemoOne() {
  const [loading, setLoading] = useState({
    radial: false,
    orbital: false,
    pendulum: false,
    pulse: false,
    concentric: false,
    sequential: false
  });

  const simulateLoading = (loaderType) => {
    setLoading(prev => ({ ...prev, [loaderType]: true }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, [loaderType]: false }));
    }, 3000);
  };
  return (
    <div className="loader-card">
      <div className="loader-container">
        <RadialPulseLoader
          size={150}
          color="#B98958"
          text="Loading Operations Center..."
          subtext="Aggregating multi-site telemetry & metrics"
        />
      </div>
    </div>
  );
}
