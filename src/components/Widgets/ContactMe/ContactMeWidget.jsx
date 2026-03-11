import { createPortal } from "react-dom";
import ContactMeForm from "./ContactMeForm";
import { FaEnvelope as ContactIcon } from "react-icons/fa";

export default function ContactMeWidget({
    portfolioId,
    portfolioType,
    ownerEmail,
    ownerName,
    selectedForm,
    setSelectedForm
}) {
    //check if onwerEmail and ownerName are provided, if not, don't render the widget
    if (!ownerEmail || !ownerName) {
        return null;
    }
    const modal = (
        <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
        onClick={() => setSelectedForm(null)}
        >
        <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        >
            <ContactMeForm
            onSuccess={() => setSelectedForm(null)}
            portfolioId={portfolioId}
            portfolioType={portfolioType}
            ownerEmail={ownerEmail}
            ownerName={ownerName}
            onClose={() => setSelectedForm(null)}
            />
        </div>
        </div>
    );

    return (
        <>
        <button
            className="flex items-center gap-2 px-4 py-2 w-fit bg-white text-blue-600 rounded-md shadow hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
            onClick={() => setSelectedForm("contact")}
        >
            <ContactIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Contact Me</span>
        </button>

        {selectedForm === "contact" &&
            createPortal(modal, document.body)}
        </>
    );
}