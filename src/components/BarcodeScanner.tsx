"use client";

import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure: (error: string) => void;
}

const BarcodeScanner = ({ onScanSuccess, onScanFailure }: BarcodeScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'barcode-scanner-region',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      // It's important to check if the scanner element is still in the DOM
      if (document.getElementById('barcode-scanner-region')) {
        scanner.clear().catch(error => {
          console.error("Failed to clear html5-qrcode-scanner.", error);
        });
      }
    };
  }, [onScanSuccess, onScanFailure]);

  return <div id="barcode-scanner-region" />;
};

export default BarcodeScanner;