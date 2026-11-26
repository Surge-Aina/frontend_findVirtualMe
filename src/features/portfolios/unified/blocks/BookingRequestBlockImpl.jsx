import BookingRequestForm from "./booking/BookingRequestForm";

export default function BookingRequestBlockImpl({
  template,
  sectionId,
  editorPreview,
  sectionTitle,
  intro,
  services,
  minNoticeHours,
  daysAheadMax,
  timezone,
  confirmationText,
  ...rest
}) {
  const title = sectionTitle || rest.title || "Request a time";
  const isPM =
    template === "projectManager" || template === "dataScientist" || template === "agent";
  const sectionClass = isPM ? "py-12" : "py-12 bg-white";

  return (
    <section className={sectionClass} data-testid="booking-request-block">
      <div className="max-w-xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {intro ? <p className="text-gray-600 mb-6 whitespace-pre-line">{intro}</p> : null}
        <BookingRequestForm
          services={services}
          minNoticeHours={minNoticeHours}
          daysAheadMax={daysAheadMax}
          timezone={timezone}
          confirmationText={confirmationText}
          sectionId={sectionId}
          editorPreview={editorPreview}
        />
      </div>
    </section>
  );
}