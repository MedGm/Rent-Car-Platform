import requests
import json
import sys

BASE_URL = "http://localhost:5000/api"
ADMIN_EMAIL = "admin@rent.com"
ADMIN_PASSWORD = "admin123"

def run_test():
    print("🚀 Starting End-to-End Verification...")
    
    # 1. Get a Car ID
    print("\n1. Fetching Cars...")
    try:
        res = requests.get(f"{BASE_URL}/cars/")
        cars = res.json()
        if not cars:
            print("❌ No cars found! Seed data missing.")
            sys.exit(1)
        car = cars[0]
        print(f"✅ Found car: {car['name']} (ID: {car['id']})")
    except Exception as e:
        print(f"❌ Failed to fetch cars: {e}")
        sys.exit(1)

    # 2. Create a Booking Request
    print("\n2. Creating Booking Request (Public)...")
    booking_payload = {
        "car_id": car['id'],
        "start_date": "2026-06-01",
        "end_date": "2026-06-05",
        "driver_name": "Test User",
        "email": "test@example.com",
        "phone": "+1234567890"
    }
    try:
        res = requests.post(f"{BASE_URL}/bookings/", json=booking_payload)
        if res.status_code == 201:
            booking_id = res.json()['id']
            print(f"✅ Booking request created! ID: {booking_id}")
        else:
            print(f"❌ Failed to create booking: {res.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Booking request exception: {e}")
        sys.exit(1)

    # 3. Admin Login
    print("\n3. Logging in as Admin...")
    try:
        res = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if res.status_code == 200:
            token = res.json()['token']
            print("✅ Admin logged in successfully.")
        else:
            print(f"❌ Admin login failed: {res.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Login exception: {e}")
        sys.exit(1)

    # 4. Approve Booking
    print(f"\n4. Approving Booking ID {booking_id}...")
    headers = {"Authorization": f"Bearer {token}"}
    try:
        res = requests.patch(f"{BASE_URL}/bookings/{booking_id}/status", json={"status": "confirmed"}, headers=headers)
        if res.status_code == 200:
            print("✅ Booking confirmed successfully.")
        else:
            print(f"❌ Failed to confirm booking: {res.text}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Confirmation exception: {e}")
        sys.exit(1)

    # 5. Verify Availability Update
    print(f"\n5. Verifying Availability for Car {car['id']}...")
    try:
        res = requests.get(f"{BASE_URL}/bookings/availability/{car['id']}")
        availability = res.json()
        
        # Check if our booking dates are in the unavailable list
        found = False
        for slot in availability:
            if slot['start'] == "2026-06-01" and slot['end'] == "2026-06-05":
                found = True
                break
        
        if found:
            print("✅ Availability updated correctly. Dates are marked as booked.")
        else:
            print(f"❌ Availability check failed. Booked dates not found in: {availability}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Availability check exception: {e}")
        sys.exit(1)

    print("\n🎉 All Verification Steps Passed Successfully!")

if __name__ == "__main__":
    run_test()
