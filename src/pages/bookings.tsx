import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth-store';

interface Booking {
  id: string;
  seat: {
    name: string;
    section: string;
  };
  start_time: string;
  end_time: string;
  status: string;
}

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          status,
          seat:seats (
            name,
            section
          )
        `)
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId: string, seatId: string) {
    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      const { error: seatError } = await supabase
        .from('seats')
        .update({ is_available: true })
        .eq('id', seatId);

      if (seatError) throw seatError;

      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            My Bookings
          </h3>
          <div className="mt-4 space-y-4">
            {bookings.length === 0 ? (
              <p className="text-gray-500">No bookings found.</p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Seat {booking.seat.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {booking.seat.section}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>
                      Start:{' '}
                      {format(
                        new Date(booking.start_time),
                        'MMM d, yyyy h:mm a'
                      )}
                    </p>
                    <p>
                      End:{' '}
                      {format(new Date(booking.end_time), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  {booking.status === 'active' && (
                    <button
                      onClick={() =>
                        handleCancelBooking(booking.id, booking.seat.id)
                      }
                      className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}