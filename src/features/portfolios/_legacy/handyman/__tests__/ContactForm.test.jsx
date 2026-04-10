    // mock must be first and must match the component's specifier: "./api"
    jest.mock('../api', () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: { request: { use: jest.fn() } },
    },
    }));

    import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
    import ContactForm from '../ContactForm.jsx';
    import api from '../api'; // <-- import the mocked module (matches jest.mock('../api'))

    describe('ContactForm', () => {
    const services = [
        { title: 'Plumbing' },
        { name: 'Electrical' }, // back-compat naming
    ];

    it('is disabled in demo mode (no templateId)', () => {
        render(<ContactForm services={services} contact={{ title: 'Get Your Free Estimate' }} />);

        expect(screen.getByRole('heading', { name: /get your free estimate/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toBeDisabled();
        expect(screen.getByLabelText(/phone number/i)).toBeDisabled();
        expect(screen.getByLabelText(/email address/i)).toBeDisabled();
        expect(screen.getByLabelText(/message/i)).toBeDisabled();

        const btn = screen.getByRole('button', { name: /request free estimate/i });
        expect(btn).toBeDisabled();
        expect(screen.getByRole('button', { name: /select services/i })).toBeInTheDocument();
    });

    it('enables fields when templateId is provided and posts payload', async () => {
        api.post.mockResolvedValueOnce({ data: { ok: true } });

        render(
        <ContactForm
            templateId="tmpl123"
            services={services}
            contact={{ title: 'Contact' }}
        />
        );

        fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Jess' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '555-111-2222' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'j@x.com' } });
        fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Fix sink' } });

        const trigger = screen.getByRole('button', { name: /select services/i });
        fireEvent.click(trigger);
        const menu = screen.getByRole('listbox');
        const plumbingRow = within(menu).getByText(/plumbing/i).closest('label');
        fireEvent.click(plumbingRow);

        fireEvent.click(screen.getByRole('button', { name: /request free estimate/i }));

        await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(1);
        const [url, payload] = api.post.mock.calls[0];
        expect(url).toBe('/api/handyman/inquiries');
        expect(payload).toMatchObject({
            name: 'Jess',
            phone: '555-111-2222',
            email: 'j@x.com',
            message: 'Fix sink',
            templateId: 'tmpl123',
            selectedServiceTitles: expect.arrayContaining(['Plumbing']),
        });
        });
    });
    });
