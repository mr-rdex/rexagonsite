#!/usr/bin/env python3
"""
Backend API Test Suite for Shopier OSB Integration
Tests all Shopier endpoints as specified in the review request.
"""

import requests
import json
import base64
import hmac
import hashlib
import sys

# Configuration
BASE_URL = "http://localhost:8001/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Shopier OSB credentials (from backend/.env)
SHOPIER_OSB_USERNAME = "2cbe30d4225fc507ed3758f5d4f503f4"
SHOPIER_OSB_PASSWORD = "469c650e8944ba1fa564f2c28f4d0a26"

# Test results tracking
test_results = []
failed_tests = []

def log_test(test_name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status}: {test_name}"
    if message:
        result += f" - {message}"
    print(result)
    test_results.append({"test": test_name, "passed": passed, "message": message})
    if not passed:
        failed_tests.append(test_name)

def login_admin():
    """Login as admin and return auth token"""
    print("\n=== Logging in as admin ===")
    response = requests.post(
        f"{BASE_URL}/auth/giris",
        json={"kullanici_adi": ADMIN_USERNAME, "sifre": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        token = response.json().get("access_token")
        print(f"✅ Login successful, token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def get_user_balance(token):
    """Get current user balance"""
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code == 200:
        user_data = response.json()
        return user_data.get("kredi", 0), user_data.get("kullanici_adi")
    return None, None

def compute_osb_signature(order_data):
    """Compute HMAC-SHA256 signature for OSB callback"""
    encoded = base64.b64encode(json.dumps(order_data).encode()).decode()
    signature = hmac.new(
        SHOPIER_OSB_PASSWORD.encode(),
        (encoded + SHOPIER_OSB_USERNAME).encode(),
        hashlib.sha256
    ).hexdigest()
    return encoded, signature

def test_1_get_paketler():
    """Test 1: GET /api/shopier/paketler (public, no auth)"""
    print("\n=== Test 1: GET /api/shopier/paketler ===")
    response = requests.get(f"{BASE_URL}/shopier/paketler")
    
    if response.status_code != 200:
        log_test("GET /api/shopier/paketler", False, f"Status code: {response.status_code}")
        return False
    
    paketler = response.json()
    print(f"Response: {json.dumps(paketler, indent=2)}")
    
    # Should return 5 packages
    if len(paketler) != 5:
        log_test("GET /api/shopier/paketler", False, f"Expected 5 packages, got {len(paketler)}")
        return False
    
    # Check expected packages
    expected = [
        {"tutar": 25, "aktif": True},
        {"tutar": 50, "aktif": True},
        {"tutar": 100, "aktif": False},
        {"tutar": 200, "aktif": False},
        {"tutar": 500, "aktif": False},
    ]
    
    for exp in expected:
        found = any(p["tutar"] == exp["tutar"] and p["aktif"] == exp["aktif"] for p in paketler)
        if not found:
            log_test("GET /api/shopier/paketler", False, f"Missing package: {exp}")
            return False
    
    log_test("GET /api/shopier/paketler", True, "All 5 packages returned correctly")
    return True

def test_2_odeme_baslat_25(token):
    """Test 2: POST /api/shopier/odeme-baslat?tutar=25"""
    print("\n=== Test 2: POST /api/shopier/odeme-baslat?tutar=25 ===")
    response = requests.post(
        f"{BASE_URL}/shopier/odeme-baslat?tutar=25",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        log_test("POST /api/shopier/odeme-baslat?tutar=25", False, f"Status code: {response.status_code}")
        return None
    
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    # Check required fields
    required_fields = ["transaction_id", "payment_url", "kullanici_adi", "tutar"]
    for field in required_fields:
        if field not in data:
            log_test("POST /api/shopier/odeme-baslat?tutar=25", False, f"Missing field: {field}")
            return None
    
    # Check payment URL format
    transaction_id = data["transaction_id"]
    expected_url = f"https://www.shopier.com/rexagon/48373478?platform_order_id={transaction_id}"
    if data["payment_url"] != expected_url:
        log_test("POST /api/shopier/odeme-baslat?tutar=25", False, 
                f"Wrong payment URL. Expected: {expected_url}, Got: {data['payment_url']}")
        return None
    
    # Check tutar
    if data["tutar"] != 25:
        log_test("POST /api/shopier/odeme-baslat?tutar=25", False, f"Wrong tutar: {data['tutar']}")
        return None
    
    log_test("POST /api/shopier/odeme-baslat?tutar=25", True, f"Transaction ID: {transaction_id}")
    return transaction_id

def test_3_odeme_baslat_50(token):
    """Test 3: POST /api/shopier/odeme-baslat?tutar=50"""
    print("\n=== Test 3: POST /api/shopier/odeme-baslat?tutar=50 ===")
    response = requests.post(
        f"{BASE_URL}/shopier/odeme-baslat?tutar=50",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        log_test("POST /api/shopier/odeme-baslat?tutar=50", False, f"Status code: {response.status_code}")
        return None
    
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    # Check payment URL contains the second link (48373534)
    if "48373534" not in data["payment_url"]:
        log_test("POST /api/shopier/odeme-baslat?tutar=50", False, 
                f"Payment URL should contain 48373534, got: {data['payment_url']}")
        return None
    
    log_test("POST /api/shopier/odeme-baslat?tutar=50", True, f"Transaction ID: {data['transaction_id']}")
    return data["transaction_id"]

def test_4_odeme_baslat_100(token):
    """Test 4: POST /api/shopier/odeme-baslat?tutar=100 (should fail - paket aktif değil)"""
    print("\n=== Test 4: POST /api/shopier/odeme-baslat?tutar=100 (should fail) ===")
    response = requests.post(
        f"{BASE_URL}/shopier/odeme-baslat?tutar=100",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 400:
        log_test("POST /api/shopier/odeme-baslat?tutar=100", False, 
                f"Expected 400 error, got: {response.status_code}")
        return False
    
    error_msg = response.json().get("detail", "")
    print(f"Error response: {error_msg}")
    
    if "aktif" not in error_msg.lower():
        log_test("POST /api/shopier/odeme-baslat?tutar=100", False, 
                f"Error message should mention 'aktif', got: {error_msg}")
        return False
    
    log_test("POST /api/shopier/odeme-baslat?tutar=100", True, "Correctly rejected inactive package")
    return True

def test_5_odeme_baslat_99(token):
    """Test 5: POST /api/shopier/odeme-baslat?tutar=99 (should fail - geçersiz tutar)"""
    print("\n=== Test 5: POST /api/shopier/odeme-baslat?tutar=99 (should fail) ===")
    response = requests.post(
        f"{BASE_URL}/shopier/odeme-baslat?tutar=99",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 400:
        log_test("POST /api/shopier/odeme-baslat?tutar=99", False, 
                f"Expected 400 error, got: {response.status_code}")
        return False
    
    error_msg = response.json().get("detail", "")
    print(f"Error response: {error_msg}")
    
    if "geçersiz" not in error_msg.lower():
        log_test("POST /api/shopier/odeme-baslat?tutar=99", False, 
                f"Error message should mention 'geçersiz', got: {error_msg}")
        return False
    
    log_test("POST /api/shopier/odeme-baslat?tutar=99", True, "Correctly rejected invalid amount")
    return True

def test_6a_osb_callback_valid(token, transaction_id):
    """Test 6a: Valid OSB callback flow"""
    print("\n=== Test 6a: Valid OSB callback ===")
    
    # Get current balance
    balance_before, username = get_user_balance(token)
    print(f"Balance before: {balance_before}, Username: {username}")
    
    # Create order data
    order_data = {
        "email": "a@a.com",
        "orderid": "T1",
        "currency": "TRY",
        "price": 25,
        "buyername": "A",
        "buyersurname": "U",
        "productcount": 1,
        "productid": "48373478",
        "productlist": [],
        "chatdetails": "",
        "customernote": username,  # Use actual username
        "platform_order_id": transaction_id,
        "istest": 0
    }
    
    # Compute signature
    encoded, signature = compute_osb_signature(order_data)
    
    # Send OSB callback
    response = requests.post(
        f"{BASE_URL}/shopier/osb-callback",
        data={"0": encoded, "1": signature}
    )
    
    print(f"OSB callback response: {response.status_code} - {response.text}")
    
    # FastAPI returns "success" as a JSON string, so response.text will be '"success"'
    if response.status_code != 200 or response.json() != "success":
        log_test("OSB callback - valid signature", False, 
                f"Expected 200 'success', got: {response.status_code} - {response.json()}")
        return False
    
    # Check balance increased
    balance_after, _ = get_user_balance(token)
    print(f"Balance after: {balance_after}")
    
    if balance_after != balance_before + 25:
        log_test("OSB callback - balance increase", False, 
                f"Expected balance {balance_before + 25}, got: {balance_after}")
        return False
    
    # Check transaction status
    tx_response = requests.get(
        f"{BASE_URL}/shopier/transaction/{transaction_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if tx_response.status_code != 200:
        log_test("OSB callback - transaction status", False, 
                f"Failed to get transaction status: {tx_response.status_code}")
        return False
    
    tx_data = tx_response.json()
    print(f"Transaction status: {json.dumps(tx_data, indent=2)}")
    
    if tx_data.get("durum") != "onaylandi":
        log_test("OSB callback - transaction status", False, 
                f"Expected durum='onaylandi', got: {tx_data.get('durum')}")
        return False
    
    log_test("OSB callback - valid flow", True, "Balance increased and transaction confirmed")
    return True

def test_6b_osb_callback_wrong_signature():
    """Test 6b: OSB callback with wrong signature"""
    print("\n=== Test 6b: OSB callback with wrong signature ===")
    
    order_data = {
        "email": "test@test.com",
        "orderid": "T2",
        "currency": "TRY",
        "price": 25,
        "platform_order_id": "dummy-id"
    }
    
    encoded = base64.b64encode(json.dumps(order_data).encode()).decode()
    wrong_signature = "wrongsignature123456789"
    
    response = requests.post(
        f"{BASE_URL}/shopier/osb-callback",
        data={"0": encoded, "1": wrong_signature}
    )
    
    print(f"Response: {response.status_code} - {response.text}")
    
    if response.status_code != 401:
        log_test("OSB callback - wrong signature", False, 
                f"Expected 401 Unauthorized, got: {response.status_code}")
        return False
    
    error_msg = response.json().get("detail", "")
    if "unauthorized" not in error_msg.lower():
        log_test("OSB callback - wrong signature", False, 
                f"Error message should mention 'Unauthorized', got: {error_msg}")
        return False
    
    log_test("OSB callback - wrong signature", True, "Correctly rejected wrong signature")
    return True

def test_6c_osb_callback_missing_params():
    """Test 6c: OSB callback with missing parameters"""
    print("\n=== Test 6c: OSB callback with missing parameters ===")
    
    response = requests.post(
        f"{BASE_URL}/shopier/osb-callback",
        data={}
    )
    
    print(f"Response: {response.status_code} - {response.text}")
    
    if response.status_code != 401:
        log_test("OSB callback - missing params", False, 
                f"Expected 401, got: {response.status_code}")
        return False
    
    error_msg = response.json().get("detail", "")
    if "missing parameter" not in error_msg.lower():
        log_test("OSB callback - missing params", False, 
                f"Error message should mention 'Missing parameter', got: {error_msg}")
        return False
    
    log_test("OSB callback - missing params", True, "Correctly rejected missing parameters")
    return True

def test_6d_osb_callback_username_mismatch(token):
    """Test 6d: OSB callback with username mismatch"""
    print("\n=== Test 6d: OSB callback with username mismatch ===")
    
    # Start a new payment for 50 TL
    response = requests.post(
        f"{BASE_URL}/shopier/odeme-baslat?tutar=50",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 200:
        log_test("OSB callback - username mismatch (setup)", False, 
                f"Failed to create payment: {response.status_code}")
        return False
    
    transaction_id = response.json()["transaction_id"]
    print(f"Created transaction: {transaction_id}")
    
    # Get current balance
    balance_before, _ = get_user_balance(token)
    print(f"Balance before: {balance_before}")
    
    # Create order data with wrong username
    order_data = {
        "email": "test@test.com",
        "orderid": "T3",
        "currency": "TRY",
        "price": 50,
        "buyername": "Test",
        "buyersurname": "User",
        "productcount": 1,
        "productid": "48373534",
        "productlist": [],
        "chatdetails": "",
        "customernote": "wrong_user",  # Wrong username
        "platform_order_id": transaction_id,
        "istest": 0
    }
    
    # Compute correct signature
    encoded, signature = compute_osb_signature(order_data)
    
    # Send OSB callback
    response = requests.post(
        f"{BASE_URL}/shopier/osb-callback",
        data={"0": encoded, "1": signature}
    )
    
    print(f"OSB callback response: {response.status_code} - {response.text}")
    
    # FastAPI returns "success" as a JSON string, so response.text will be '"success"'
    if response.status_code != 200 or response.json() != "success":
        log_test("OSB callback - username mismatch (response)", False, 
                f"Expected 200 'success', got: {response.status_code} - {response.json()}")
        return False
    
    # Check balance did NOT increase
    balance_after, _ = get_user_balance(token)
    print(f"Balance after: {balance_after}")
    
    if balance_after != balance_before:
        log_test("OSB callback - username mismatch (balance)", False, 
                f"Balance should not change, but changed from {balance_before} to {balance_after}")
        return False
    
    # Check transaction status is 'incelemede'
    tx_response = requests.get(
        f"{BASE_URL}/shopier/transaction/{transaction_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if tx_response.status_code != 200:
        log_test("OSB callback - username mismatch (status)", False, 
                f"Failed to get transaction status: {tx_response.status_code}")
        return False
    
    tx_data = tx_response.json()
    print(f"Transaction status: {json.dumps(tx_data, indent=2)}")
    
    if tx_data.get("durum") != "incelemede":
        log_test("OSB callback - username mismatch", False, 
                f"Expected durum='incelemede', got: {tx_data.get('durum')}")
        return False
    
    log_test("OSB callback - username mismatch", True, 
            "Transaction marked as 'incelemede', balance not increased")
    return True

def test_7_get_transaction_404(token):
    """Test 7: GET /api/shopier/transaction/{id} - 404 for non-existent transaction"""
    print("\n=== Test 7: GET /api/shopier/transaction/{id} - 404 test ===")
    
    fake_id = "non-existent-transaction-id"
    response = requests.get(
        f"{BASE_URL}/shopier/transaction/{fake_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"Response: {response.status_code} - {response.text}")
    
    if response.status_code != 404:
        log_test("GET /api/shopier/transaction/{id} - 404", False, 
                f"Expected 404, got: {response.status_code}")
        return False
    
    log_test("GET /api/shopier/transaction/{id} - 404", True, "Correctly returned 404")
    return True

def main():
    """Run all tests"""
    print("=" * 80)
    print("SHOPIER OSB INTEGRATION TEST SUITE")
    print("=" * 80)
    
    # Login
    token = login_admin()
    if not token:
        print("\n❌ CRITICAL: Failed to login. Cannot proceed with tests.")
        sys.exit(1)
    
    # Run tests
    test_1_get_paketler()
    
    transaction_id_25 = test_2_odeme_baslat_25(token)
    test_3_odeme_baslat_50(token)
    test_4_odeme_baslat_100(token)
    test_5_odeme_baslat_99(token)
    
    # OSB callback tests
    if transaction_id_25:
        test_6a_osb_callback_valid(token, transaction_id_25)
    else:
        print("\n⚠️  Skipping test 6a (valid callback) - no transaction_id from test 2")
    
    test_6b_osb_callback_wrong_signature()
    test_6c_osb_callback_missing_params()
    test_6d_osb_callback_username_mismatch(token)
    
    test_7_get_transaction_404(token)
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    
    total_tests = len(test_results)
    passed_tests = sum(1 for r in test_results if r["passed"])
    failed_count = total_tests - passed_tests
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_count}")
    
    if failed_tests:
        print("\n❌ FAILED TESTS:")
        for test_name in failed_tests:
            print(f"  - {test_name}")
    else:
        print("\n✅ ALL TESTS PASSED!")
    
    print("\n" + "=" * 80)
    
    return 0 if failed_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
