/*
  # Create Admin Role and User

  1. Changes
    - Add admin column to auth.users
    - Create policy for admin access
    - Set up initial admin user
*/

-- Add admin column to auth.users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN is_admin BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update policies for seats table to allow admin full access
CREATE POLICY "Admins can manage all seats"
  ON seats
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'satyamsharma21589@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'satyamsharma21589@gmail.com'
  );

-- Update policies for bookings table to allow admin full access
CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'satyamsharma21589@gmail.com'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'satyamsharma21589@gmail.com'
  );