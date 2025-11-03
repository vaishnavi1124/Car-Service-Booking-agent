
# backend/backend/main.py
import mysql.connector
from fastapi.middleware.cors import CORSMiddleware
from mysql.connector import Error
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date
from dotenv import load_dotenv
import os
import uvicorn
import re 
from passlib.context import CryptContext

load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- Pydantic Models for Data Validation ---

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class CustomerCheckRequest(BaseModel):
    phone_number: int

class VehicleResponse(BaseModel):
    make: str
    model: str
    registration_no: str

class CustomerCheckResponse(BaseModel):
    customer_id: str
    vehicles: List[VehicleResponse]

class AvailabilityRequest(BaseModel):
    preferred_date: date

class AvailabilityResponse(BaseModel):
    Date: date
    sc_id: str
    service_center_name: str

class BookingRequest(BaseModel):
    customer_id: str
    registration_no: str
    sc_id: str
    appointment_date: date

class CancellationRequest(BaseModel):
    registration_no: str
    appointment_date: date

class NewCustomerRequest(BaseModel):
    full_name: str
    phone_number: int
    registration_no: str

class NewCustomerResponse(BaseModel):
    message: str
    customer_id: str
    registration_no: str

# --- NEW MODELS FOR DASHBOARD (DEFINED *BEFORE* THEY ARE USED) ---

class BookingDetail(BaseModel):
    customer_name: str
    vehicle: str  # e.g., "MH14AB1234"
    appointment_date: str # Using str for simplicity on frontend
    status: str

class MonthlyBreakdown(BaseModel):
    month: str
    bookings: int
    cancellations: int

# --- UPDATED DASHBOARD RESPONSE MODEL ---
# This model now correctly references the models defined above
class DashboardStatsResponse(BaseModel):
    daily_bookings: int
    weekly_bookings: int
    monthly_bookings: int
    total_cancellations: int
    todays_bookings_list: List[BookingDetail]
    daily_bookings_chart: Dict[str, int]
    yearly_breakdown_chart: List[MonthlyBreakdown]


# --- FastAPI Application Instance ---
app = FastAPI(
    title="Car Servicing API",
    description="API to manage car service appointments for the 'Rahul' assistant.",
    version="1.0.0"
)

