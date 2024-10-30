// app/qrPage/page.tsx

"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";

export default function QRCodeGenerator() {
    const [ qrCodeUrl, setQrCodeUrl ] = useState("");

    useEffect(() => {
        const generateQrCode = async () => {
            if (typeof window === "undefined") return; // Check if client-side
            const currentUrl = window.location.href;

            try {
                const qrCodeDataUrl = await QRCode.toDataURL(currentUrl);
                setQrCodeUrl(qrCodeDataUrl);
            } catch (error) {
                console.error("Error generating QR code", error);
            }
        };

        generateQrCode();
    }, []); // No router dependency

    return (
        <div>
            { qrCodeUrl ? (
                <Image src={ qrCodeUrl } alt="QR Code" />
            ) : (
                <p>Loading QR code...</p>
            ) }
        </div>
    );
}
