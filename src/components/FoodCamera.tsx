"use client";

import { Camera } from "lucide-react";
import { Button } from "./ui/button";

interface FoodCameraProps {
  onCapture: () => void;
  isRecognizing: boolean;
}

export const FoodCamera = ({ onCapture, isRecognizing }: FoodCameraProps) => {
  return (
    <div className="w-full aspect-square bg-secondary rounded-lg flex flex-col items-center justify-center space-y-4 p-4">
      <div className="w-full h-full border-2 border-dashed border-muted-foreground rounded-md flex items-center justify-center">
        <Camera className="h-16 w-16 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground text-center">
        Point your camera at your meal and tap capture.
      </p>
      <Button onClick={onCapture} disabled={isRecognizing}>
        {isRecognizing ? "Analyzing..." : "Capture"}
      </Button>
    </div>
  );
};