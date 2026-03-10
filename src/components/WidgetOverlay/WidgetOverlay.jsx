import { useState, useContext } from 'react';
import { FaPlus as PlusIcon } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import QRCodeWidget from '../Widgets/QRCode/QRCodeWidget';

export default function WidgetOverlay({ portfolioId, portfolioType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { user, loading: authLoading } = useContext(AuthContext);

  //check if user is creator of portfolio
  function checkIfCreator() {
    if (!user) return false; 
    return user.portfolios.some(p => p.portfolioId === portfolioId);
  }

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-300"
            onClick={() => { setIsOpen(false); setSelectedWidget(null); setShowForm(false); }}
          />
        </>
      )}

      {/* Widget Container */}
      <div className="fixed bottom-16 left-5 pr-6 flex flex-col items-start gap-4 z-[9999]">
        <div className={`flex flex-col gap-3 mb-2 transition-all duration-200 origin-bottom-left ${
          isOpen
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}>

          {/* QR Code Widget */}
          <QRCodeWidget
            portfolioId={portfolioId}
            portfolioType={portfolioType}
            checkIfCreator={checkIfCreator}
            selectedWidget={selectedWidget}
            setSelectedWidget={setSelectedWidget}
            showForm={showForm}
            setShowForm={setShowForm}
           />

        </div>

        {/* Widget Toggle Button */}
        <button
          onClick={() => { setIsOpen(!isOpen); setSelectedWidget(null); }}
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