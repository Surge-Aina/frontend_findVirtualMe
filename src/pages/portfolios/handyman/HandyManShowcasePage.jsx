// pages/portfolios/handyman/HandyManShowcasePage.jsx
import React from 'react';
import Hero from './Hero.jsx';
import Services from './Services.jsx';
import Portfolio from './Portfolio.jsx';
import ProcessTimeline from './ProcessTimeline.jsx';
import Testimonials from './Testimonials.jsx';
import ContactForm from './ContactForm.jsx';
import Footer from './Footer.jsx';
import HeroSubNav from './HeroSubNav.jsx';

// CSS
import './Hero.css';
import './Services.css';
import './Portfolio.css';        // reuses the same card/grid classes
import './ProcessTimeline.css';
import './Testimonials.css';
import './ContactForm.css';
import './Footer.css';

const sampleProjects = [
  {
    title: 'Kitchen Renovation',
    subtitle: 'New cabinets, counters & lighting',
    category: 'Kitchen',
    beforeImageUrl:
      'https://www.homestratosphere.com/wp-content/uploads/2018/09/modern-kitchen-design-photo2018-09-12-at-2.36.56-PM-8.jpg',
    afterImageUrl:
      'https://www.homestratosphere.com/wp-content/uploads/2018/09/modern-kitchen-design-photo2018-09-12-at-2.36.56-PM-8.jpg',
  },
  {
    title: 'Bathroom Remodel',
    subtitle: 'Modern fixtures and tile work',
    category: 'Bathroom',
    beforeImageUrl:
      'https://i.pinimg.com/originals/e0/0b/0e/e00b0ee79d4f3927033d3e4aef830568.jpg',
    afterImageUrl:
      'https://i.pinimg.com/originals/e0/0b/0e/e00b0ee79d4f3927033d3e4aef830568.jpg',
  },
  {
    title: 'Living Room Makeover',
    subtitle: 'New flooring & paint',
    category: 'Living Room',
    beforeImageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop',
    afterImageUrl:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
  },
  {
    title: 'Deck Restoration',
    subtitle: 'Sanding, staining & board repairs',
    category: 'Exterior',
    beforeImageUrl:
      'https://tse2.mm.bing.net/th/id/OIP.Lyc468psMZ8-Vfcg8v6lTAHaEu?pid=Api&P=0&w=300&h=300',
    afterImageUrl:
      'https://tse2.mm.bing.net/th/id/OIP.Lyc468psMZ8-Vfcg8v6lTAHaEu?pid=Api&P=0&w=300&h=300',
  },
];

const HandymanShowcasePage = () => {
  const showcaseData = {
    hero: {
      title: 'Trusted Handyman for Home Repairs & Maintenance(CICD CHECK)',
      subtitle: 'Licensed, Insured, and Ready to Help. Call us today!',
      phoneNumber: '(123) 456-7890',
      imageUrl:
        'https://handymanraleighnc.com/wp-content/uploads/2019/11/Handyman-Services-AdobeStock_268881530-compressed-1024x683.jpg',
    },
    servicesSectionTitle: 'Our Services',
    servicesSectionIntro:
      "A One-Call Solution for Your To-Do List. We handle a wide range of home maintenance and repair solutions so you don't have to juggle multiple contractors.",
    services: [
      { icon: '🔧', title: 'General Repairs', description: 'From squeaky doors to drywall patches.', bullets: ['Drywall repair', 'Door & window fixes', 'Furniture assembly', 'Garage door repair'] },
      { icon: '🔨', title: 'Painting Services', description: 'Interior & exterior painting.', bullets: ['Interior painting', 'Exterior painting', 'Pressure washing', 'Staining & finishing'] },
      { icon: '💡', title: 'Electrical Work', description: 'Safe and reliable installs.', bullets: ['Light installation', 'Outlet repair', 'Ceiling fans', 'Switch replacement'] },
      { icon: '💧', title: 'Plumbing Services', description: 'Quick plumbing repairs & installs.', bullets: ['Faucet repair', 'Toilet install', 'Pipe fixes', 'Water heater service'] },
      { icon: '🔨', title: 'Carpentry', description: 'Custom woodwork & repairs.', bullets: ['Custom shelving', 'Trim install', 'Deck repair', 'Cabinet install'] },
      { icon: '🌳', title: 'Home Maintenance', description: 'Regular upkeep services.', bullets: ['Seasonal maintenance', 'Gutter cleaning', 'Weatherproofing', 'Safety inspections'] },
    ],
    processSteps: [
      { number: 1, title: 'Request a Quote', description: 'Fill out our form or give us a call.' },
      { number: 2, title: 'We Confirm Details', description: 'We’ll contact you to confirm the job scope.' },
      { number: 3, title: 'You Approve the Price', description: 'Get a firm, upfront price. No surprises.' },
      { number: 4, title: 'We Do the Work', description: 'We complete the job professionally and on time.' },
      { number: 5, title: 'Guaranteed Satisfaction', description: 'We ensure you’re 100% happy with the result.' },
    ],
    testimonials: [
      { name: 'Jane D.', quote: '"Incredibly reliable and professional. The job was done perfectly and on time!"' },
      { name: 'John S.', quote: '"Finally found a handyman I can trust. Highly recommended for any home repair."' },
    ],
  };

  return (
    <div>
      <main>
        <HeroSubNav />
        <Hero content={showcaseData.hero} />

        <Services
          list={showcaseData.services}
          heading={showcaseData.servicesSectionTitle}
          intro={showcaseData.servicesSectionIntro}
        />

        {/* ✅ Static Projects via shared Portfolio component (no fetching) */}
        <Portfolio
          title="Quality Craftsmanship You Can See"
          subtitle="See the difference our expert handyman services make. Browse our before and after gallery to witness the transformations we’ve completed for satisfied customers."
          allLabel="All"
          items={sampleProjects}
        />

        <ProcessTimeline steps={showcaseData.processSteps} />
        <Testimonials list={showcaseData.testimonials} />
        <ContactForm services={showcaseData.services} />
      </main>
      <Footer siteName="Handyman Services" />
    </div>
  );
};

export default HandymanShowcasePage;
