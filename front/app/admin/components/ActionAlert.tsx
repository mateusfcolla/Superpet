"use client";
import React, { useEffect, useState } from "react";

interface ActionAlertProps {
  alertText: string;
  color?: "red" | "green" | "yellow";
}

const ActionAlert: React.FC<ActionAlertProps> = ({
  alertText,
  color = "green",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the alert after a certain duration (e.g., 3 seconds)
    const timeoutId = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    // Clear the timeout to prevent memory leaks
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {isVisible && (
        <div className={`wkode-action-alert wk-visible wk-${color}`}>
          {alertText}
        </div>
      )}
    </>
  );
};

export default ActionAlert;
