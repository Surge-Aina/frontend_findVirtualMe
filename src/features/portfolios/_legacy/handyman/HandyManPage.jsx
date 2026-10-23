// pages/portfolios/handyman/HandyManPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import handymanAPI from './api.js';
import { AuthContext } from "@/shared/context/AuthContext";
import { usePortfolio } from "@/shared/context/PortfolioContext.jsx";

import Hero from './Hero.jsx';
import Services from './Services.jsx';
import Portfolio from './Portfolio.jsx';
import ProcessTimeline from './ProcessTimeline.jsx';
import Testimonials from './Testimonials.jsx';
import ContactForm from './ContactForm.jsx';
import Footer from './Footer.jsx';
import HeroSubNav from './HeroSubNav.jsx';

import './Hero.css';
import './Services.css';
import './Estimator.css';
import './Portfolio.css';
import './ProblemIdentifier.css';
import './ProcessTimeline.css';
import './Testimonials.css';
import './ContactForm.css';
import './Footer.css';

const HandymanPage = ({ portfolioId }) => {
  const {  
    setPortfolioId,  
    setPortfolioType, 
    setPortfolioOwner,
    clearPortfolio
  } = usePortfolio();

  const { id: urlId } = useParams();
  const id = portfolioId || urlId;

  const { user } = useContext(AuthContext);
  console.log("User from context:", user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Error: This page requires a portfolio ID to load.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const { data } = await handymanAPI.get(`/api/handyman-template/${id}`);
        setData(data);
        const uid = user?.id || user?._id;
        const ownerId = data?.userId;
        setIsOwner(Boolean(uid && ownerId && String(uid) === String(ownerId)));
      } catch (err) {
        console.error(err);
        setError('Could not load this portfolio.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user]);

  // Set portfolio context when data is loaded
  useEffect(() => {
    if (!data) return;

    // Set portfolio context based on fetched data
    setPortfolioId(data._id);
    setPortfolioType("HandymanMainPortfolio");
    setPortfolioOwner({
      id: data.userId || null,
      name: data.name || "",
      email: data.email || ""
    });

    // Cleanup function after unmounting the component
    return () => clearPortfolio();
  }, [data]);

  if (loading) return <div className="text-center p-10 font-bold">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-600 font-bold">{error}</div>;
  if (!data) return null;

  return (
    <div>
      {isOwner && (
        <div className="bg-yellow-200 text-center p-2 sticky top-0 z-50">
          <p>
            You are viewing your portfolio.{` `}
            <Link to={`/portfolios/handyman/${id}/edit`} className="font-bold underline text-blue-600">
              Click here to edit
            </Link>.
          </p>
        </div>
      )}

      <main>
        <HeroSubNav />
        <Hero content={data.hero} />
        <Services
          list={data.services}
          heading={data.servicesSectionTitle}
          intro={data.servicesSectionIntro}
        />

        <Portfolio
          templateId={id}
          title={data.portfolioTitle}
          subtitle={data.portfolioSubtitle}
          allLabel={data.portfolioAllLabel}
        />

        <ProcessTimeline steps={data.processSteps} />
        <Testimonials list={data.testimonials} />

        {/* ✅ Pass templateId and the resolved contact info */}
        <ContactForm
          templateId={id}
          contact={{
            title:     data.contact?.title     ?? data.contactSectionTitle,
            subtitle:  data.contact?.subtitle  ?? data.contactSectionSubtitle,
            formTitle: data.contact?.formTitle ?? 'Ready to get started? Send us a message!',
            phone:     data.contact?.phone     ?? data.hero?.phoneNumber,
            email:     data.contact?.email     ?? 'contact@prohandy.com',
            hours:     data.contact?.hours     ?? 'Mon–Fri: 7AM–7PM',
            note:      data.contact?.note      ?? 'Weekend & emergency calls available'
          }}
          services={data.services}
        />
      </main>

      <Footer
        siteName={data.hero?.title || data.portfolioTitle || "Handyman Services"}
        showBranding={!data.hideBranding}
        socialLinks={data.socialLinks}
      />
    </div>
  );
};

export default HandymanPage;
