import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GroupBuilder } from '../components/GroupBuilder';

const mockToast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}));

vi.mock('sonner@2.0.3', () => ({
  toast: mockToast,
}));

describe('GroupBuilder', () => {
  const mockProps = {
    availableNames: ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank'],
    absentNames: ['Grace', 'Henry'],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<GroupBuilder {...mockProps} />);
    
    expect(screen.getByText('Gruppeneinstellungen')).toBeInTheDocument();
    expect(screen.getByText('Nach Gruppengröße')).toBeInTheDocument();
    expect(screen.getByText('Nach Anzahl Gruppen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gruppen erstellen/i })).toBeInTheDocument();
  });

  it('shows correct statistics', () => {
    render(<GroupBuilder {...mockProps} />);
    
    expect(screen.getByText('Anwesend:')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // 6 present students
    expect(screen.getByText('Abwesend:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 absent students
  });

  it('creates groups by size', async () => {
    render(<GroupBuilder {...mockProps} />);
    
    // Set group size to 2
    const groupSizeInput = screen.getByLabelText('Gruppengröße');
    fireEvent.change(groupSizeInput, { target: { value: '2' } });
    
    // Click create groups
    const createButton = screen.getByRole('button', { name: /gruppen erstellen/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Gruppen erstellt'));
    });
    
    // Should create 3 groups (6 students / 2 per group)
    expect(screen.getByText('Generierte Gruppen (3)')).toBeInTheDocument();
  });

  it('creates groups by count', async () => {
    render(<GroupBuilder {...mockProps} />);
    
    // Switch to count mode
    const countRadio = screen.getByLabelText('Nach Anzahl Gruppen');
    fireEvent.click(countRadio);
    
    // Set group count to 2
    const groupCountInput = screen.getByLabelText('Anzahl Gruppen');
    fireEvent.change(groupCountInput, { target: { value: '2' } });
    
    // Click create groups
    const createButton = screen.getByRole('button', { name: /gruppen erstellen/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Gruppen erstellt'));
    });
    
    // Should create 2 groups
    expect(screen.getByText('Generierte Gruppen (2)')).toBeInTheDocument();
  });

  it('shows absent students', () => {
    render(<GroupBuilder {...mockProps} />);
    
    expect(screen.getByText('Abwesende Schüler:innen (2)')).toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
    expect(screen.getByText('Henry')).toBeInTheDocument();
  });

  it('handles empty available names', async () => {
    render(<GroupBuilder availableNames={[]} absentNames={['Alice', 'Bob']} />);
    
    const createButton = screen.getByRole('button', { name: /gruppen erstellen/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Keine anwesenden Schüler:innen verfügbar');
    });
  });

  it('validates group size input', async () => {
    render(<GroupBuilder {...mockProps} />);
    
    // Set invalid group size (larger than available students)
    const groupSizeInput = screen.getByLabelText('Gruppengröße');
    fireEvent.change(groupSizeInput, { target: { value: '10' } });
    
    const createButton = screen.getByRole('button', { name: /gruppen erstellen/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Ungültige Gruppengröße');
    });
  });

  it('resets groups when reset button is clicked', async () => {
    render(<GroupBuilder {...mockProps} />);
    
    // First create groups
    const createButton = screen.getByRole('button', { name: /gruppen erstellen/i });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Generierte Gruppen/)).toBeInTheDocument();
    });
    
    // Then reset
    const resetButton = screen.getByRole('button', { name: /zurücksetzen/i });
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Gruppen zurückgesetzt');
    });
  });
});