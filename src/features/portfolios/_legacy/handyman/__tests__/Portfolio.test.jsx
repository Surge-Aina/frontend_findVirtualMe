    jest.mock('../api.js', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() } },
    },
    }));

    import { render, screen, fireEvent, within } from '@testing-library/react';
    import Portfolio from '../Portfolio.jsx';

    const items = [
    { title: 'Kitchen Reno', subtitle: 'Counters', category: 'Kitchen', beforeImageUrl: 'b1.jpg', afterImageUrl: 'a1.jpg' },
    { title: 'Bath Remodel', subtitle: 'Tile', category: 'Bathroom', beforeImageUrl: 'b2.jpg', afterImageUrl: 'a2.jpg' },
    { title: 'Deck', subtitle: 'Stain', category: 'Exterior', beforeImageUrl: 'b3.jpg', afterImageUrl: 'a3.jpg' },
    ];

    describe('Portfolio (static items)', () => {
    it('renders title/subtext and category filters', () => {
        render(
        <Portfolio
            title="Quality Craftsmanship You Can See"
            subtitle="Sub"
            allLabel="All"
            items={items}
        />
        );

        expect(screen.getByRole('heading', { name: /quality craftsmanship/i })).toBeInTheDocument();
        expect(screen.getByText('Sub')).toBeInTheDocument();

        const filterBar = screen.getByText('All').closest('div');
        expect(within(filterBar).getByRole('button', { name: 'All' })).toBeInTheDocument();
        expect(within(filterBar).getByRole('button', { name: 'Kitchen' })).toBeInTheDocument();
        expect(within(filterBar).getByRole('button', { name: 'Bathroom' })).toBeInTheDocument();
        expect(within(filterBar).getByRole('button', { name: 'Exterior' })).toBeInTheDocument();
    });

    it('filters projects by category and shows 2-up grid', () => {
        render(<Portfolio allLabel="All" items={items} />);
        // default filter is "All"
        let cards = screen.getAllByRole('article');
        expect(cards).toHaveLength(3);

        fireEvent.click(screen.getByRole('button', { name: 'Kitchen' }));
        cards = screen.getAllByRole('article');
        expect(cards).toHaveLength(1);
        expect(within(cards[0]).getByText(/kitchen reno/i)).toBeInTheDocument();

        // each card shows category pill (top-right)
        const firstCard = screen.getAllByRole('article')[0];
        expect(within(firstCard).getByText('Kitchen')).toBeInTheDocument();

        // Before/After images with links
        const beforeLink = screen.getByRole('link', { name: /kitchen reno before/i });
        expect(beforeLink).toHaveAttribute('href', 'b1.jpg');
        const afterLink = screen.getByRole('link', { name: /kitchen reno after/i });
        expect(afterLink).toHaveAttribute('href', 'a1.jpg');
    });

    it('shows an empty state when there are no projects', () => {
        render(<Portfolio allLabel="All" items={[]} />);

        expect(screen.getByText(/no projects yet/i)).toBeInTheDocument();
        expect(screen.queryAllByRole('article')).toHaveLength(0);
    });
    });
