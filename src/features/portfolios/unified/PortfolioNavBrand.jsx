import {
  FaBriefcase,
  FaBriefcaseMedical,
  FaBrush,
  FaCamera,
  FaChartLine,
  FaCode,
  FaGlobe,
  FaGraduationCap,
  FaHammer,
  FaHeart,
  FaHospital,
  FaHospitalUser,
  FaHouseMedical,
  FaKitMedical,
  FaLaptopCode,
  FaMicrophone,
  FaPalette,
  FaPenNib,
  FaPumpSoap,
  FaRocket,
  FaScrewdriverWrench,
  FaStethoscope,
  FaTooth,
  FaUser,
  FaUserDoctor,
  FaWrench,
} from "react-icons/fa6";
import { MdLocalHospital, MdMedicalServices, MdOutlineAnalytics, MdOutlineWorkspaces } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi2";

export const DEFAULT_NAV_BRAND_ICON_KEY = "FaBriefcase";

/** Curated react-icons options for the portfolio section nav (key = export name). */
export const NAV_BRAND_ICON_OPTIONS = [
  { key: "FaBriefcase", label: "Briefcase" },
  { key: "FaLaptopCode", label: "Code" },
  { key: "FaCode", label: "Brackets" },
  { key: "FaPalette", label: "Creative" },
  { key: "FaRocket", label: "Launch" },
  { key: "FaGraduationCap", label: "Education" },
  { key: "FaChartLine", label: "Growth" },
  { key: "MdOutlineAnalytics", label: "Analytics" },
  { key: "FaCamera", label: "Photo" },
  { key: "FaMicrophone", label: "Audio" },
  { key: "FaPenNib", label: "Writing" },
  { key: "FaHeart", label: "Heart" },
  { key: "FaGlobe", label: "Web" },
  { key: "FaUser", label: "Person" },
  { key: "MdOutlineWorkspaces", label: "Workspaces" },
  { key: "HiOutlineSparkles", label: "Sparkles" },
  { key: "FaTooth", label: "Dentist / dental" },
  { key: "FaHospital", label: "Hospital" },
  { key: "MdLocalHospital", label: "Hospital (cross)" },
  { key: "FaHouseMedical", label: "Clinic / medical office" },
  { key: "FaHospitalUser", label: "Patient care" },
  { key: "MdMedicalServices", label: "Medical services" },
  { key: "FaStethoscope", label: "Medical / care" },
  { key: "FaKitMedical", label: "First aid / urgent care" },
  { key: "FaUserDoctor", label: "Physician" },
  { key: "FaBriefcaseMedical", label: "Medical practice" },
  { key: "FaWrench", label: "Trades / repair" },
  { key: "FaScrewdriverWrench", label: "Handyman" },
  { key: "FaHammer", label: "Construction" },
  { key: "FaPumpSoap", label: "Cleaning" },
  { key: "FaBrush", label: "Cleaning / paint" },
];

const NAV_BRAND_ICON_MAP = {
  FaBriefcase,
  FaBriefcaseMedical,
  FaBrush,
  FaCamera,
  FaChartLine,
  FaCode,
  FaGlobe,
  FaGraduationCap,
  FaHammer,
  FaHeart,
  FaHospital,
  FaHospitalUser,
  FaHouseMedical,
  FaKitMedical,
  FaLaptopCode,
  FaMicrophone,
  FaPalette,
  FaPenNib,
  FaPumpSoap,
  FaRocket,
  FaScrewdriverWrench,
  FaStethoscope,
  FaTooth,
  FaUser,
  FaUserDoctor,
  FaWrench,
  MdOutlineAnalytics,
  MdOutlineWorkspaces,
  MdLocalHospital,
  MdMedicalServices,
  HiOutlineSparkles,
};

