"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { showError } from "@/utils/toast";

interface FoodCameraProps {
  onCapture: () => void;
  isRecognizing: boolean;
}

export const FoodCamera = ({ onCapture, isRecognizing }: FoodCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
      showError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCaptureClick = () => {
    onCapture();
  };

  return (
    <div className="w-full aspect-square bg-secondary rounded-lg flex flex-col items-center justify-center space-y-4 p-4 relative">
      {error ? (
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button onClick={startCamera} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      ) : stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-md"
        />
      ) : (
        <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-md flex items-center justify-center">
          <Camera className="h-16 w-16 text-muted-foreground" />
        </div>
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <Button onClick={handleCaptureClick} disabled={isRecognizing || !stream}>
          {isRecognizing ? "Analyzing..." : "Capture"}
        </Button>
      </div>
    </div>
  );
};