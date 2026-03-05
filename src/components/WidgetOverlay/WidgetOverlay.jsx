import { useEffect, useState } from 'react';
import { FaPlus as PlusIcon, FaQrcode as QRIcon } from 'react-icons/fa';
import QRDisplay from '../QRCode/QRDisplay';
import axios from 'axios';

export default function WidgetOverlay({ portfolioId, portfolioType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [QRCodes, setQRCodes] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API}/qrCode/public/byPortfolio?portfolioId=${portfolioId}&type=${portfolioType}`
        );
        setQRCodes(res.data);
      } catch (error) {
        console.error('Error fetching QR IDs:', error);
      }
    };
    fetchQRCodes();
  }, [portfolioId, portfolioType]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-300"
          onClick={() => { setIsOpen(false); setSelectedQR(null); }}
        />
      )}

      {/* Widget Container */}
      <div className="fixed bottom-16 left-5 pr-6 flex flex-col items-start gap-4 z-[9999]">
        <div className={`flex flex-col gap-3 mb-2 transition-all duration-200 origin-bottom-left ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>

          {QRCodes && QRCodes.map((QRCode) => (
            <div key={QRCode._id} className="flex flex-col">
              {/* QR icon and title*/}
              <button
                className={`flex items-center  gap-3 p-3 mx-auto ${selectedQR?._id === QRCode._id ? 'bg-slate-500' : 'bg-white'}  text-blue-600 rounded-2xl shadow-xl hover:scale-105 transition-transform`}
                onClick={() => setSelectedQR(selectedQR?._id === QRCode._id ? null : QRCode)}
              >
                <QRIcon className="w-5 h-5 shrink-0" />
                <span className={`text-sm font-medium ${selectedQR?._id === QRCode._id ? 'text-white' : 'text-blue-600'} whitespace-nowrap`}>
                  {QRCode.title}
                </span>
              </button>

              {/* Expanded QR Panel */}
              <div className={`transition-all duration-200 origin-top overflow-hidden ${
                selectedQR?._id === QRCode._id
                  ? 'opacity-100 scale-y-100 max-h-96 mt-2'
                  : 'opacity-0 scale-y-95 max-h-0 pointer-events-none'
              }`}>
                <div className="bg-white rounded-2xl shadow-xl ">
                  <QRDisplay qrObject={QRCode} />
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Widget Toggle Button */}
        <button
          onClick={() => { setIsOpen(!isOpen); setSelectedQR(null); }}
          className="p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-colors"
        >
          <span className={`block transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            <PlusIcon className="w-6 h-6" />
          </span>
        </button>
      </div>
    </>
  );
}