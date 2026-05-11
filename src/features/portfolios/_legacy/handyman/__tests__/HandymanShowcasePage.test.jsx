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
    import { render, screen } from '@testing-library/react';
    import { MemoryRouter } from 'react-router-dom';
    import HandymanShowcasePage from '../HandyManShowcasePage.jsx';

    describe('HandymanShowcasePage', () => {
    it('renders hero, services, static portfolio, testimonials, and contact', () => {
        render(
        <MemoryRouter>
            <HandymanShowcasePage />
        </MemoryRouter>
        );

        // hero title
        expect(
        screen.getByRole('heading', { name: /trusted handyman/i })
        ).toBeInTheDocument();

        // services section heading
        expect(screen.getByRole('heading', { name: /our services/i })).toBeInTheDocument();

        // portfolio section title
        expect(screen.getByRole('heading', { name: /quality craftsmanship/i })).toBeInTheDocument();

        // testimonials title default
        expect(screen.getByRole('heading', { name: /what our clients say/i })).toBeInTheDocument();

        // contact section title default
        expect(screen.getByRole('heading', { name: /get your free estimate/i })).toBeInTheDocument();
    });
    });
