// pages/portfolios/handyman/HandyManPage.jsx
import React, { useEffect, useState, useContext } from 'react'; // + useContext
import { useParams, Link } from 'react-router-dom';
import handymanAPI from './api.js';
import { AuthContext } from '../../../context/AuthContext';       // + AuthContext

import Hero from './Hero.jsx';
import Services from './Services.jsx';
import Portfolio from './Portfolio.jsx';
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
  const { id } = useParams();
  const { user } = useContext(AuthContext);                 // + get logged-in user
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOwner, setIsOwner] = useState(false);            // + derive ownership

  useEffect(() => {
    if (!id) {
      setError('Error: This page requires a portfolio ID to load.');
      setLoading(false);
      return;
    }

    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const { data } = await handymanAPI.get(`/api/handyman-template/${id}`);
        setData(data);

        // --- ownership check (no /me endpoints) ---
        const uid = user?.id || user?._id;
        const ownerId = data?.userId;
        setIsOwner(Boolean(uid && ownerId && String(uid) === String(ownerId)));
      } catch (err) {
        console.error(err);
        setError('Could not load this portfolio. It may not exist or there was a server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [id, user]); // recompute when user changes

  if (loading) return <div className="text-center p-10 font-bold">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-600 font-bold">{error}</div>;
  if (!data) return null;

  return (
    <div>
      {isOwner && (
        <div className="bg-yellow-200 text-center p-2 sticky top-0 z-50">
          <p>
            You are viewing your portfolio.{` `}
            <Link
              to={`/portfolios/handyman/${id}/edit`}
              className="font-bold underline text-blue-600"
            >
              Click here to edit
            </Link>.
          </p>
        </div>
      )}

      <main>
        <Hero content={data.hero} />
        <Services list={data.services} />
        <Portfolio templateId={id} />
        <ProcessTimeline steps={data.processSteps} />
        <Testimonials list={data.testimonials} />
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
};

export default HandymanPage;