export function mergeNavBrandDefaults(navBrand) {
  const base = {
    mode: "none",
    iconKey: DEFAULT_NAV_BRAND_ICON_KEY,
    initialsText: "",
    initialsFill: "color",
    initialsBgColor: "#2563eb",
    initialsBgImageUrl: "",
  };
  if (!navBrand || typeof navBrand !== "object") return { ...base };
  return {
    ...base,
    ...navBrand,
    mode: navBrand.mode === "icon" || navBrand.mode === "initials" ? navBrand.mode : "none",
    iconKey:
      typeof navBrand.iconKey === "string" && navBrand.iconKey.trim()
        ? navBrand.iconKey.trim()
        : base.iconKey,
    initialsText: typeof navBrand.initialsText === "string" ? navBrand.initialsText.slice(0, 2) : "",
    initialsFill: navBrand.initialsFill === "image" ? "image" : "color",
    initialsBgColor:
      typeof navBrand.initialsBgColor === "string" && navBrand.initialsBgColor.trim()
        ? navBrand.initialsBgColor.trim()
        : base.initialsBgColor,
    initialsBgImageUrl:
      typeof navBrand.initialsBgImageUrl === "string" ? navBrand.initialsBgImageUrl.trim() : "",
  };
}

function resolveIcon(key) {
  return NAV_BRAND_ICON_MAP[key] || NAV_BRAND_ICON_MAP[DEFAULT_NAV_BRAND_ICON_KEY];
}

/** Small icon preview for editor pickers (same mapping as the public nav). */
export function NavBrandIconPreview({ iconKey, className = "h-5 w-5 sm:h-6 sm:w-6" }) {
  const Icon = resolveIcon(iconKey);
  return <Icon className={className} aria-hidden />;
}

function iconShellClass(template) {
  const box =
    "shrink-0 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg overflow-hidden";
  if (template === "projectManager") {
    return `${box} bg-white/10 ring-1 ring-white/20 text-white`;
  }
  if (template === "dataScientist") {
    return `${box} bg-[var(--ds-accent-dim)] ring-1 ring-[var(--ds-accent)]/40 text-[var(--ds-accent)]`;
  }
  if (template === "agent") {
    return `${box} bg-white/10 ring-1 ring-[color:var(--agent-border)] text-[var(--agent-accent)]`;
  }
  if (template === "handyman") {
    return `${box} bg-amber-100 ring-1 ring-amber-300 text-amber-900`;
  }
  return `${box} bg-blue-100 ring-1 ring-blue-200 text-blue-800`;
}

function initialsShellClass(template) {
  const box =
    "shrink-0 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg overflow-hidden ring-1 font-semibold tabular-nums";
  if (template === "projectManager") {
    return `${box} ring-white/25 text-white`;
  }
  if (template === "dataScientist") {
    return `${box} ring-[var(--ds-accent)]/35 text-white`;
  }
  if (template === "agent") {
    return `${box} ring-[color:var(--agent-border)] text-white`;
  }
  if (template === "handyman") {
    return `${box} ring-amber-300/90 text-white`;
  }
  return `${box} ring-blue-200/90 text-white`;
}

/**
 * Decorative mark next to the portfolio nav title: react-icon, or up to two initials on color/image.
 */
export function PortfolioNavBrandMark({ navBrand, template }) {
  const nb = mergeNavBrandDefaults(navBrand);
  if (nb.mode === "none") return null;

  if (nb.mode === "icon") {
    const Icon = resolveIcon(nb.iconKey);
    return (
      <span className={iconShellClass(template)} aria-hidden>
        <Icon className="h-[1.35rem] w-[1.35rem] sm:h-6 sm:w-6" />
      </span>
    );
  }

  const raw = (nb.initialsText || "").trim().slice(0, 2);
  const display = raw || "?";
  const useImage = nb.initialsFill === "image" && nb.initialsBgImageUrl;
  const style = useImage
    ? {
        backgroundImage: `url(${nb.initialsBgImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: nb.initialsBgColor || "#2563eb" };

  return (
    <span
      className={initialsShellClass(template)}
      style={style}
      title={display}
      aria-label={`Logo ${display}`}
    >
      <span
        className={
          useImage
            ? "text-sm sm:text-base tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
            : "text-sm sm:text-base tracking-tight drop-shadow-sm"
        }
      >
        {display}
      </span>
    </span>
  );
}
