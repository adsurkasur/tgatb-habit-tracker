import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';
import SyncConflictModal from '../components/sync-conflict-modal';
import enMessages from '../messages/en.json';

const samplePayload = {
  conflicts: [
    {
      id: 'h1',
      local: { id: 'h1', name: 'Local Habit', streak: 1 },
      remote: { id: 'h1', name: 'Remote Habit', streak: 2 },
      conflicts: { name: true, streak: true }
    }
  ],
};

describe('SyncConflictModal', () => {
  beforeEach(() => {
    localStorage.setItem('sync:conflict', JSON.stringify(samplePayload));
  });

  afterEach(() => {
    localStorage.removeItem('sync:conflict');
  });

  it('renders conflict item and allows choosing local or remote', async () => {
    const handleClose = vi.fn();
    render(
      <NextIntlClientProvider locale="en" messages={enMessages} timeZone="Asia/Jakarta">
        <SyncConflictModal open={true} onClose={handleClose} />
      </NextIntlClientProvider>
    );

    // should show item id (wait for effect to run)
    await screen.findByText(/Item: h1/);

    // local option radios should be present
    const localRadios = screen.getAllByLabelText(/Local/);
    expect(localRadios.length).toBeGreaterThan(0);

    // clicking Apply Selected should call storage updates (we can't inspect HabitStorage easily here)
    const applyBtn = screen.getByText(/Apply Selected/);
    fireEvent.click(applyBtn);

    // modal should close (onClose invoked)
    expect(handleClose).toHaveBeenCalled();
  });
});
