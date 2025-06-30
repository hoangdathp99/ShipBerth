"use client";
import React, { useState, useEffect } from "react";

interface ShipImageWithFallbackProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  placeholderText?: string;
}

const ShipImageWithFallback: React.FC<ShipImageWithFallbackProps> = ({
  src,
  alt,
  style,
  fallbackSrc = "/uploads/shipContainer.png",
  placeholderText = "No Image",
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
  }, [src]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setCurrentSrc(fallbackSrc);
      setHasError(true);
    } else {
      // If fallback also fails, clear src to show placeholder
      setCurrentSrc("");
    }
  };

  if (hasError && currentSrc === "") {
    return (
      <div
        style={{
          ...style,
          backgroundColor: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "10px",
          border: "1px dashed #999",
          minHeight: "30px",
        }}
      >
        {placeholderText}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      onError={handleImageError}
      style={style}
      alt={alt}
    />
  );
};

export default ShipImageWithFallback;
