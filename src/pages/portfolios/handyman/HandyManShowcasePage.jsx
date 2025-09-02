import React from 'react';
import Hero from './Hero.jsx';
import Services from './Services.jsx';
import Portfolio from './Portfolio.jsx';
import ProcessTimeline from './ProcessTimeline.jsx';
import Testimonials from './Testimonials.jsx';
import ContactForm from './ContactForm.jsx';
import Footer from './Footer.jsx';

// Import all the necessary CSS files
import './Hero.css';
import './Services.css';
import './Portfolio.css';
import './ProcessTimeline.css';
import './Testimonials.css';
import './ContactForm.css';
import './Footer.css';

const HandymanShowcasePage = () => {
  // This is the hardcoded data for your main public page
  const showcaseData = {
    hero: {
      title: 'Trusted Handyman for Home Repairs & Maintenance',
      subtitle: 'Licensed, Insured, and Ready to Help. Call us today!',
      phoneNumber: '(123) 456-7890'
    },
    services: [
        { icon: '💧', name: 'Plumbing Repairs' },
        { icon: '💡', name: 'Electrical Work' },
        { icon: '🔨', name: 'Drywall & Painting' },
        { icon: '🚪', name: 'Door Installation' },
        { icon: '🔧', name: 'Fixture Replacement' },
        { icon: '🌳', name: 'Fence & Gate Repair' },
    ],
    processSteps: [
      { number: 1, title: 'Request a Quote', description: 'Fill out our form or give us a call.' },
      { number: 2, title: 'We Confirm Details', description: 'We\'ll contact you to confirm the job scope.' },
      { number: 3, title: 'You Approve the Price', description: 'Get a firm, upfront price. No surprises.' },
      { number: 4, title: 'We Do the Work', description: 'We complete the job professionally and on time.' },
      { number: 5, title: 'Guaranteed Satisfaction', description: 'We ensure you\'re 100% happy with the result.' },
    ],
    testimonials: [
        { name: 'Jane D.', quote: '"Incredibly reliable and professional. The job was done perfectly and on time!"' },
        { name: 'John S.', quote: '"Finally found a handyman I can trust. Highly recommended for any home repair."' },
    ]
  };

  return (
    <div>
      <main>
        <Hero content={showcaseData.hero} />
        <Services list={showcaseData.services} />
        <Portfolio />
        <ProcessTimeline steps={showcaseData.processSteps} />
        <Testimonials list={showcaseData.testimonials} />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default HandymanShowcasePage;