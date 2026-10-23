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

    import { render, screen, waitFor } from '@testing-library/react';
    import Portfolio from '../Portfolio.jsx';
    // Import the mocked module *after* jest.mock
    import api from '../api.js';

    test('Portfolio fetches projects when templateId is provided', async () => {
    api.get.mockResolvedValueOnce({
        data: [{ title: 'Fetched', category: 'Kitchen', beforeImageUrl: 'b.jpg', afterImageUrl: 'a.jpg' }],
    });

    render(<Portfolio templateId="id123" />);

    await waitFor(() => {
        expect(screen.getByText(/fetched/i)).toBeInTheDocument();
    });
    });
