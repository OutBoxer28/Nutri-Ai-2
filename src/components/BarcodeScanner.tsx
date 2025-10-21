"use client";

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Html5QrcodeScannerState } from 'html5-qrcode/esm/state-manager';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: string) => void;
}

const SCANNER_REGION_ID = 'barcode-scanner-region';

const BarcodeScanner = ({ onScanSuccess, onScanFailure }: BarcodeScannerProps) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner only if it doesn't exist
    if (!scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        SCANNER_REGION_ID,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        /* verbose= */ false
      );
      
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    // Cleanup function to stop the scanner when the component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
      }
      scannerRef.current = null;
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id={SCANNER_REGION_ID} />;
};

export default BarcodeScanner;