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
    import userEvent from '@testing-library/user-event';
    import ContactForm from '../ContactForm.jsx';
    import api from '../api'; // <-- import the mocked module (matches jest.mock('../api'))

    describe('ContactForm', () => {
    const services = [
        { title: 'Plumbing' },
        { name: 'Electrical' }, // back-compat naming
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

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

    it('submits multiple selected services and resets the form after success', async () => {
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
        fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Fix sink and lights' } });

        fireEvent.click(screen.getByRole('button', { name: /select services/i }));
        const menu = screen.getByRole('listbox');
        fireEvent.click(within(menu).getByText(/plumbing/i).closest('label'));
        fireEvent.click(within(menu).getByText(/electrical/i).closest('label'));

        expect(screen.getByRole('button', { name: /plumbing,\s*electrical/i })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /request free estimate/i }));

        await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(1);
        });

        expect(api.post.mock.calls[0][1]).toMatchObject({
        selectedServiceTitles: ['Plumbing', 'Electrical'],
        });

        await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toHaveValue('');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('');
        expect(screen.getByLabelText(/email address/i)).toHaveValue('');
        expect(screen.getByLabelText(/message/i)).toHaveValue('');
        expect(screen.getByRole('button', { name: /select services/i })).toBeInTheDocument();
        });
    });

    it('prevents duplicate submissions while a request is in flight', async () => {
        const user = userEvent.setup();
        let resolveRequest;
        api.post.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveRequest = resolve;
        })
        );

        render(
        <ContactForm
            templateId="tmpl123"
            services={services}
            contact={{ title: 'Contact' }}
        />
        );

        await user.type(screen.getByLabelText(/full name/i), 'Jess');
        await user.type(screen.getByLabelText(/phone number/i), '555-111-2222');
        await user.type(screen.getByLabelText(/email address/i), 'j@x.com');
        await user.type(screen.getByLabelText(/message/i), 'Fix sink');

        const submitButton = screen.getByRole('button', { name: /request free estimate/i });
        await user.click(submitButton);

        expect(api.post).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();

        await user.click(screen.getByRole('button', { name: /sending/i }));
        expect(api.post).toHaveBeenCalledTimes(1);

        resolveRequest({ data: { ok: true } });
        await waitFor(() => {
        expect(screen.getByRole('button', { name: /request free estimate/i })).toBeInTheDocument();
        });
    });
    });
