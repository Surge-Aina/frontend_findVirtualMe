    import React from "react";
    import "./HeroSubNav.css";

    export default function HeroSubNav() {
    // Smooth scroll helper
    const handleScroll = (e, targetId) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return (
        <nav className="hero-subnav">
        <ul>
            <li>
            <a href="#services" onClick={(e) => handleScroll(e, "services")}>
                Services
            </a>
            </li>
            <li>
            <a href="#portfolio" onClick={(e) => handleScroll(e, "portfolio")}>
                Our Work
            </a>
            </li>
            <li>
            <a href="#contact" onClick={(e) => handleScroll(e, "contact")}>
                Contact
            </a>
            </li>
        </ul>
        </nav>
    );
    }
