import React from 'react';

import Hero from './Hero.jsx';
import Services from './Services.jsx';
import Estimator from './Estimator.jsx';
import Portfolio from './Portfolio.jsx';
import ProblemIdentifier from './ProblemIdentifier.jsx';
import ProcessTimeline from './ProcessTimeline.jsx';
import Testimonials from './Testimonials.jsx';
import ContactForm from './ContactForm.jsx';
import Footer from './Footer.jsx';

import './Hero.css';
import './Services.css';
import './Estimator.css';
import './Portfolio.css';
import './ProblemIdentifier.css';
import './ProcessTimeline.css';
import './Testimonials.css';
import './ContactForm.css';
import './Footer.css';


const HandymanPage = () => {
  return (
    <div>
      {/* The NavBar is likely handled by the main App.jsx, so we omit it here */}
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <ProblemIdentifier />
        <ProcessTimeline />
        <Estimator />
        <Testimonials />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default HandymanPage;