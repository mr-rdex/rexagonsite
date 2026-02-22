"""
Rexagon Minecraft Server API Tests
Tests for: auth, themes, reports, market, and admin endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://rexagon-staging.preview.emergentagent.com')

# Test credentials
ADMIN_USERNAME = "rexagon_admin"
ADMIN_PASSWORD = "Rexagon2026!"

class TestHealthAndBasic:
    """Basic health check tests"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Rexagon API"
        assert data["status"] == "online"
        print("PASS: API root endpoint working")
    
    def test_stats_endpoint(self):
        """Test server stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "kayitli_oyuncu" in data
        assert "aktif_oyuncu" in data
        print(f"PASS: Stats endpoint working - {data['kayitli_oyuncu']} registered users")


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_admin_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        print("PASS: Admin login successful")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": "invalid_user",
            "sifre": "wrong_password"
        })
        assert response.status_code == 401
        print("PASS: Invalid login rejected correctly")
    
    def test_get_current_user(self):
        """Test getting current user info after login"""
        # First login
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get user info
        response = requests.get(f"{BASE_URL}/api/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["kullanici_adi"] == ADMIN_USERNAME
        assert data["rol"] == "admin"
        assert "kredi" in data
        assert "email" in data
        print(f"PASS: Current user fetched - {data['kullanici_adi']} with role {data['rol']}")


class TestThemesAPI:
    """Tests for themes endpoints"""
    
    def test_get_all_themes(self):
        """GET /api/themes returns themes list"""
        response = requests.get(f"{BASE_URL}/api/themes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: GET /api/themes returned {len(data)} themes")
        return data
    
    def test_admin_create_theme(self):
        """Admin can create a new theme"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Create theme
        theme_data = {
            "isim": f"TEST_Theme_{uuid.uuid4().hex[:6]}",
            "gorsel_url": "https://example.com/test-theme.jpg",
            "fiyat": 100.0
        }
        response = requests.post(f"{BASE_URL}/api/admin/themes", 
            json=theme_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Tema oluşturuldu"
        print(f"PASS: Theme created with id {data['id']}")
        return data["id"]
    
    def test_admin_update_theme(self):
        """PUT /api/admin/themes/{theme_id} updates a theme"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # First create a theme to update
        create_data = {
            "isim": f"TEST_Theme_ToUpdate_{uuid.uuid4().hex[:6]}",
            "gorsel_url": "https://example.com/original.jpg",
            "fiyat": 50.0
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/themes", 
            json=create_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert create_response.status_code == 200
        theme_id = create_response.json()["id"]
        
        # Update the theme
        update_data = {
            "isim": f"TEST_Theme_Updated_{uuid.uuid4().hex[:6]}",
            "gorsel_url": "https://example.com/updated.jpg",
            "fiyat": 75.0
        }
        update_response = requests.put(f"{BASE_URL}/api/admin/themes/{theme_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert update_response.status_code == 200
        assert update_response.json()["message"] == "Tema güncellendi"
        print(f"PASS: PUT /api/admin/themes/{theme_id} updated theme successfully")


class TestReportsAPI:
    """Tests for reports endpoints"""
    
    def test_create_report_requires_auth(self):
        """POST /api/reports requires authentication"""
        response = requests.post(f"{BASE_URL}/api/reports", json={
            "baslik": "Test",
            "aciklama": "Test",
            "konu": "Genel"
        })
        assert response.status_code == 401
        print("PASS: Create report requires authentication")
    
    def test_create_report_authenticated(self):
        """POST /api/reports creates a report when authenticated"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Create report
        report_data = {
            "baslik": f"TEST_Report_{uuid.uuid4().hex[:6]}",
            "aciklama": "This is a test report",
            "konu": "Hata Bildirimi"
        }
        response = requests.post(f"{BASE_URL}/api/reports", 
            json=report_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["message"] == "Rapor gönderildi"
        print(f"PASS: Report created with id {data['id']}")
        return data["id"]
    
    def test_admin_get_reports(self):
        """GET /api/admin/reports returns reports (requires admin)"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get reports
        response = requests.get(f"{BASE_URL}/api/admin/reports", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Admin got {len(data)} reports")
        return data


class TestMarketAPI:
    """Tests for market endpoints"""
    
    def test_get_all_market_items(self):
        """GET /api/market/urunler returns all market items"""
        response = requests.get(f"{BASE_URL}/api/market/urunler")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: GET /api/market/urunler returned {len(data)} items")
        return data
    
    def test_get_market_categories(self):
        """GET /api/market/kategoriler returns market categories"""
        response = requests.get(f"{BASE_URL}/api/market/kategoriler")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Check for Paketler category
        category_names = [cat.get("isim") for cat in data]
        assert "Paketler" in category_names, "Paketler category should exist"
        print(f"PASS: Market categories: {category_names}")
    
    def test_get_paketler_category_items(self):
        """GET /api/market/Paketler/urunler returns items in Paketler category"""
        response = requests.get(f"{BASE_URL}/api/market/Paketler/urunler")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify items belong to Paketler category
        for item in data:
            assert item.get("kategori") == "Paketler", f"Item {item.get('isim')} not in Paketler category"
        print(f"PASS: Paketler category has {len(data)} items")
    
    def test_admin_update_market_item(self):
        """PUT /api/admin/market/urun/{urun_id} updates a market item"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # First create an item to update
        create_data = {
            "isim": f"TEST_Item_ToUpdate_{uuid.uuid4().hex[:6]}",
            "aciklama": "Original description",
            "fiyat": 100.0,
            "kategori": "Paketler",
            "stok": 50,
            "gorsel": "",
            "indirim": 0
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/market/urun", 
            json=create_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert create_response.status_code == 200
        item_id = create_response.json()["id"]
        
        # Update the item
        update_data = {
            "isim": f"TEST_Item_Updated_{uuid.uuid4().hex[:6]}",
            "aciklama": "Updated description",
            "fiyat": 150.0,
            "kategori": "Paketler",
            "stok": 100,
            "gorsel": "https://example.com/updated.jpg",
            "indirim": 10
        }
        update_response = requests.put(f"{BASE_URL}/api/admin/market/urun/{item_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert update_response.status_code == 200
        assert update_response.json()["message"] == "Ürün güncellendi"
        print(f"PASS: PUT /api/admin/market/urun/{item_id} updated item successfully")


class TestAdminAPI:
    """Tests for admin endpoints"""
    
    def test_admin_get_users(self):
        """Admin can get all users"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Get users
        response = requests.get(f"{BASE_URL}/api/admin/kullanicilar", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Admin got {len(data)} users")
    
    def test_non_admin_cannot_access(self):
        """Non-admin cannot access admin endpoints without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/kullanicilar")
        assert response.status_code == 401
        print("PASS: Admin endpoint protected from unauthenticated access")


class TestLeaderboard:
    """Tests for leaderboard endpoints"""
    
    def test_get_top_credits(self):
        """GET /api/leaderboard/kredi returns top credit users"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/kredi")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Leaderboard top credits: {len(data)} entries")
    
    def test_get_latest_users(self):
        """GET /api/leaderboard/son-kayitlar returns latest registered users"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/son-kayitlar")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Latest users: {len(data)} entries")
    
    def test_get_top_island_level(self):
        """GET /api/leaderboard/ada-seviyesi returns top island level users (New Feature)"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/ada-seviyesi")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify user data has ada_seviyesi field
        if len(data) > 0:
            assert "ada_seviyesi" in data[0], "User should have ada_seviyesi field"
            assert "kullanici_adi" in data[0], "User should have kullanici_adi field"
        print(f"PASS: Leaderboard ada-seviyesi: {len(data)} entries")
    
    def test_get_top_dinar(self):
        """GET /api/leaderboard/dinar returns top dinar users (New Feature)"""
        response = requests.get(f"{BASE_URL}/api/leaderboard/dinar")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Verify user data has dinar field
        if len(data) > 0:
            assert "dinar" in data[0], "User should have dinar field"
            assert "kullanici_adi" in data[0], "User should have kullanici_adi field"
        print(f"PASS: Leaderboard dinar: {len(data)} entries")


class TestNews:
    """Tests for news endpoints"""
    
    def test_get_news(self):
        """GET /api/haberler returns news"""
        response = requests.get(f"{BASE_URL}/api/haberler")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: News: {len(data)} articles")
    
    def test_admin_update_news(self):
        """PUT /api/admin/haber/{haber_id} updates a news article"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # First create a news item to update
        create_data = {
            "baslik": f"TEST_News_ToUpdate_{uuid.uuid4().hex[:6]}",
            "icerik": "Original content"
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/haber", 
            json=create_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert create_response.status_code == 200
        news_id = create_response.json()["id"]
        
        # Update the news
        update_data = {
            "baslik": f"TEST_News_Updated_{uuid.uuid4().hex[:6]}",
            "icerik": "Updated content with more information"
        }
        update_response = requests.put(f"{BASE_URL}/api/admin/haber/{news_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert update_response.status_code == 200
        assert update_response.json()["message"] == "Haber güncellendi"
        print(f"PASS: PUT /api/admin/haber/{news_id} updated news successfully")


class TestForumAPI:
    """Tests for forum endpoints"""
    
    def test_get_forum_categories(self):
        """GET /api/forum/kategoriler returns forum categories"""
        response = requests.get(f"{BASE_URL}/api/forum/kategoriler")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: Forum categories: {len(data)} categories")


class TestUserProfileAPI:
    """Tests for user profile update endpoints (New Features in Iteration 3)"""
    
    def test_update_biography_requires_auth(self):
        """PUT /api/users/biyografi requires authentication"""
        response = requests.put(f"{BASE_URL}/api/users/biyografi", json={
            "biyografi": "Test bio"
        })
        assert response.status_code == 401
        print("PASS: Update biography requires authentication")
    
    def test_update_biography_success(self):
        """PUT /api/users/biyografi updates user biography when authenticated"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Update biography
        test_bio = "TEST_Bio_Iteration3"
        response = requests.put(f"{BASE_URL}/api/users/biyografi", 
            json={"biyografi": test_bio},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Biyografi güncellendi"
        
        # Verify by fetching user profile
        profile_response = requests.get(f"{BASE_URL}/api/users/{ADMIN_USERNAME}")
        assert profile_response.status_code == 200
        profile_data = profile_response.json()
        assert profile_data["biyografi"] == test_bio
        print("PASS: Biography updated and verified")
    
    def test_change_password_requires_auth(self):
        """PUT /api/users/sifre requires authentication"""
        response = requests.put(f"{BASE_URL}/api/users/sifre", json={
            "eski_sifre": "old",
            "yeni_sifre": "new123"
        })
        assert response.status_code == 401
        print("PASS: Change password requires authentication")
    
    def test_change_password_wrong_old_password(self):
        """PUT /api/users/sifre rejects wrong old password"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Try to change password with wrong old password
        response = requests.put(f"{BASE_URL}/api/users/sifre", 
            json={"eski_sifre": "WrongPassword123", "yeni_sifre": "NewPassword123!"},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 400
        data = response.json()
        assert data["detail"] == "Mevcut şifre hatalı"
        print("PASS: Wrong old password correctly rejected")
    
    def test_change_password_success(self):
        """PUT /api/users/sifre changes password with correct old password"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": ADMIN_PASSWORD
        })
        token = login_response.json()["access_token"]
        
        # Change password
        new_password = "TempTestPass123!"
        response = requests.put(f"{BASE_URL}/api/users/sifre", 
            json={"eski_sifre": ADMIN_PASSWORD, "yeni_sifre": new_password},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Şifre başarıyla değiştirildi"
        
        # Verify new password works
        new_login_response = requests.post(f"{BASE_URL}/api/auth/giris", json={
            "kullanici_adi": ADMIN_USERNAME,
            "sifre": new_password
        })
        assert new_login_response.status_code == 200
        assert "access_token" in new_login_response.json()
        
        # Change password back to original
        new_token = new_login_response.json()["access_token"]
        restore_response = requests.put(f"{BASE_URL}/api/users/sifre", 
            json={"eski_sifre": new_password, "yeni_sifre": ADMIN_PASSWORD},
            headers={"Authorization": f"Bearer {new_token}"}
        )
        assert restore_response.status_code == 200
        print("PASS: Password changed and restored successfully")
    
    def test_get_user_profile_public(self):
        """GET /api/users/{kullanici_adi} returns public profile"""
        response = requests.get(f"{BASE_URL}/api/users/{ADMIN_USERNAME}")
        assert response.status_code == 200
        data = response.json()
        assert data["kullanici_adi"] == ADMIN_USERNAME
        assert "biyografi" in data
        assert "ada_seviyesi" in data
        assert "dinar" in data
        # Should not include password hash
        assert "sifre_hash" not in data
        print(f"PASS: Public profile fetched with bio: {data.get('biyografi')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
