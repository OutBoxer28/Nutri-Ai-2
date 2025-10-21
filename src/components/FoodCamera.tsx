"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { showError } from "@/utils/toast";

interface FoodCameraProps {
  onCapture: () => void;
  isRecognizing: boolean;
}

type CameraState = "idle" | "starting" | "streaming" | "error";

export const FoodCamera = ({ onCapture, isRecognizing }: FoodCameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startCamera = async () => {
    if (streamRef.current) return;

    setCameraState("starting");
    setErrorMessage(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setCameraState("streaming");
      } else {
        throw new Error("Video element not available.");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      let message = "Could not access camera. Please check permissions or ensure a camera is available.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          message = "Camera access was denied. Please allow camera access in your browser settings.";
        } else if (err.name === "NotFoundError") {
          message = "No camera found. Please ensure a camera is connected and enabled.";
        }
      }
      setErrorMessage(message);
      setCameraState("error");
      showError(message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const renderContent = () => {
    switch (cameraState) {
      case "starting":
        return (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="h-16 w-16 animate-spin" />
            <p className="mt-4">Starting camera...</p>
          </div>
        );
      case "error":
        return (
          <div className="text-center text-destructive">
            <p>{errorMessage}</p>
            <Button onClick={startCamera} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        );
      case "streaming":
        return (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-md"
          />
        );
      case "idle":
      default:
        return (
          <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-md flex items-center justify-center">
            <Camera className="h-16 w-16 text-muted-foreground" />
          </div>
        );
    }
  };

  return (
    <div className="w-full aspect-square bg-secondary rounded-lg flex flex-col items-center justify-center space-y-4 p-4 relative">
      {renderContent()}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <Button onClick={onCapture} disabled={isRecognizing || cameraState !== "streaming"}>
          {isRecognizing ? "Analyzing..." : "Capture"}
        </Button>
      </div>
    </div>
  );
};