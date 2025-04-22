/*
  # Add Library Seats

  1. Changes
    - Insert 200 seats into the seats table
    - Seats are distributed across different sections:
      - Quiet Zone (A1-A50)
      - Study Area (B1-B50)
      - Group Study (C1-C50)
      - Research Zone (D1-D50)
*/

DO $$
DECLARE
  section_name TEXT;
  seat_prefix CHAR;
  i INT;
BEGIN
  -- Quiet Zone (A1-A50)
  FOR i IN 1..50 LOOP
    INSERT INTO seats (name, section, is_available)
    VALUES (
      'A' || LPAD(i::TEXT, 2, '0'),
      'Quiet Zone',
      true
    );
  END LOOP;

  -- Study Area (B1-B50)
  FOR i IN 1..50 LOOP
    INSERT INTO seats (name, section, is_available)
    VALUES (
      'B' || LPAD(i::TEXT, 2, '0'),
      'Study Area',
      true
    );
  END LOOP;

  -- Group Study (C1-C50)
  FOR i IN 1..50 LOOP
    INSERT INTO seats (name, section, is_available)
    VALUES (
      'C' || LPAD(i::TEXT, 2, '0'),
      'Group Study',
      true
    );
  END LOOP;

  -- Research Zone (D1-D50)
  FOR i IN 1..50 LOOP
    INSERT INTO seats (name, section, is_available)
    VALUES (
      'D' || LPAD(i::TEXT, 2, '0'),
      'Research Zone',
      true
    );
  END LOOP;
END $$;