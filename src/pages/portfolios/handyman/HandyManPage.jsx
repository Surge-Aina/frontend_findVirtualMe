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
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // This is a placeholder for your real authentication logic
  const isOwner = true; // In a real app, you would check if the logged-in user's ID matches the portfolio's userId

  useEffect(() => {
    if (!id) {
      setError('Error: This page requires a portfolio ID to load.');
      setLoading(false);
      return;
    }

    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await handymanAPI.get(`/api/handyman-template/${id}`);
        setData(response.data);
      } catch (err) {
        setError('Could not load this portfolio. It may not exist or there was a server error.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [id]);

  if (loading) return <div className="text-center p-10 font-bold">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-600 font-bold">{error}</div>;
  if (!data) return null;

  return (
    <div>
      {isOwner && (
        <div className="bg-yellow-200 text-center p-2 sticky top-0 z-50">
          <p>You are viewing your portfolio. <Link to={`/portfolios/handyman/${id}/edit`} className="font-bold underline text-blue-600">Click here to edit</Link>.</p>
        </div>
      )}
      <main>
        {/* Pass fetched data down to each component */}
        <Hero content={data.hero} />
        <Services list={data.services} />
        <Portfolio />
        <ProcessTimeline steps={data.processSteps} />
        <Testimonials list={data.testimonials} />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
};

export default HandymanPage;