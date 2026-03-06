import { useEffect, useState, useContext } from 'react';
import { FaPlus as PlusIcon } from 'react-icons/fa';
import {BsQrCodeScan as QRIcon} from 'react-icons/bs';
import { Trash2Icon } from 'lucide-react';
import QRDisplay from '../QRCode/QRDisplay';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import QRCodeForm from '../QRCode/QRCodeForm';
import { toast } from 'react-toastify';
import authAxios from '../../utils/axiosAuth';

export default function WidgetOverlay({ portfolioId, portfolioType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [QRCodes, setQRCodes] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showQRForm, setShowQRForm] = useState(false);
  const { user, loading: authLoading } = useContext(AuthContext);

  //check if user is creator of portfolio
  function checkIfCreator() {
    if (!user) return false; 
    return user.portfolios.some(p => p.portfolioId === portfolioId);
  }

  useEffect(() => {
    if (authLoading) return; // Wait for auth state to load
    const fetchQRCodes = async () => {
      try {
        let res;
        if(user) {
          res = await authAxios.get(
            `${import.meta.env.VITE_BACKEND_API}/qrCode/byPortfolio?portfolioId=${portfolioId}&type=${portfolioType}`
          );
          setQRCodes(res.data);
          console.log('Fetched QR codes:', res.data);
          return;
        }else {
          res = await axios.get(
            `${import.meta.env.VITE_BACKEND_API}/qrCode/public/byPortfolio?portfolioId=${portfolioId}&type=${portfolioType}`
          );
        }
        console.log('API response:', res.data);
        setQRCodes(res.data);
        console.log('Fetched QR codes:', res.data);
      } catch (error) {
        console.error('Error fetching QR IDs:', error);
      }
    };
    fetchQRCodes();
  }, [portfolioId, portfolioType, user, authLoading]);

  //delete QR code function
  const deleteQRCode = async (qrId) => {
    try {
      const res = await authAxios.delete(`${import.meta.env.VITE_BACKEND_API}/qrCode/${qrId}`);
      setQRCodes((prev) => prev.filter(qr => qr._id !== qrId));
      toast.success('QR code deleted successfully');
    }
    catch (error) {
      toast.error('Failed to delete QR code');
      console.error('Error deleting QR code:', error);
    }
  };

  //toggle QR code active state
  const toggleActive = async (QRCode) => {
    try {
      const res = await authAxios.patch(`${import.meta.env.VITE_BACKEND_API}/qrCode/${QRCode._id}/toggleActive`);
      setQRCodes((prev) => prev.map(qr => qr._id === QRCode._id ? { ...qr, active: res.data.active } : qr));
      toast.success(`QR code ${res.data.active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to toggle QR code state');
      console.error('Error toggling QR code state:', error);
    }
  };
  return (
    <>
    {isOpen && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-300"
          onClick={() => { setIsOpen(false); setSelectedQR(null); setShowQRForm(false); }}
        />

        {/* QR Code Form */}
        {showQRForm && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
            onClick={() => setShowQRForm(false)} 
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <QRCodeForm
                portfolioId={portfolioId}
                portfolioType={portfolioType}
                onClose={() => setShowQRForm(false)}
                onSuccess={(newQR) => {
                  setQRCodes((prev) => [...prev, newQR]);
                  setSelectedQR(newQR);
                  setShowQRForm(false);
                }}
              />
            </div>
          </div>
        )}
      </>
    )}

      {/* Widget Container */}
      <div className="fixed bottom-16 left-5 pr-6 flex flex-col items-start gap-4 z-[9999]">
        <div className={`flex flex-col gap-3 mb-2 transition-all duration-200 origin-bottom-left ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>

          {/* array of QR codes */}
          {QRCodes && QRCodes.map((QRCode) => (
            // only show QR codes that are active or if user is creator of portfolio
            (QRCode.active || checkIfCreator()) && (
              <div key={QRCode._id} className="flex flex-col items-start">
                <div className="">
                  {/* QR icon and title*/}
                  <button
                    className={`flex items-center  gap-3 p-3 mx-auto ${selectedQR?._id === QRCode._id ? 'bg-blue-600' : 'bg-white'}  text-blue-600 rounded-2xl shadow-xl hover:scale-105 transition-transform`}
                    onClick={() => setSelectedQR(selectedQR?._id === QRCode._id ? null : QRCode)}
                  >
                    <QRIcon className={`w-5 h-5 shrink-0 ${selectedQR?._id === QRCode._id ? 'text-white' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${selectedQR?._id === QRCode._id ? 'text-white' : 'text-blue-600'} whitespace-nowrap`}>
                      {QRCode.title}
                    </span>

                  {/* QR Code active toggle */}
                  {checkIfCreator() && (
                    <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(QRCode);
                    }}
                    className={`relative w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ml-auto mr-2 ${
                      QRCode.active ? 'bg-blue-700 ' : 'bg-slate-400'
                    }`}
                  >
                    <div
                      className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${
                        QRCode.active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>)}
                  {/* QR Code delete button */}
                  {checkIfCreator() && (
                    <div
                      className="p-2 bg-red-500 text-white rounded-xl shadow-xl hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        //ask for confirmation before deleting
                        if (window.confirm('Are you sure you want to delete this QR code?')) {
                          deleteQRCode(QRCode._id);
                        }
                      }}
                    >
                      <Trash2Icon className="w-5 h-5 shrink-0" />
                    </div>
                  )}
                  </button>

                </div>

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
            )
          ))}

          {/* add new QR code button */}

          {checkIfCreator() && (
            <button
              className="flex items-center gap-3 p-3  bg-white text-blue-600 rounded-2xl shadow-xl hover:scale-105 transition-transform w-fit"
              onClick={() => {
                setShowQRForm(true);
              }}
            >
              <PlusIcon className="w-5 h-5 shrink-0" />
              <div className="text-sm font-medium">Add New QR Code</div>
            </button>
          )}
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