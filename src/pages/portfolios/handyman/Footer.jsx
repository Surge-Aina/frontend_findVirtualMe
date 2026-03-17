import React from 'react';
import PrivacyPolicyFooterLink from "../../../components/PrivacyPolicy/PrivacyPolicyFooterLink";
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        &copy; 2025 HandyMan Services. All Rights Reserved.{" "}
        <PrivacyPolicyFooterLink
          className="underline hover:opacity-90"
          label="Privacy Policy"
        />
      </p>
    </footer>
  );
};

export default Footer;