origins = [
    "http://localhost:5173", # The origin of your React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)

# --- Database Configuration ---
DB_CONFIG = {
    'host': os.getenv("DB_HOST"),
    'user': os.getenv("DB_USER"),
    'password': os.getenv("DB_PASSWORD"),
    'database': os.getenv("DB_NAME")
}

# --- Database Connection Helper ---
def get_db_connection():
    """Establishes a connection to the MySQL database."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            return conn
    except Error as e:
        print(f"Error connecting to MySQL Database: {e}")
        return None

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"message": "Welcome to the Car Servicing API for Rahul!"}

@app.post("/check-customer", response_model=CustomerCheckResponse)
def check_customer(request: CustomerCheckRequest):
    print(f"\n[INFO] Received request for /check-customer: {request.model_dump_json()}")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed.")
    
    cursor = conn.cursor(dictionary=True, buffered=True)
    try:
        query_customer = "SELECT customer_id FROM customers WHERE PHONE_NUMBER = %s"
        cursor.execute(query_customer, (str(request.phone_number),))
        customer = cursor.fetchone()

        if not customer:
            print("[ERROR] Customer not found.")
            raise HTTPException(
                status_code=404,
                detail="I'm sorry, I couldn't find a record matching that phone number."
            )
        
        customer_id = customer['customer_id']
        print(f"[SUCCESS] Found customer_id: {customer_id}")

        query_vehicles = "SELECT make, model, registration_no FROM vehicles WHERE customer_id = %s"
        cursor.execute(query_vehicles, (customer_id,))
        vehicles = cursor.fetchall()

        if not vehicles:
            print(f"[ERROR] No vehicles found for customer_id: {customer_id}")
            raise HTTPException(
                status_code=404,
                detail="I can see your profile, but it seems no vehicle information is in my system."
            )
        
        print(f"[SUCCESS] Found {len(vehicles)} vehicle(s) for customer.")
        return CustomerCheckResponse(customer_id=customer_id, vehicles=vehicles)

    finally:
        cursor.close()
        conn.close()



@app.post("/create-customer", response_model=NewCustomerResponse)
def create_customer(request: NewCustomerRequest):
    """Creates a new customer and their first vehicle in the database."""
    print(f"\n[INFO] Received request for /create-customer: {request.model_dump_json()}")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed.")

    cursor = conn.cursor(buffered=True)
    try:
        # Generate a new customer ID
        cursor.execute("SELECT customer_id FROM customers ORDER BY customer_id DESC LIMIT 1")
        last_id_record = cursor.fetchone()
        if last_id_record:
            last_id_num = int(re.search(r'\d+', last_id_record[0]).group())
            new_id_num = last_id_num + 1
            new_customer_id = f"C{new_id_num:03d}"
        else:
            new_customer_id = "C001"
        
        print(f"[INFO] Generated new customer_id: {new_customer_id}")

        # --- FIX: REMOVED conn.start_transaction() ---
        # The transaction starts implicitly with the first cursor.execute()

        # Insert into customers table
        insert_customer_query = """
            INSERT INTO customers (customer_id, FULL_NAME, PHONE_NUMBER)
            VALUES (%s, %s, %s)
        """
        customer_data = (new_customer_id, request.full_name, str(request.phone_number))
        cursor.execute(insert_customer_query, customer_data)
        print(f"[SUCCESS] Inserted new customer: {new_customer_id}")

        # Insert into vehicles table
        insert_vehicle_query = """
            INSERT INTO vehicles (customer_id, registration_no)
            VALUES (%s, %s)
        """
        vehicle_data = (new_customer_id, request.registration_no)
        cursor.execute(insert_vehicle_query, vehicle_data)
        print(f"[SUCCESS] Inserted new vehicle for {new_customer_id}")

        conn.commit()
        print("[SUCCESS] Transaction committed.")
        return NewCustomerResponse(
            message="Registration successful! We can now proceed with booking your appointment.",
            customer_id=new_customer_id,
            registration_no=request.registration_no
        )

    except mysql.connector.IntegrityError as e:
        conn.rollback()
        print(f"[ERROR] IntegrityError: {e}")
        raise HTTPException(
            status_code=409,
            detail=f"This vehicle registration number ({request.registration_no}) already exists in our system."
        )
    except Error as e:
        conn.rollback()
        print(f"[CRITICAL] Database error during customer creation: {e}. Rolled back transaction.")
        raise HTTPException(status_code=500, detail=f"A database error occurred during registration.")
    finally:
        cursor.close()
        conn.close()


@app.post("/availability", response_model=List[AvailabilityResponse])
def check_availability(request: AvailabilityRequest):
    print(f"\n[INFO] Received request for /availability with data: {request.model_dump_json()}")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed.")
    
    cursor = conn.cursor(dictionary=True)
    try:
        query = """
            SELECT a.Date, a.sc_id, sc.name as service_center_name
            FROM appointments a
            JOIN service_centers sc ON a.sc_id = sc.sc_id
            WHERE a.Date = %s AND a.Available_slots > 0
            ORDER BY a.Date, sc.name;
        """
        cursor.execute(query, (request.preferred_date,))
        availability = cursor.fetchall()
        print(f"[SUCCESS] Found {len(availability)} available slots on {request.preferred_date}.")
        if not availability:
            return []
        return availability
    finally:
        cursor.close()
        conn.close()


@app.post("/book-appointment")
def create_booking(booking: BookingRequest):
    print(f"\n[INFO] Received request for /book-appointment: {booking.model_dump_json()}")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed.")

    cursor = conn.cursor()
    try:
        conn.start_transaction()
        insert_booking_query = """
            INSERT INTO bookings (customer_id, registration_no, sc_id, appointment_date, appointment_status)
            VALUES (%s, %s, %s, %s, 'Confirmed')
        """
        booking_data = (booking.customer_id, booking.registration_no, booking.sc_id, booking.appointment_date)
        cursor.execute(insert_booking_query, booking_data)
        print("[SUCCESS] Inserted new record into bookings table.")

        update_slots_query = """
            UPDATE appointments SET Available_slots = Available_slots - 1
            WHERE Date = %s AND sc_id = %s AND Available_slots > 0
        """
        cursor.execute(update_slots_query, (booking.appointment_date, booking.sc_id))
        
        if cursor.rowcount == 0:
            conn.rollback()
            raise HTTPException(status_code=409, detail="The selected slot is no longer available.")
        
        conn.commit()
        return {"message": "Appointment confirmed successfully!"}

    except Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while booking: {e}")
    finally:
        cursor.close()
        conn.close()

@app.post("/cancel-appointment")
def cancel_booking(request: CancellationRequest):
    print(f"\n[INFO] Received request for /cancel-appointment: {request.model_dump_json()}")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed.")

    cursor = conn.cursor(dictionary=True, buffered=True)
    try:
        conn.start_transaction()
        find_booking_query = "SELECT sc_id FROM bookings WHERE registration_no = %s AND appointment_date = %s AND appointment_status != 'Cancelled'"
        cursor.execute(find_booking_query, (request.registration_no, request.appointment_date))
        booking = cursor.fetchone()

        if not booking:
            conn.rollback()
            raise HTTPException(status_code=404, detail="I couldn't find an active booking with that registration number and date.")
        
        sc_id = booking['sc_id']
        update_booking_query = "UPDATE bookings SET appointment_status = 'Cancelled' WHERE registration_no = %s AND appointment_date = %s"
        cursor.execute(update_booking_query, (request.registration_no, request.appointment_date))

        if cursor.rowcount == 0:
            conn.rollback()
            raise HTTPException(status_code=404, detail="Could not find the booking to cancel.")
            
        update_slots_query = "UPDATE appointments SET Available_slots = Available_slots + 1 WHERE Date = %s AND sc_id = %s"
        cursor.execute(update_slots_query, (request.appointment_date, sc_id))
        conn.commit()
        return {"message": "Your appointment has been successfully cancelled."}

    except Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while cancelling: {e}")
    finally:
        cursor.close()
        conn.close()
        

# --- NEW /dashboard-stats ENDPOINT ---
@app.get("/dashboard-stats", response_model=DashboardStatsResponse)
def get_dashboard_stats():
    """Retrieves all booking statistics for the new admin dashboard."""
    print("\n[INFO] Received request for /dashboard-stats")
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed.")

    cursor = conn.cursor(buffered=True, dictionary=True) 
    
    try:
        # --- 1. Stat Card Queries ---
        cursor.execute("SELECT COUNT(*) AS count FROM bookings WHERE appointment_date = CURDATE() AND appointment_status = 'Confirmed'")
        daily_count = cursor.fetchone()['count']

        cursor.execute("SELECT COUNT(*) AS count FROM bookings WHERE appointment_date BETWEEN CURDATE() - INTERVAL 6 DAY AND CURDATE() AND appointment_status = 'Confirmed'")
        weekly_count = cursor.fetchone()['count']

        cursor.execute("SELECT COUNT(*) AS count FROM bookings WHERE YEAR(appointment_date) = YEAR(CURDATE()) AND MONTH(appointment_date) = MONTH(CURDATE()) AND appointment_status = 'Confirmed'")
        monthly_count = cursor.fetchone()['count']
        
        # New card: Cancellations this month
        cursor.execute("SELECT COUNT(*) AS count FROM bookings WHERE YEAR(appointment_date) = YEAR(CURDATE()) AND MONTH(appointment_date) = MONTH(CURDATE()) AND appointment_status = 'Cancelled'")
        cancellations_count = cursor.fetchone()['count']

        # --- 2. Today's Bookings Table Query ---
        query_table = """
            SELECT 
                c.FULL_NAME as customer_name, 
                b.registration_no as vehicle, 
                CAST(b.appointment_date AS CHAR) as appointment_date, 
                b.appointment_status as status
            FROM bookings b
            JOIN customers c ON b.customer_id = c.customer_id
            WHERE b.appointment_date = CURDATE()
            ORDER BY b.appointment_date; 
        """
        cursor.execute(query_table)
        todays_bookings_list = cursor.fetchall()

        # --- 3. Daily Line Chart Query (Current Month) ---
        query_chart_daily = """
            SELECT 
                CAST(appointment_date AS CHAR) as date, 
                COUNT(booking_id) as count 
            FROM bookings 
            WHERE 
                YEAR(appointment_date) = YEAR(CURDATE()) AND 
                MONTH(appointment_date) = MONTH(CURDATE()) AND 
                appointment_status = 'Confirmed' 
            GROUP BY appointment_date 
            ORDER BY appointment_date;
        """
        cursor.execute(query_chart_daily)
        chart_records_daily = cursor.fetchall()
        daily_bookings_chart = {record['date']: record['count'] for record in chart_records_daily}

        # --- 4. Yearly Bar Chart Query ---
        query_chart_yearly = """
            SELECT 
                DATE_FORMAT(appointment_date, '%b') AS month_abbr,
                MONTH(appointment_date) AS month_num,
                SUM(IF(appointment_status = 'Confirmed', 1, 0)) AS bookings,
                SUM(IF(appointment_status = 'Cancelled', 1, 0)) AS cancellations
            FROM bookings
            WHERE YEAR(appointment_date) = YEAR(CURDATE())
            GROUP BY month_num, month_abbr
            ORDER BY month_num;
        """
        cursor.execute(query_chart_yearly)
        yearly_records = cursor.fetchall()
        
        # Helper map to ensure all 12 months are present in the final data
        month_map = {
            1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
            7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
        }
        
        # Create a dictionary from the query results for quick lookup
        results_map = {record['month_num']: record for record in yearly_records}
        
        yearly_breakdown_chart = []
        for i in range(1, 13):
            if i in results_map:
                yearly_breakdown_chart.append(
                    MonthlyBreakdown(
                        month=results_map[i]['month_abbr'],
                        bookings=results_map[i]['bookings'],
                        cancellations=results_map[i]['cancellations']
                    )
                )
            else:
                # Add a 0-entry for months with no data
                yearly_breakdown_chart.append(
                    MonthlyBreakdown(month=month_map[i], bookings=0, cancellations=0)
                )

        print(f"[SUCCESS] Counts - Daily: {daily_count}, Weekly: {weekly_count}, Monthly: {monthly_count}, Cancellations: {cancellations_count}")

        return DashboardStatsResponse(
            daily_bookings=daily_count,
            weekly_bookings=weekly_count,
            monthly_bookings=monthly_count,
            total_cancellations=cancellations_count,
            todays_bookings_list=todays_bookings_list,
            daily_bookings_chart=daily_bookings_chart,
            yearly_breakdown_chart=yearly_breakdown_chart
        )

    except Error as e:
        print(f"[CRITICAL] Database error during stats calculation: {e}")
        raise HTTPException(status_code=500, detail="A database error occurred while fetching dashboard stats.")
    finally:
        cursor.close()
        conn.close()
        
@app.post("/admin-login")
def admin_login(login_request: AdminLoginRequest):
    """Handles admin login by checking against the database."""
    print(f"\n[INFO] Received request for /admin-login: {login_request.email}")
    
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed.")
    
    # Use buffered=True so we don't have to fetch results immediately
    cursor = conn.cursor(dictionary=True, buffered=True)
    try:
        # Find the user by email
        query = "SELECT user_email, password_hash FROM users WHERE user_email = %s"
        cursor.execute(query, (login_request.email,))
        user = cursor.fetchone()

        # 1. Check if user exists
        # 2. Verify the password
        if not user or not pwd_context.verify(login_request.password, user['password_hash']):
            print("[ERROR] Admin login failed: Invalid email or password.")
            raise HTTPException(
                status_code=401, # Unauthorized
                detail="Invalid email or password"
            )
        
        # If both checks pass
        print("[SUCCESS] Admin login successful.")
        return {"message": "Login successful"}

    except Error as e:
        print(f"[CRITICAL] Database error during login: {e}")
        raise HTTPException(status_code=500, detail="A database error occurred.")
    finally:
        cursor.close()
        conn.close()

# --- Main run block ---
if __name__ == "__main__":
    print("🚀 Starting Car Servicing API Server on http://localhost:8000")
    # Remember the fix for the reloader: use 'python -m uvicorn ...'
    uvicorn.run(app, host="0.0.0.0", port=8000)
