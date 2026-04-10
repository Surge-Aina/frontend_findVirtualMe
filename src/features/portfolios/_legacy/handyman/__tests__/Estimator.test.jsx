    import { render, screen, fireEvent } from '@testing-library/react';
    import Estimator from '../Estimator.jsx';

    describe('Estimator', () => {
    it('asks to select a service initially', () => {
        render(<Estimator />);
        expect(screen.getAllByText(/select a service/i).length).toBeGreaterThan(0);
    });

    it('computes range for chosen service and units', () => {
        render(<Estimator />);

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'faucet' } });
        // number input appears
        const qty = screen.getByRole('spinbutton');
        expect(qty).toHaveValue(1);
        expect(screen.getByText(/\$120 - \$200/i)).toBeInTheDocument();

        fireEvent.change(qty, { target: { value: '3' } });
        expect(screen.getByText(/\$360 - \$600/i)).toBeInTheDocument();
    });

    it('updates when switching services', () => {
        render(<Estimator />);
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'painting' } });
        // 1 room: 350 - 700
        expect(screen.getByText(/\$350 - \$700/i)).toBeInTheDocument();
    });
    });
