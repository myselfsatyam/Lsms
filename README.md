Real-Time Library Management System :
This is a Real-Time Library Management System that allows users to manage books, check their availability, and perform operations such as borrowing and returning books. The application is built using react as the front-end framework and Supabase as the backend solution for authentication, database, and real-time features.

Features:<br>
•Real-Time Book Availability: Real-time updates on book availability across all users.<br>
•Book Borrowing/Returning: Users can borrow and return books, and the system updates instantly.<br>
•User Authentication: Allows users to sign up and log in via email and password.<br>
•Admin Dashboard: Admins can manage the book inventory (add, edit, delete books).<br>

Tech Stack:<br>
•Frontend: Vite (React) <br>
•Backend: Supabase<br>
•Database: Supabase Database (PostgreSQL) <br>
•Authentication: Supabase Authentication<br>
•Real-Time Data: Supabase Realtime<br>

Installation:<br>
Prerequisites:<br>

Steps to Run Locally:<br>
Clone the repository:<br>
git clone https://github.com/myselfsatyam/Lsms.git<br>
cd Lsms
Install dependencies:<br>
npm install
<br>
Set up Supabase:<br>
•Go to Supabase and create a new project.
•Create a new database schema for the library system and configure tables for books, users, and any other necessary data.
•Set up authentication via email/password in the Supabase console.
<br>
In the .env file, set the necessary Supabase keys:<br>
•VITE_SUPABASE_URL=<Your_Supabase_URL><br>
•VITE_SUPABASE_ANON_KEY=<Your_Supabase_Anon_Key>
<br>

Run the development server:<br>
•npm run dev<br>
The application should now be running on http://localhost:3000.


