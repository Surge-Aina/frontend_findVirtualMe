import { useEffect, useState } from "react";

export function JsonEditor({ data, onChange }) {
  const [text, setText] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState(null);

  useEffect(() => {
    setText(JSON.stringify(data, null, 2));
  }, [data]);

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError("Invalid JSON");
    }
  };

  return (
    <div>
      <textarea
        className="w-full h-64 font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function FieldEditor({ label, value, onChange, type = "text", rows, placeholder }) {
  if (type === "textarea") {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
          rows={rows || 3}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function HeroEditor({ data, onChange, template }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  if (template === "healthcare") {
    return (
      <div className="space-y-4">
        <FieldEditor label="Practice Name" value={data.practiceName} onChange={(v) => set("practiceName", v)} />
        <FieldEditor label="Tagline" value={data.tagline} onChange={(v) => set("tagline", v)} />
        <FieldEditor label="Description" value={data.description} onChange={(v) => set("description", v)} type="textarea" />
        <FieldEditor label="Logo Image URL" value={data.logoImage} onChange={(v) => set("logoImage", v)} />
        <FieldEditor label="Icon (emoji or key)" value={data.icon} onChange={(v) => set("icon", v)} />
        <FieldEditor label="Background Image URL" value={data.backgroundImage} onChange={(v) => set("backgroundImage", v)} />
        <FieldEditor label="Primary Button Text" value={data.primaryButtonText} onChange={(v) => set("primaryButtonText", v)} />
        <FieldEditor label="Secondary Button Text" value={data.secondaryButtonText} onChange={(v) => set("secondaryButtonText", v)} />
      </div>
    );
  }

  if (template === "handyman") {
    return (
      <div className="space-y-4">
        <FieldEditor label="Title" value={data.title} onChange={(v) => set("title", v)} />
        <FieldEditor label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} type="textarea" />
        <FieldEditor label="Phone Number" value={data.phoneNumber} onChange={(v) => set("phoneNumber", v)} />
        <FieldEditor label="Hero Image URL" value={data.imageUrl} onChange={(v) => set("imageUrl", v)} />
        <FieldEditor label="CTA Text" value={data.ctaText} onChange={(v) => set("ctaText", v)} />
        <FieldEditor label="Badge 1" value={data.badge1Text} onChange={(v) => set("badge1Text", v)} />
        <FieldEditor label="Badge 2" value={data.badge2Text} onChange={(v) => set("badge2Text", v)} />
        <FieldEditor label="Badge 3" value={data.badge3Text} onChange={(v) => set("badge3Text", v)} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FieldEditor label="Name" value={data.name} onChange={(v) => set("name", v)} />
      <FieldEditor label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <FieldEditor label="Bio" value={data.bio} onChange={(v) => set("bio", v)} type="textarea" />
      <FieldEditor label="Profile Image URL" value={data.profileImage} onChange={(v) => set("profileImage", v)} />
    </div>
  );
}

export function ContactEditor({ data, onChange, template }) {
  const set = (key, val) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-4">
      <FieldEditor label="Email" value={data.email} onChange={(v) => set("email", v)} />
      <FieldEditor label="Phone" value={data.phone} onChange={(v) => set("phone", v)} />
      {template === "healthcare" && (
        <>
          <FieldEditor label="WhatsApp" value={data.whatsapp} onChange={(v) => set("whatsapp", v)} />
          <FieldEditor label="Button text (CTA)" value={data.buttonText} onChange={(v) => set("buttonText", v)} />
          <FieldEditor label="Submit Button Text" value={data.submitText} onChange={(v) => set("submitText", v)} />
          <p className="text-sm font-medium text-gray-800 mt-2">Address</p>
          <FieldEditor
            label="Street"
            value={data.address?.street}
            onChange={(v) => set("address", { ...(data.address || {}), street: v })}
          />
          <FieldEditor
            label="City"
            value={data.address?.city}
            onChange={(v) => set("address", { ...(data.address || {}), city: v })}
          />
          <FieldEditor
            label="State"
            value={data.address?.state}
            onChange={(v) => set("address", { ...(data.address || {}), state: v })}
          />
          <FieldEditor
            label="ZIP"
            value={data.address?.zip}
            onChange={(v) => set("address", { ...(data.address || {}), zip: v })}
          />
        </>
      )}
      {template === "handyman" && (
        <>
          <FieldEditor label="Section Title" value={data.title} onChange={(v) => set("title", v)} />
          <FieldEditor label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} type="textarea" />
          <FieldEditor label="Form title" value={data.formTitle} onChange={(v) => set("formTitle", v)} />
          <FieldEditor label="Hours" value={data.hours} onChange={(v) => set("hours", v)} />
          <FieldEditor label="Note" value={data.note} onChange={(v) => set("note", v)} />
        </>
      )}
      {(template === "projectManager" || template === "dataScientist") && (
        <FieldEditor label="Location" value={data.location} onChange={(v) => set("location", v)} />
      )}
    </div>
  );
}
