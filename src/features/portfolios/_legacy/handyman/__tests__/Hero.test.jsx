    import { render, screen } from '@testing-library/react';
    import Hero from '../Hero.jsx';

    describe('Hero', () => {
    it('renders title, subtitle, phone, and CTA with defaults', () => {
        render(<Hero content={{}} />);

        expect(
        screen.getByRole('heading', { name: /trusted handyman/i })
        ).toBeInTheDocument();

        expect(
        screen.getByText(/licensed, insured/i)
        ).toBeInTheDocument();

        // CTA button navigates to #contact
        const cta = screen.getByRole('link', { name: /request a free estimate/i });
        expect(cta).toHaveAttribute('href', '#contact');

        // phone pill should dial digits-only href
        const phone = screen.getByRole('link', { name: /\(123\) 456-7890/i });
        expect(phone).toHaveAttribute('href', 'tel:1234567890');

        // shows image with alt
        expect(screen.getByAltText(/handyman at work/i)).toBeInTheDocument();
    });

    it('uses provided content overrides', () => {
        render(
        <Hero content={{
            title: 'X Handyman',
            subtitle: 'Call now',
            phoneNumber: '(555) 777-9999',
            ctaText: 'Book Now',
        }} />
        );
        expect(screen.getByRole('heading', { name: /x handyman/i })).toBeInTheDocument();
        expect(screen.getByText(/call now/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /book now/i })).toHaveAttribute('href', '#contact');
        expect(screen.getByRole('link', { name: /\(555\) 777-9999/i })).toHaveAttribute('href', 'tel:5557779999');
    });
    });
