import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';

interface Seat {
  id: string;
  name: string;
  section: string;
  is_available: boolean;
}

export function Seats() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchSeats();
    const subscription = supabase
      .channel('seats_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'seats' },
        () => {
          fetchSeats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedSection]);

  async function fetchSeats() {
    try {
      let query = supabase.from('seats').select('*');
      
      if (selectedSection !== 'all') {
        query = query.eq('section', selectedSection);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      setSeats(data || []);
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSeat || !startTime || !endTime || !user) return;

    try {
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        seat_id: selectedSeat.id,
        start_time: startTime,
        end_time: endTime,
        status: 'active',
      });

      if (error) throw error;

      // Update seat availability
      await supabase
        .from('seats')
        .update({ is_available: false })
        .eq('id', selectedSeat.id);

      setSelectedSeat(null);
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error booking seat:', error);
    }
  }

  const sections = ['all', 'Quiet Zone', 'Study Area', 'Group Study', 'Research Zone'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Available Seats
            </h3>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="mt-1 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section === 'all' ? 'All Sections' : section}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seats.map((seat) => (
              <div
                key={seat.id}
                className={`relative rounded-lg border ${
                  seat.is_available
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                } p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      Seat {seat.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">{seat.section}</p>
                  </div>
                  {seat.is_available && (
                    <button
                      onClick={() => setSelectedSeat(seat)}
                      className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedSeat && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Book Seat {selectedSeat.name}
            </h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label
                  htmlFor="start-time"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="end-time"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedSeat(null)}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}