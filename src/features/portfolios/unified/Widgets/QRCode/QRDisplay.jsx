import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import { toast } from "react-toastify";

// Component to display a QR code based on its ID
// backend returns { ownerId, portfolioId, title, description, url, align, alignVertical, size, active } 
export default function QRDisplay({ qrId, qrObject }) {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(!qrObject);
    const [error, setError] = useState("");
    const apiBaseUrl = import.meta.env.VITE_BACKEND_API;

    useEffect(() => {
        if (qrObject) {
            setQrData(qrObject);
            setLoading(false);
            return;
        }

        const fetchQr = async () => {
            try {
                setLoading(true);
                if (qrId) {
                    console.log("Qr ID", qrId);
                    const res = await axios.get(`${apiBaseUrl}/api/qr-codes/public/${qrId}`);
                    setQrData(res.data);
                    console.log("Fetched QR data:", res.data);
                } else {
                    setQrData(null);
                }
            } catch (err) {
                console.error("Failed to load QR code", err);
                setError("QR code not available");
            } finally {
                setLoading(false);
            }
        };
        fetchQr();
    }, [qrId, qrObject]);

    //handle on click to open URL in new tab
    const handleClick = () => {
        if (qrData && qrData.url) {
            window.open(qrData.url, "_blank");
        } else {
            console.error("No URL found for this QR code");
            toast.error("No URL found for this QR code");
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="text-center p-10 text-gray-500">
                Loading QR code...
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center p-10 text-red-500">
                {error}
            </div>
        );
    }

    // No QR code found
    if (!qrData) {
        return (
            <div className="text-center p-10 text-gray-500">
                QR code not available
            </div>
        );
    }

    const { title, description, url, size } = qrData;
    return (
        <div className="flex flex-col items-center justify-center text-center p-4">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <QRCodeCanvas value={url} size={size} className="mx-auto my-4 hover:cursor-pointer hover:scale-101 transition-transform" onClick={handleClick} />
            {description && (
                <p className="mt-2 text-sm text-gray-600">{description}</p>
            )}
        </div>
    );
}