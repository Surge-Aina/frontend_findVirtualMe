import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Globe,
} from "lucide-react";
import { getSiteMapLinks } from "../../config/portfolioFooterConfig";
import PrivacyPolicyFooterLink from "../PrivacyPolicy/PrivacyPolicyFooterLink";
import TermsOfServiceFooterLink from "../TermsOfService/TermsOfServiceFooterLink";
import "./PortfolioFooter.css";

const SOCIAL_ICONS = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  website: Globe,
};

export default function PortfolioFooter({
  portfolioType,
  basePath = "",
  siteName = "",
  showBranding = true,
  socialLinks = null,
  className = "",
  variant = "dark",
  sections,
  /** "scroll" = scroll to #id on page; "hash" = update URL hash (single-section portfolio views). */
  siteMapAnchorBehavior = "scroll",
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const siteMapLinks = getSiteMapLinks(portfolioType, basePath, sections);

  function handleAnchorClick(e, path) {
    if (!path.startsWith("#")) return;
    e.preventDefault();
    if (siteMapAnchorBehavior === "hash") {
      navigate({
        pathname: location.pathname,
        search: location.search,
        hash: path,
      });
      return;
    }
    const target = document.querySelector(path);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  const hasSocialLinks =
    socialLinks &&
    Object.values(socialLinks).some((v) => v && typeof v === "string");

  return (
    <footer
      role="contentinfo"
      className={`portfolio-footer portfolio-footer--${variant} ${className}`}
      aria-label="Portfolio footer"
    >
      <div className="portfolio-footer__inner">
        <div className="portfolio-footer__grid">
          {/* Site Map */}
          {siteMapLinks.length > 0 && (
            <nav
              className="portfolio-footer__section"
              aria-label="Site map"
            >
              <h3 className="portfolio-footer__heading">Site Map</h3>
              <ul className="portfolio-footer__links">
                {siteMapLinks.map(({ label, path }) => {
                  const isAnchor = path.startsWith("#");
                  const href = isAnchor ? path : path;
                  return (
                    <li key={path || label}>
                      {isAnchor ? (
                        <a
                          href={href}
                          className="portfolio-footer__link"
                          onClick={(e) => handleAnchorClick(e, path)}
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          to={path}
                          className="portfolio-footer__link"
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {/* Legal */}
          <div className="portfolio-footer__section" aria-label="Legal">
            <h3 className="portfolio-footer__heading">Legal</h3>
            <ul className="portfolio-footer__links">
              <li>
                <PrivacyPolicyFooterLink
                  className="portfolio-footer__link"
                  label="Privacy Policy"
                />
              </li>
              <li>
                <TermsOfServiceFooterLink
                  className="portfolio-footer__link"
                  label="Terms of Service"
                />
              </li>
            </ul>
          </div>

          {/* Social Links */}
          {hasSocialLinks && (
            <div
              className="portfolio-footer__section"
              aria-label="Social links"
            >
              <h3 className="portfolio-footer__heading">Connect</h3>
              <ul className="portfolio-footer__social">
                {Object.entries(SOCIAL_ICONS).map(([key, Icon]) => {
                  const url = socialLinks?.[key];
                  if (!url) return null;
                  return (
                    <li key={key}>
                      <a
                        href={url.startsWith("http") ? url : `https://${url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="portfolio-footer__social-link"
                        aria-label={`${key} profile`}
                      >
                        <Icon className="portfolio-footer__social-icon" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="portfolio-footer__bottom">
          {/* Branding */}
          {showBranding && (
            <div className="portfolio-footer__branding">
              <a
                href="https://findvirtual.me"
                target="_blank"
                rel="noopener noreferrer"
                className="portfolio-footer__brand-link"
              >
                Powered by FindVirtual.me
              </a>
            </div>
          )}

          {/* Copyright */}
          <p className="portfolio-footer__copyright">
            &copy; {currentYear}{" "}
            {siteName ? (
              <>
                {siteName}. All rights reserved.
              </>
            ) : (
              "All rights reserved."
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
