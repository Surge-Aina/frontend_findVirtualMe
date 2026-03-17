import PrivacyPolicyFooterLink from "../../../../components/PrivacyPolicy/PrivacyPolicyFooterLink";

export default function Footer({ practiceData }) {
  const currentYear = new Date().getFullYear()

  return (
        
    <footer className="border-t border-gray-700 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          
          {/* Practice Name + Tagline */}
          <div className="flex flex-col gap-1.5">
            <span className="text-gray-500 text-sm font-semibold tracking-wide uppercase">
              {practiceData.name}
            </span>
            <span className="text-gray-400 text-xs leading-relaxed max-w-[220px]">
              Compassionate care you can trust.
            </span>
          </div>
    
          {/* Legal Links */}
          <div className="flex flex-col gap-2">
            <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-1">
              Legal
            </span>
            <PrivacyPolicyFooterLink
              className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
              label="Privacy Policy"
            />
            <a
              className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
            >
              Terms of Service
            </a>
          </div>
    
          {/* Copyright */}
          <div className="flex items-end">
            <p className="text-gray-500 text-xs">
              &copy; {currentYear} {practiceData.name}.<br className="hidden md:block" /> All rights reserved.
            </p>
          </div>
    
        </div>
      </div>
    </footer>
  )
}