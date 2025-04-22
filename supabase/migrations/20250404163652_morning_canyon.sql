/*
  # Library Seating Management System Schema

  1. New Tables
    - `seats`
      - `id` (uuid, primary key)
      - `name` (text) - Seat identifier (e.g., "A1", "B2")
      - `section` (text) - Library section (e.g., "Quiet Zone", "Group Study")
      - `is_available` (boolean) - Current availability status
      - `created_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `seat_id` (uuid) - References seats
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `status` (text) - Booking status (active, completed, cancelled)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create seats table
CREATE TABLE IF NOT EXISTS seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section text NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  seat_id uuid REFERENCES seats NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policies for seats
CREATE POLICY "Anyone can view seats"
  ON seats
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);