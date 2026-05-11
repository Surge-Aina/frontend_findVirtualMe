export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-gray-300 pt-8 pb-6 text-center text-gray-500 text-sm md:text-base"
    >
      <p className="mb-3">
        © {new Date().getFullYear()} <span className="font-medium text-gray-700">Jane Doe Photography</span>. All rights reserved.
      </p>

      <nav className="space-x-4">
        <a
          href="/privacy"
          className="hover:text-gray-800 hover:underline transition-colors duration-200"
        >
          Privacy Policy
        </a>
        <span className="text-gray-400">•</span>
        <a
          href="/terms"
          className="hover:text-gray-800 hover:underline transition-colors duration-200"
        >
          Terms of Service
        </a>
      </nav>
    </footer>
  );
}
