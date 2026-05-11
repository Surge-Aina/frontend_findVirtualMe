    import { render, screen, within } from '@testing-library/react';
    import Services from '../Services.jsx';

    const list = [
    { icon: '💧', title: 'Plumbing', description: 'Pipes & faucets', bullets: ['Leak fix', 'Install sink'] },
    { icon: '💡', name: 'Electrical', desc: 'Lights & outlets', bullets: [] }, // back-compat paths
    ];

    describe('Services', () => {
    it('renders heading, intro, and service cards', () => {
        render(<Services heading="Our Services" intro="We do it all" list={list} />);
        expect(screen.getByRole('heading', { name: /our services/i })).toBeInTheDocument();
        expect(screen.getByText(/we do it all/i)).toBeInTheDocument();

        const cards = screen.getAllByRole('article');
        expect(cards).toHaveLength(2);

        const first = cards[0];
        expect(within(first).getByText('💧')).toBeInTheDocument();
        expect(within(first).getByRole('heading', { name: /plumbing/i })).toBeInTheDocument();
        expect(within(first).getByText(/pipes & faucets/i)).toBeInTheDocument();
        expect(within(first).getByText(/leak fix/i)).toBeInTheDocument();

        const second = cards[1];
        expect(within(second).getByRole('heading', { name: /electrical/i })).toBeInTheDocument();
        expect(within(second).queryByRole('list')).not.toBeInTheDocument(); // no bullets
    });

    it('falls back to default heading/intro when omitted', () => {
        render(<Services list={[]} />);
        expect(screen.getByRole('heading', { name: /our services/i })).toBeInTheDocument();
        expect(screen.getByText(/a one-call solution/i)).toBeInTheDocument();
    });
    });
