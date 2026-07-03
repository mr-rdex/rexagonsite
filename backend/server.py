from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
import asyncio
from rcon.source import rcon
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid
import sqlite3
import shutil
import hmac
import hashlib
import base64
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File, Request, Form
from PIL import Image
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'minecraft_server')]

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "minecraft-server-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

# RCON Ayarları
RCON_HOST = os.getenv("RCON_HOST", "127.0.0.1")
RCON_PORT = int(os.getenv("RCON_PORT", 25575))
RCON_PASSWORD = os.getenv("RCON_PASSWORD", "password") # Provide default or empty

async def send_rcon_command(command: str):
    """Minecraft sunucusuna RCON üzerinden komut gönderir."""
    try:
        response = await rcon(
            command,
            host=RCON_HOST,
            port=RCON_PORT,
            passwd=RCON_PASSWORD
        )
        logging.info(f"RCON Command executed: '{command}'. Response: {response}")
        return response
    except Exception as e:
        logging.error(f"RCON Error executing '{command}': {e}")
        return str(e)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/giris")

# Create the main app
app = FastAPI(title="Rexagon Minecraft Server API")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserRegister(BaseModel):
    kullanici_adi: str = Field(..., min_length=3, max_length=20)
    email: EmailStr
    sifre: str = Field(..., min_length=6)
    dogum_tarihi: str
    gizlilik_sozlesmesi: bool

class UserLogin(BaseModel):
    kullanici_adi: str
    sifre: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    kullanici_adi: str
    email: Optional[str]
    kredi: float
    profil_arka_plani: Optional[str] = None
    rol: str
    yetki: str
    yetki_gorseli: Optional[str] = None
    kayit_tarihi: str
    acik_temalar: List[str] = []
    aktif_tema_id: Optional[str] = None
    aktif_tema_gorsel: Optional[str] = None
    aktif_tema_ambiyans: Optional[str] = "yok"
    biyografi: Optional[str] = None
    discord: Optional[str] = None
    instagram: Optional[str] = None
    ada_seviyesi: int = 0
    dinar: float = 0
    acilan_konu_sayisi: int = 0
    gonderilen_mesaj_sayisi: int = 0
    toplam_harcama: float = 0.0

class ForumKonu(BaseModel):
    baslik: str
    icerik: str
    kategori: str

class ForumCevap(BaseModel):
    icerik: str

class MarketKategori(BaseModel):
    isim: str

class MarketUrun(BaseModel):
    isim: str
    aciklama: str
    fiyat: float
    kategori: str
    stok: int
    gorsel: Optional[str] = None
    indirim: Optional[float] = 0
    detayli_bilgi: Optional[str] = None
    satin_alim_komutu: Optional[str] = None

class Haber(BaseModel):
    baslik: str
    icerik: str
    gorsel_url: Optional[str] = None
    goruntulenme: Optional[int] = 0

class KrediYukle(BaseModel):
    tutar: float

class ReportCreate(BaseModel):
    baslik: str
    aciklama: str
    konu: str

class ThemeCreate(BaseModel):
    isim: str
    gorsel_url: str
    fiyat: float = 0
    ambiyans: Optional[str] = "yok"

class AmbianceCreate(BaseModel):
    id: str
    isim: str
    tip: str

class SiteSettings(BaseModel):
    site_ambiyans: str

class SifreDegistir(BaseModel):
    eski_sifre: str
    yeni_sifre: str

class RconCommand(BaseModel):
    command: str

class BiyografiGuncelle(BaseModel):
    biyografi: Optional[str] = None
    discord: Optional[str] = None
    instagram: Optional[str] = None

class WikiPageCreate(BaseModel):
    slug: str
    baslik: str
    icerik: str

# ============ AUTH HELPERS ============

def verify_password(plain_password, hashed_password):
    # 1. Minecraft AuthMe Formatı Kontrolü ($SHA$salt$hash)
    if hashed_password.startswith("$SHA$"):
        try:
            parts = hashed_password.split("$")
            if len(parts) != 4: return False
            
            salt = parts[2]
            db_hash = parts[3]
            
            # AuthMe Algoritması: SHA256( SHA256(şifre) + salt )
            first_hash = hashlib.sha256(plain_password.encode()).hexdigest()
            final_hash = hashlib.sha256((first_hash + salt).encode()).hexdigest()
            
            return final_hash == db_hash
        except Exception as e:
            print(f"Minecraft şifre çözme hatası: {e}")
            return False

    # 2. Eğer Minecraft formatı değilse (Bcrypt vb.), normal kütüphaneyi kullan
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise credentials_exception
    user.setdefault("acik_temalar", [])
    user.setdefault("aktif_tema_id", None)
    user.setdefault("aktif_tema_gorsel", None)
    user.setdefault("aktif_tema_ambiyans", "yok")
    user.setdefault("biyografi", None)
    user.setdefault("ada_seviyesi", 0)
    user.setdefault("dinar", 0)
    return user

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Yönetici yetkisi gerekli")
    return current_user

# ============ BASIC ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Rexagon API", "status": "online"}

# ============ SETTINGS & AMBIANCE ROUTES ============

@api_router.get("/ambiances")
async def get_ambiances():
    ambiances = await db.ambiances.find({}, {"_id": 0}).to_list(100)
    if not ambiances:
        # Default ambiances
        return [
            {"id": "yok", "isim": "Yok", "tip": "yok"},
            {"id": "kar", "isim": "Kar (Kış)", "tip": "kar"},
            {"id": "ilkbahar", "isim": "Çiçek/Yaprak (İlkbahar)", "tip": "ilkbahar"}
        ]
    return ambiances

@api_router.post("/admin/ambiances")
async def create_ambiance(amb: AmbianceCreate, admin: dict = Depends(get_admin_user)):
    doc = {"id": amb.id, "isim": amb.isim, "tip": amb.tip}
    await db.ambiances.insert_one(doc)
    return {"message": "Ambiyans eklendi"}

@api_router.delete("/admin/ambiances/{amb_id}")
async def delete_ambiance(amb_id: str, admin: dict = Depends(get_admin_user)):
    await db.ambiances.delete_one({"id": amb_id})
    return {"message": "Ambiyans silindi"}

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({"id": "global_settings"}, {"_id": 0})
    if not settings:
        return {"site_ambiyans": "yok"}
    return settings

@api_router.put("/admin/settings")
async def update_settings(settings: SiteSettings, admin: dict = Depends(get_admin_user)):
    await db.settings.update_one(
        {"id": "global_settings"},
        {"$set": {"site_ambiyans": settings.site_ambiyans}},
        upsert=True
    )
    return {"message": "Site ayarları güncellendi"}

# ============ WIKI ROUTES ============

@api_router.get("/wiki/{slug}")
async def get_wiki_page(slug: str):
    page = await db.wiki_pages.find_one({"slug": slug}, {"_id": 0})
    if not page:
        raise HTTPException(status_code=404, detail="Wiki sayfası bulunamadı")
    return page

@api_router.get("/admin/wiki")
async def get_all_wiki_pages(admin: dict = Depends(get_admin_user)):
    pages = await db.wiki_pages.find({}, {"_id": 0}).to_list(1000)
    return pages

@api_router.post("/admin/wiki")
async def create_or_update_wiki_page(page_data: WikiPageCreate, admin: dict = Depends(get_admin_user)):
    doc = {
        "slug": page_data.slug,
        "baslik": page_data.baslik,
        "icerik": page_data.icerik,
        "son_guncelleme": datetime.now(timezone.utc).isoformat(),
        "guncelleyen": admin["kullanici_adi"]
    }
    await db.wiki_pages.update_one({"slug": page_data.slug}, {"$set": doc}, upsert=True)
    return {"message": "Wiki sayfası kaydedildi", "slug": page_data.slug}

@api_router.delete("/admin/wiki/{slug}")
async def delete_wiki_page(slug: str, admin: dict = Depends(get_admin_user)):
    result = await db.wiki_pages.delete_one({"slug": slug})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Sayfa bulunamadı")
    return {"message": "Wiki sayfası silindi"}

@api_router.get("/admin/gallery")
async def get_gallery(admin: dict = Depends(get_admin_user)):
    images_dir = ROOT_DIR.parent / "frontend" / "public" / "images"
    if not images_dir.exists():
        return []

    images = []
    for file in images_dir.iterdir():
        if file.is_file() and file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
            images.append(f"/images/{file.name}")

    return images

@api_router.delete("/admin/gallery/{filename}")
async def delete_gallery_image(filename: str, admin: dict = Depends(get_admin_user)):
    images_dir = ROOT_DIR.parent / "frontend" / "public" / "images"
    file_path = images_dir / filename

    if file_path.exists() and file_path.is_file():
        file_path.unlink()
        return {"message": "Görsel silindi"}
    else:
        raise HTTPException(status_code=404, detail="Görsel bulunamadı")

# ============ AUTH ROUTES ============

@api_router.post("/auth/kayit", response_model=dict)
async def kayit_ol(user: UserRegister):
    # Kullanıcı adı kontrolü
    existing_user = await db.users.find_one({"kullanici_adi": user.kullanici_adi})
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kullanılıyor")
    
    # Email kontrolü
    existing_email = await db.users.find_one({"email": user.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Bu email zaten kullanılıyor")
    
    if not user.gizlilik_sozlesmesi:
        raise HTTPException(status_code=400, detail="Gizlilik sözleşmesini kabul etmelisiniz")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "kullanici_adi": user.kullanici_adi,
        "email": user.email,
        "sifre_hash": get_password_hash(user.sifre),
        "kredi": 0.0,
        "profil_arka_plani": None,
        "rol": "user",
        "yetki": "Oyuncu",
        "yetki_gorseli": None,
        "dogum_tarihi": user.dogum_tarihi,
        "kayit_tarihi": datetime.now(timezone.utc).isoformat(),
        "acik_temalar": [],
        "aktif_tema_id": None,
        "aktif_tema_gorsel": None,
        "biyografi": None,
        "ada_seviyesi": 0,
        "dinar": 0.0
    }
    
    await db.users.insert_one(user_doc)
    access_token = create_access_token(data={"sub": user_id})
    
    return {
        "message": "Kayıt başarılı",
        "access_token": access_token,
        "token_type": "bearer"
    }

@api_router.post("/auth/giris", response_model=Token)
async def giris_yap(user: UserLogin):
    db_user = await db.users.find_one({"kullanici_adi": user.kullanici_adi}, {"_id": 0})
    if not db_user or not verify_password(user.sifre, db_user["sifre_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı"
        )
    
    access_token = create_access_token(data={"sub": db_user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    acilan_konu_sayisi = await db.forum_topics.count_documents({"yazar_id": current_user["id"]})
    gonderilen_mesaj_sayisi = await db.forum_replies.count_documents({"yazar_id": current_user["id"]})
    current_user["acilan_konu_sayisi"] = acilan_konu_sayisi
    current_user["gonderilen_mesaj_sayisi"] = gonderilen_mesaj_sayisi

    toplam_harcama = 0.0
    purchases = await db.purchases.find({"kullanici_id": current_user["id"]}).to_list(1000)
    for p in purchases:
        toplam_harcama += float(p.get("toplam_fiyat", 0))
    current_user["toplam_harcama"] = toplam_harcama
    return current_user

# ============ USER ROUTES ============

@api_router.get("/users/{kullanici_adi}", response_model=UserResponse)
async def get_user_profile(kullanici_adi: str):
    user = await db.users.find_one({"kullanici_adi": kullanici_adi}, {"_id": 0, "sifre_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    # Calculate stats dynamically
    acilan_konu_sayisi = await db.forum_topics.count_documents({"yazar_id": user["id"]})
    gonderilen_mesaj_sayisi = await db.forum_replies.count_documents({"yazar_id": user["id"]})

    # Total spending from market purchases and theme purchases
    toplam_harcama = 0.0
    # Add market purchases
    purchases = await db.purchases.find({"kullanici_id": user["id"]}).to_list(1000)
    for p in purchases:
        toplam_harcama += float(p.get("toplam_fiyat", 0))
    # Also add theme purchases if any logged in cuzdan_gecmisi
    harcamalar = await db.cuzdan_gecmisi.find({"kullanici_id": user["id"], "tur": "harcama"}).to_list(1000)
    for h in harcamalar:
        toplam_harcama += float(h.get("tutar", 0))

    # Ensure theme fields exist
    user.setdefault("acik_temalar", [])
    user.setdefault("aktif_tema_id", None)
    user.setdefault("aktif_tema_gorsel", None)
    user.setdefault("aktif_tema_ambiyans", "yok")
    user.setdefault("biyografi", None)
    user.setdefault("ada_seviyesi", 0)
    user.setdefault("dinar", 0)
    user["acilan_konu_sayisi"] = acilan_konu_sayisi
    user["gonderilen_mesaj_sayisi"] = gonderilen_mesaj_sayisi
    user["toplam_harcama"] = toplam_harcama

    return user

@api_router.put("/users/profil")
async def update_profile(profil_arka_plani: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"profil_arka_plani": profil_arka_plani}}
    )
    return {"message": "Profil güncellendi"}

@api_router.put("/users/sifre")
async def change_password(data: SifreDegistir, current_user: dict = Depends(get_current_user)):
    user_full = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    if not verify_password(data.eski_sifre, user_full["sifre_hash"]):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"sifre_hash": get_password_hash(data.yeni_sifre)}}
    )
    return {"message": "Şifre başarıyla değiştirildi"}

@api_router.put("/users/biyografi")
async def update_biography(data: BiyografiGuncelle, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if data.biyografi is not None:
        update_data["biyografi"] = data.biyografi
    if data.discord is not None:
        update_data["discord"] = data.discord
    if data.instagram is not None:
        update_data["instagram"] = data.instagram

    if update_data:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": update_data}
        )
    return {"message": "Profil bilgileri güncellendi"}

# ============ LEADERBOARD ROUTES ============

@api_router.get("/leaderboard/kredi")
async def get_top_credits():
    users = await db.users.find({}, {"_id": 0, "sifre_hash": 0}).sort("kredi", -1).limit(10).to_list(10)
    return users

@api_router.get("/leaderboard/son-kayitlar")
async def get_latest_users():
    users = await db.users.find({}, {"_id": 0, "sifre_hash": 0}).sort("kayit_tarihi", -1).limit(10).to_list(10)
    return users

@api_router.get("/leaderboard/son-alisverisler")
async def get_latest_purchases():
    purchases = await db.purchases.aggregate([
        {"$sort": {"tarih": -1}},
        {"$limit": 10},
        {"$lookup": {
            "from": "users",
            "localField": "kullanici_id",
            "foreignField": "id",
            "as": "kullanici"
        }},
        {"$unwind": "$kullanici"},
        {"$project": {
            "_id": 0,
            "kullanici_adi": "$kullanici.kullanici_adi",
            "urun_adi": 1,
            "toplam_fiyat": 1,
            "tarih": 1
        }}
    ]).to_list(10)
    return purchases

@api_router.get("/leaderboard/son-kredi-yuklemeler")
async def get_latest_credit_loads():
    transactions = await db.credit_transactions.aggregate([
        {"$match": {"tip": "yukleme"}},
        {"$sort": {"tarih": -1}},
        {"$limit": 10},
        {"$lookup": {
            "from": "users",
            "localField": "kullanici_id",
            "foreignField": "id",
            "as": "kullanici"
        }},
        {"$unwind": "$kullanici"},
        {"$project": {
            "_id": 0,
            "kullanici_adi": "$kullanici.kullanici_adi",
            "tutar": 1,
            "tarih": 1
        }}
    ]).to_list(10)
    return transactions


@api_router.get("/leaderboard/dinar")
async def get_top_dinar():
    leaderboard = await db.leaderboard_dinar.find({}, {"_id": 0}).sort("sira", 1).limit(10).to_list(10)
    return leaderboard

# ============ FORUM ROUTES ============

@api_router.get("/forum/kategoriler")
async def get_forum_categories():
    categories = await db.forum_categories.find({}, {"_id": 0}).to_list(100)
    # Return topic count for each category
    for cat in categories:
        cat_name = cat.get("isim")
        if cat_name:
            count = await db.forum_topics.count_documents({"kategori": cat_name})
            cat["konu_sayisi"] = count
    return categories

@api_router.get("/forum/{kategori}/konular")
async def get_forum_topics(kategori: str, skip: int = 0, limit: int = 20):
    match_query = {}
    if kategori != "Tümü":
        match_query = {"kategori": kategori}

    topics = await db.forum_topics.aggregate([
        {"$match": match_query},
        {"$sort": {"tarih": -1}},
        {"$skip": skip},
        {"$limit": limit},
        {"$lookup": {
            "from": "users",
            "localField": "yazar_id",
            "foreignField": "id",
            "as": "yazar"
        }},
        {"$unwind": "$yazar"},
        {"$lookup": {
            "from": "forum_replies",
            "localField": "id",
            "foreignField": "konu_id",
            "as": "cevaplar"
        }},
        {"$project": {
            "_id": 0,
            "id": 1,
            "baslik": 1,
            "icerik": 1,
            "kategori": 1,
            "tarih": 1,
            "begenenler": 1,
            "kapali": 1,
            "cozuldu": 1,
            "yazar_adi": "$yazar.kullanici_adi",
            "cevap_sayisi": {"$size": "$cevaplar"}
        }}
    ]).to_list(limit)
    return topics

@api_router.get("/forum/konu/{konu_id}")
async def get_forum_topic(konu_id: str):
    topic = await db.forum_topics.aggregate([
        {"$match": {"id": konu_id}},
        {"$lookup": {
            "from": "users",
            "localField": "yazar_id",
            "foreignField": "id",
            "as": "yazar"
        }},
        {"$unwind": "$yazar"},
        {"$project": {
            "_id": 0,
            "id": 1,
            "baslik": 1,
            "icerik": 1,
            "kategori": 1,
            "tarih": 1,
            "begenenler": {"$ifNull": ["$begenenler", []]},
            "kapali": {"$ifNull": ["$kapali", False]},
            "cozuldu": {"$ifNull": ["$cozuldu", False]},
            "yazar_adi": "$yazar.kullanici_adi",
            "yazar_id": 1
        }}
    ]).to_list(1)
    
    if not topic:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")
    
    # Cevapları getir
    replies = await db.forum_replies.aggregate([
        {"$match": {"konu_id": konu_id}},
        {"$sort": {"tarih": 1}},
        {"$lookup": {
            "from": "users",
            "localField": "yazar_id",
            "foreignField": "id",
            "as": "yazar"
        }},
        {"$unwind": "$yazar"},
        {"$project": {
            "_id": 0,
            "id": 1,
            "icerik": 1,
            "tarih": 1,
            "yazar_adi": "$yazar.kullanici_adi",
            "yazar_id": 1
        }}
    ]).to_list(1000)
    
    return {"konu": topic[0], "cevaplar": replies}

@api_router.post("/forum/upload-image")
async def upload_forum_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    # Yüklenen dosya boyutu kontrolü (3MB)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > 3 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Dosya boyutu 3MB'dan büyük olamaz")

    # Resim Sıkıştırma (Pillow)
    try:
        img = Image.open(file.file)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Max resolution restriction to save space
        img.thumbnail((1280, 1280), Image.Resampling.LANCZOS)

        output = io.BytesBytesIO() if False else io.BytesIO()
        img.save(output, format="JPEG", quality=80, optimize=True)
        compressed_data = output.getvalue()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Geçersiz resim formatı: {e}")

    # Dizin oluşturma
    forum_images_dir = ROOT_DIR.parent / "frontend" / "public" / "images" / "forum"
    forum_images_dir.mkdir(parents=True, exist_ok=True)

    unique_filename = f"{uuid.uuid4().hex}.jpg"
    file_path = forum_images_dir / unique_filename

    with open(file_path, "wb") as f:
        f.write(compressed_data)

    return {"gorsel_url": f"/images/forum/{unique_filename}"}

@api_router.post("/forum/konu")
async def create_forum_topic(konu: ForumKonu, current_user: dict = Depends(get_current_user)):
    konu_id = str(uuid.uuid4())
    konu_doc = {
        "id": konu_id,
        "baslik": konu.baslik,
        "icerik": konu.icerik,
        "kategori": konu.kategori,
        "yazar_id": current_user["id"],
        "tarih": datetime.now(timezone.utc).isoformat(),
        "begenenler": [],
        "kapali": False,
        "cozuldu": False
    }
    await db.forum_topics.insert_one(konu_doc)
    return {"message": "Konu oluşturuldu", "id": konu_id}

@api_router.post("/forum/konu/{konu_id}/begen")
async def like_forum_topic(konu_id: str, current_user: dict = Depends(get_current_user)):
    topic = await db.forum_topics.find_one({"id": konu_id})
    if not topic:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")

    begenenler = topic.get("begenenler", [])
    if current_user["id"] in begenenler:
        # Zaten beğenmiş, beğeniyi kaldır
        await db.forum_topics.update_one({"id": konu_id}, {"$pull": {"begenenler": current_user["id"]}})
        return {"message": "Beğeni kaldırıldı", "begenenler_sayisi": len(begenenler) - 1}
    else:
        # Beğen
        await db.forum_topics.update_one({"id": konu_id}, {"$push": {"begenenler": current_user["id"]}})
        return {"message": "Konu beğenildi", "begenenler_sayisi": len(begenenler) + 1}

@api_router.post("/forum/konu/{konu_id}/cevap")
async def create_forum_reply(konu_id: str, cevap: ForumCevap, current_user: dict = Depends(get_current_user)):
    # Konu kontrolü
    topic = await db.forum_topics.find_one({"id": konu_id})
    if not topic:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")
    
    cevap_id = str(uuid.uuid4())
    cevap_doc = {
        "id": cevap_id,
        "konu_id": konu_id,
        "icerik": cevap.icerik,
        "yazar_id": current_user["id"],
        "tarih": datetime.now(timezone.utc).isoformat(),
        "begenenler": []
    }
    await db.forum_replies.insert_one(cevap_doc)
    return {"message": "Cevap eklendi", "id": cevap_id}

@api_router.post("/forum/cevap/{cevap_id}/begen")
async def like_forum_reply(cevap_id: str, current_user: dict = Depends(get_current_user)):
    reply = await db.forum_replies.find_one({"id": cevap_id})
    if not reply:
        raise HTTPException(status_code=404, detail="Cevap bulunamadı")

    begenenler = reply.get("begenenler", [])
    if current_user["id"] in begenenler:
        begenenler.remove(current_user["id"])
        action = "unliked"
    else:
        begenenler.append(current_user["id"])
        action = "liked"

    await db.forum_replies.update_one(
        {"id": cevap_id},
        {"$set": {"begenenler": begenenler}}
    )
    return {"message": "İşlem başarılı", "action": action, "likes": len(begenenler)}

@api_router.get("/stats")
async def get_server_stats():
    total_users = await db.users.count_documents({})
    # Active players will be fetched from Minecraft server API in future
    return {
        "kayitli_oyuncu": total_users,
        "aktif_oyuncu": 0  # Placeholder for Minecraft server API
    }

# ============ WALLET/CREDIT ROUTES ============

@api_router.get("/cuzdan/gecmis")
async def get_wallet_history(current_user: dict = Depends(get_current_user)):
    transactions = await db.credit_transactions.find(
        {"kullanici_id": current_user["id"]},
        {"_id": 0}
    ).sort("tarih", -1).to_list(100)

    purchases = await db.purchases.find(
        {"kullanici_id": current_user["id"]},
        {"_id": 0}
    ).sort("tarih", -1).to_list(100)

    # purchases listesindeki "toplam_fiyat" ve "urun_adi" gibi alanları frontend'in tanıyabileceği tutar ve tipe çevirelim
    for p in purchases:
        p["tutar"] = p.get("toplam_fiyat", 0)
        p["tip"] = "harcama"
        p["durum"] = "onaylandi"
        p["urun_adi"] = p.get("urun_adi", "Market Ürünü")

    combined = transactions + purchases
    combined.sort(key=lambda x: x.get("tarih", ""), reverse=True)
    return combined[:100]

@api_router.post("/cuzdan/yukle")
async def load_wallet(tutar: float, current_user: dict = Depends(get_current_user)):
    # DEPRECATED: use /shopier/odeme-baslat endpoint instead
    # For now, just create a pending transaction (kept for backward compatibility)
    transaction_id = str(uuid.uuid4())
    transaction = {
        "id": transaction_id,
        "kullanici_id": current_user["id"],
        "tutar": tutar,
        "tip": "yukleme",
        "durum": "beklemede",
        "tarih": datetime.now(timezone.utc).isoformat()
    }
    await db.credit_transactions.insert_one(transaction)
    return {"message": "Ödeme başlatıldı", "transaction_id": transaction_id}

# ============ SHOPIER OSB ROUTES ============

# Shopier ödeme paketleri - Bakiye miktarı ve Shopier direct-link eşleştirmesi
SHOPIER_PAKETLER = {
    25: {
        "tutar": 25,
        "link": "https://www.shopier.com/rexagon/48373478",
        "aktif": True,
    },
    50: {
        "tutar": 50,
        "link": "https://www.shopier.com/rexagon/48373534",
        "aktif": True,
    },
    100: {
        "tutar": 100,
        "link": None,  # Henüz eklenmedi
        "aktif": False,
    },
    200: {
        "tutar": 200,
        "link": None,
        "aktif": False,
    },
    500: {
        "tutar": 500,
        "link": None,
        "aktif": False,
    },
}


@api_router.get("/shopier/paketler")
async def get_shopier_paketler():
    """Frontend için kullanılabilir bakiye yükleme paketlerini döner."""
    return [
        {"tutar": p["tutar"], "aktif": p["aktif"]}
        for p in SHOPIER_PAKETLER.values()
    ]


@api_router.post("/shopier/odeme-baslat")
async def shopier_start_payment(
    tutar: int,
    current_user: dict = Depends(get_current_user),
):
    """
    Kullanıcı bir bakiye paketi seçtiğinde çağrılır.
    - Pending bir credit_transaction oluşturur.
    - Shopier direct-link'e platform_order_id parametresini ekleyerek yönlendirilecek URL döner.
    """
    paket = SHOPIER_PAKETLER.get(tutar)
    if not paket:
        raise HTTPException(status_code=400, detail="Geçersiz tutar")
    if not paket["aktif"] or not paket["link"]:
        raise HTTPException(status_code=400, detail="Bu paket henüz aktif değil")

    transaction_id = str(uuid.uuid4())
    transaction = {
        "id": transaction_id,
        "kullanici_id": current_user["id"],
        "kullanici_adi": current_user.get("kullanici_adi"),
        "tutar": float(paket["tutar"]),
        "tip": "yukleme",
        "durum": "beklemede",
        "odeme_saglayici": "shopier",
        "tarih": datetime.now(timezone.utc).isoformat()
    }
    await db.credit_transactions.insert_one(transaction)

    # Shopier direct payment link'e platform_order_id parametresini ekliyoruz.
    # Bu değer OSB callback'inde geri döndürülür.
    payment_url = f"{paket['link']}?platform_order_id={transaction_id}"

    return {
        "transaction_id": transaction_id,
        "payment_url": payment_url,
        "kullanici_adi": current_user.get("kullanici_adi"),
        "tutar": paket["tutar"],
    }


@api_router.post("/shopier/osb-callback")
async def shopier_osb_callback(request: Request):
    """
    Shopier OSB (Otomatik Sipariş Bildirimi) callback endpoint.
    - HMAC-SHA256 imza doğrulaması yapar.
    - Base64 encode edilmiş sipariş verisini parse eder.
    - platform_order_id üzerinden pending transaction'ı bulup onaylar.
    - Ek güvenlik: customernote/chatdetails kısmındaki kullanıcı adını da kontrol eder.
    - Kullanıcının bakiyesini günceller.
    """
    osb_username = os.environ.get("SHOPIER_OSB_USERNAME", "").strip()
    osb_password = os.environ.get("SHOPIER_OSB_PASSWORD", "").strip()

    if not osb_username or not osb_password:
        logger.error("Shopier OSB credentials not configured")
        raise HTTPException(status_code=500, detail="OSB credentials not configured")

    # Shopier OSB verisi form-encoded olarak gelir. body[0] = base64 encoded JSON, body[1] = signature hash
    try:
        form = await request.form()
        form_dict = dict(form)
    except Exception as e:
        logger.error(f"Shopier OSB: form parse failed: {e}")
        raise HTTPException(status_code=400, detail="Invalid request format")

    # Shopier tarafından iki farklı formatta veri gelebilir:
    # 1) form fields as "0" and "1" (indexed array)
    # 2) named fields "res" and "hash" veya benzeri
    # Bu yüzden hem indexed hem named parametreleri deniyoruz.
    encoded_data = form_dict.get("0") or form_dict.get("res") or form_dict.get("data")
    provided_hash = form_dict.get("1") or form_dict.get("hash") or form_dict.get("signature")

    if not encoded_data or not provided_hash:
        # Bazı durumlarda JSON body de gelebilir
        try:
            body_json = await request.json()
            if isinstance(body_json, list) and len(body_json) >= 2:
                encoded_data = body_json[0].get("value") if isinstance(body_json[0], dict) else body_json[0]
                provided_hash = body_json[1].get("value") if isinstance(body_json[1], dict) else body_json[1]
        except Exception:
            pass

    if not encoded_data or not provided_hash:
        logger.error(f"Shopier OSB: Missing params. form={form_dict}")
        raise HTTPException(status_code=401, detail="Missing parameter")

    # HMAC-SHA256 doğrulama
    computed_hash = hmac.new(
        osb_password.encode("utf-8"),
        (str(encoded_data) + osb_username).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(computed_hash, str(provided_hash)):
        logger.error(f"Shopier OSB: hash mismatch. expected={computed_hash} got={provided_hash}")
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Verileri decode et
    try:
        decoded_bytes = base64.b64decode(encoded_data)
        order_data = json.loads(decoded_bytes.decode("utf-8"))
    except Exception as e:
        logger.error(f"Shopier OSB: decode failed: {e}")
        raise HTTPException(status_code=400, detail="Decode failed")

    logger.info(f"Shopier OSB order received: {order_data}")

    # Sipariş bilgileri
    email = order_data.get("email", "")
    order_id = str(order_data.get("orderid", ""))
    price = float(order_data.get("price", 0) or 0)
    customer_note = (order_data.get("customernote") or order_data.get("chatdetails") or "").strip()
    platform_order_id = (
        order_data.get("platform_order_id")
        or order_data.get("platformOrderId")
        or order_data.get("platformorderid")
        or ""
    )
    is_test = order_data.get("istest", 0)

    # 1) Öncelikle platform_order_id ile pending transaction'ı bulmaya çalış
    transaction = None
    if platform_order_id:
        transaction = await db.credit_transactions.find_one({
            "id": platform_order_id,
            "durum": "beklemede",
            "tip": "yukleme",
        })

    # 2) Bulunamazsa customer_note (kullanıcı adı) üzerinden en son pending yükleme'yi bul
    if not transaction and customer_note:
        transaction = await db.credit_transactions.find_one(
            {
                "kullanici_adi": {"$regex": f"^{customer_note}$", "$options": "i"},
                "durum": "beklemede",
                "tip": "yukleme",
                "tutar": price,
            },
            sort=[("tarih", -1)],
        )

    if not transaction:
        logger.warning(
            f"Shopier OSB: No matching transaction found. "
            f"platform_order_id={platform_order_id} note={customer_note} price={price} email={email}"
        )
        # Yine de success dönüyoruz çünkü Shopier tarafında retry olmasın istiyoruz;
        # işlemi manuel takip için özel bir koleksiyonda saklıyoruz.
        await db.shopier_unmatched.insert_one({
            "id": str(uuid.uuid4()),
            "order_data": order_data,
            "tarih": datetime.now(timezone.utc).isoformat(),
        })
        return "success"

    # Kullanıcıyı güncelle: transaction'ı onayla + bakiyeyi arttır
    kullanici_id = transaction["kullanici_id"]
    kullanici = await db.users.find_one({"id": kullanici_id})
    if not kullanici:
        logger.error(f"Shopier OSB: user not found. id={kullanici_id}")
        return "success"

    # Ek güvenlik: sipariş notundaki kullanıcı adı ile transaction sahibi eşleşmeli
    if customer_note:
        if customer_note.strip().lower() != (kullanici.get("kullanici_adi") or "").strip().lower():
            logger.warning(
                f"Shopier OSB: username mismatch. note={customer_note} "
                f"transaction_user={kullanici.get('kullanici_adi')} "
                f"transaction_id={transaction['id']}"
            )
            # Uyumsuzsa transaction'ı 'incelemede' olarak işaretle
            await db.credit_transactions.update_one(
                {"id": transaction["id"]},
                {"$set": {
                    "durum": "incelemede",
                    "shopier_order_id": order_id,
                    "shopier_email": email,
                    "shopier_note": customer_note,
                    "onay_tarihi": datetime.now(timezone.utc).isoformat(),
                }}
            )
            return "success"

    # Onayla + bakiye ekle
    await db.credit_transactions.update_one(
        {"id": transaction["id"]},
        {"$set": {
            "durum": "onaylandi",
            "shopier_order_id": order_id,
            "shopier_email": email,
            "shopier_note": customer_note,
            "shopier_istest": is_test,
            "onay_tarihi": datetime.now(timezone.utc).isoformat(),
        }}
    )
    await db.users.update_one(
        {"id": kullanici_id},
        {"$inc": {"kredi": float(transaction["tutar"])}}
    )
    logger.info(
        f"Shopier OSB: balance added. user={kullanici.get('kullanici_adi')} "
        f"amount={transaction['tutar']} transaction={transaction['id']}"
    )

    return "success"


@api_router.get("/shopier/transaction/{transaction_id}")
async def get_shopier_transaction_status(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Kullanıcının bekleyen ödeme durumunu sorgulaması için."""
    transaction = await db.credit_transactions.find_one(
        {"id": transaction_id, "kullanici_id": current_user["id"]},
        {"_id": 0}
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="İşlem bulunamadı")
    return transaction

# ============ MARKET ROUTES ============

@api_router.get("/market/kategoriler")
async def get_market_categories():
    categories = await db.market_categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.get("/market/en-cok-satanlar")
async def get_best_sellers():
    # Get top selling items based on purchase count
    best_sellers = await db.purchases.aggregate([
        {"$group": {
            "_id": "$urun_id",
            "satis_sayisi": {"$sum": 1},
            "urun_adi": {"$first": "$urun_adi"}
        }},
        {"$sort": {"satis_sayisi": -1}},
        {"$limit": 10}
    ]).to_list(10)
    
    # Get full item details
    item_ids = [item["_id"] for item in best_sellers]
    items = await db.market_items.find({"id": {"$in": item_ids}}, {"_id": 0}).to_list(10)
    return items

@api_router.get("/market/{kategori}/urunler")
async def get_market_items(kategori: Optional[str] = None):
    if kategori and kategori != "Tümü":
        query = {"kategori": kategori}
    else:
        query = {}
    items = await db.market_items.find(query, {"_id": 0}).to_list(1000)
    return items

@api_router.get("/market/urun/{urun_id}")
async def get_market_item(urun_id: str):
    item = await db.market_items.find_one({"id": urun_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return item

@api_router.post("/market/satin-al/{urun_id}")
async def purchase_item(urun_id: str, current_user: dict = Depends(get_current_user)):
    item = await db.market_items.find_one({"id": urun_id})
    if not item:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    
    if item["stok"] <= 0:
        raise HTTPException(status_code=400, detail="Stok tükendi")
    
    if current_user["kredi"] < item["fiyat"]:
        raise HTTPException(status_code=400, detail="Yetersiz kredi")
    
    # Kredi düş
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"kredi": -item["fiyat"]}}
    )
    
    # Stok düş
    await db.market_items.update_one(
        {"id": urun_id},
        {"$inc": {"stok": -1}}
    )
    
    # Satın alma kaydı
    purchase_id = str(uuid.uuid4())
    purchase_doc = {
        "id": purchase_id,
        "kullanici_id": current_user["id"],
        "urun_id": urun_id,
        "urun_adi": item["isim"],
        "toplam_fiyat": item["fiyat"],
        "tarih": datetime.now(timezone.utc).isoformat()
    }
    await db.purchases.insert_one(purchase_doc)
    
    minecraft_command = None
    if item.get("satin_alim_komutu"):
        raw_command = item["satin_alim_komutu"]
        # '{username}' değişkenini kullanıcının adıyla değiştir
        minecraft_command = raw_command.replace("{username}", current_user["kullanici_adi"])

        # RCON üzerinden sunucuya gönder
        asyncio.create_task(send_rcon_command(minecraft_command))

    return {
        "message": "Satın alma başarılı",
        "yeni_kredi": current_user["kredi"] - item["fiyat"],
        "minecraft_command": minecraft_command or "Komut ayarlanmamış"
    }

# ============ NEWS ROUTES ============

@api_router.get("/haberler")
async def get_news(limit: int = 10):
    news = await db.news.aggregate([
        {"$sort": {"tarih": -1}},
        {"$limit": limit},
        {"$lookup": {
            "from": "users",
            "localField": "yazar_id",
            "foreignField": "id",
            "as": "yazar"
        }},
        {"$unwind": "$yazar"},
        {"$project": {
            "_id": 0,
            "id": 1,
            "baslik": 1,
            "icerik": 1,
            "tarih": 1,
            "yazar_adi": "$yazar.kullanici_adi",
            "gorsel_url": 1,
            "goruntulenme": 1
        }}
    ]).to_list(limit)
    return news

@api_router.get("/haber/{haber_id}")
async def get_news_detail(haber_id: str):
    news = await db.news.aggregate([
        {"$match": {"id": haber_id}},
        {"$lookup": {
            "from": "users",
            "localField": "yazar_id",
            "foreignField": "id",
            "as": "yazar"
        }},
        {"$unwind": {"path": "$yazar", "preserveNullAndEmptyArrays": True}}
    ]).to_list(1)

    if not news:
        raise HTTPException(status_code=404, detail="Haber bulunamadı")

    news_item = news[0]
    news_item["yazar_adi"] = news_item.get("yazar", {}).get("kullanici_adi", "Bilinmeyen")
    if "_id" in news_item: del news_item["_id"]
    if "yazar" in news_item: del news_item["yazar"]

    await db.news.update_one({"id": haber_id}, {"$inc": {"goruntulenme": 1}})
    news_item["goruntulenme"] = news_item.get("goruntulenme", 0) + 1
    return news_item

# ============ ADMIN ROUTES ============

@api_router.get("/admin/kullanicilar")
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "sifre_hash": 0}).to_list(1000)
    return users

@api_router.put("/admin/kullanici/{user_id}")
async def update_user(
    user_id: str, 
    kredi: Optional[float] = None, 
    rol: Optional[str] = None,
    yetki: Optional[str] = None,
    yetki_gorseli: Optional[str] = None,
    discord: Optional[str] = None,
    instagram: Optional[str] = None,
    admin: dict = Depends(get_admin_user)
):
    update_data = {}
    if kredi is not None:
        update_data["kredi"] = kredi
    if rol is not None:
        update_data["rol"] = rol
    if yetki is not None:
        update_data["yetki"] = yetki
    if yetki_gorseli is not None:
        update_data["yetki_gorseli"] = yetki_gorseli
    if discord is not None:
        update_data["discord"] = discord
    if instagram is not None:
        update_data["instagram"] = instagram
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    return {"message": "Kullanıcı güncellendi"}

@api_router.delete("/admin/kullanici/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    await db.users.delete_one({"id": user_id})
    return {"message": "Kullanıcı silindi"}

@api_router.post("/admin/upload-image")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(get_admin_user)):
    images_dir = ROOT_DIR.parent / "frontend" / "public" / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    file_path = images_dir / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"gorsel_url": f"/images/{file.filename}"}

@api_router.post("/admin/haber")
async def create_news(haber: Haber, admin: dict = Depends(get_admin_user)):
    haber_id = str(uuid.uuid4())
    haber_doc = {
        "id": haber_id,
        "baslik": haber.baslik,
        "icerik": haber.icerik,
        "yazar_id": admin["id"],
        "tarih": datetime.now(timezone.utc).isoformat(),
        "gorsel_url": haber.gorsel_url,
        "goruntulenme": 0
    }
    await db.news.insert_one(haber_doc)
    return {"message": "Haber oluşturuldu", "id": haber_id}

@api_router.put("/admin/haber/{haber_id}")
async def update_news(haber_id: str, haber: Haber, admin: dict = Depends(get_admin_user)):
    await db.news.update_one(
        {"id": haber_id},
        {"$set": {"baslik": haber.baslik, "icerik": haber.icerik, "gorsel_url": haber.gorsel_url}}
    )
    return {"message": "Haber güncellendi"}

@api_router.delete("/admin/haber/{haber_id}")
async def delete_news(haber_id: str, admin: dict = Depends(get_admin_user)):
    await db.news.delete_one({"id": haber_id})
    return {"message": "Haber silindi"}

@api_router.post("/admin/market/kategori")
async def create_market_category(kategori: MarketKategori, admin: dict = Depends(get_admin_user)):
    kategori_id = str(uuid.uuid4())
    doc = {
        "id": kategori_id,
        "isim": kategori.isim,
        "aciklama": f"{kategori.isim} kategorisi"
    }
    await db.market_categories.insert_one(doc)
    return {"message": "Kategori eklendi", "id": kategori_id}

@api_router.post("/admin/market/urun")
async def create_market_item(urun: MarketUrun, admin: dict = Depends(get_admin_user)):
    urun_id = str(uuid.uuid4())
    urun_doc = {
        "id": urun_id,
        "isim": urun.isim,
        "aciklama": urun.aciklama,
        "fiyat": urun.fiyat,
        "kategori": urun.kategori,
        "stok": urun.stok,
        "gorsel": urun.gorsel,
        "indirim": urun.indirim if urun.indirim else 0,
        "detayli_bilgi": urun.detayli_bilgi,
        "satin_alim_komutu": urun.satin_alim_komutu,
        "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()
    }
    await db.market_items.insert_one(urun_doc)
    return {"message": "Ürün oluşturuldu", "id": urun_id}

@api_router.post("/admin/rcon/send")
async def admin_send_rcon(rcon_data: RconCommand, admin: dict = Depends(get_admin_user)):
    response = await send_rcon_command(rcon_data.command)
    return {"message": "Komut gönderildi", "response": response}

@api_router.put("/admin/market/urun/{urun_id}")
async def update_market_item(urun_id: str, urun: MarketUrun, admin: dict = Depends(get_admin_user)):
    update_data = urun.model_dump()
    await db.market_items.update_one(
        {"id": urun_id},
        {"$set": update_data}
    )
    return {"message": "Ürün güncellendi"}

@api_router.delete("/admin/market/urun/{urun_id}")
async def delete_market_item(urun_id: str, admin: dict = Depends(get_admin_user)):
    await db.market_items.delete_one({"id": urun_id})
    return {"message": "Ürün silindi"}

@api_router.get("/admin/forum/konular")
async def admin_get_all_topics(admin: dict = Depends(get_admin_user)):
    topics = await db.forum_topics.find({}, {"_id": 0}).sort("tarih", -1).to_list(1000)
    return topics

@api_router.put("/admin/forum/konu/{konu_id}/durum")
async def update_forum_topic_status(konu_id: str, action: str, admin: dict = Depends(get_admin_user)):
    # action can be: 'kapat', 'ac', 'cozuldu'
    update_data = {}
    if action == "kapat":
        update_data["kapali"] = True
    elif action == "ac":
        update_data["kapali"] = False
    elif action == "cozuldu":
        update_data["cozuldu"] = True
    elif action == "cozulmedi":
        update_data["cozuldu"] = False

    if update_data:
        await db.forum_topics.update_one({"id": konu_id}, {"$set": update_data})
        return {"message": "Konu durumu güncellendi"}
    return {"message": "Geçersiz işlem"}

@api_router.delete("/admin/forum/konu/{konu_id}")
async def delete_forum_topic(konu_id: str, admin: dict = Depends(get_admin_user)):
    await db.forum_topics.delete_one({"id": konu_id})
    await db.forum_replies.delete_many({"konu_id": konu_id})
    return {"message": "Konu ve cevapları silindi"}

@api_router.delete("/admin/forum/cevap/{cevap_id}")
async def delete_forum_reply(cevap_id: str, admin: dict = Depends(get_admin_user)):
    await db.forum_replies.delete_one({"id": cevap_id})
    return {"message": "Cevap silindi"}

# ============ REPORT ROUTES ============

@api_router.post("/reports")
async def create_report(report: ReportCreate, current_user: dict = Depends(get_current_user)):
    report_id = str(uuid.uuid4())
    report_doc = {
        "id": report_id,
        "baslik": report.baslik,
        "aciklama": report.aciklama,
        "konu": report.konu,
        "yazar_id": current_user["id"],
        "yazar_adi": current_user["kullanici_adi"],
        "tarih": datetime.now(timezone.utc).isoformat()
    }
    await db.reports.insert_one(report_doc)
    return {"message": "Rapor gönderildi", "id": report_id}

@api_router.get("/admin/reports")
async def get_all_reports(admin: dict = Depends(get_admin_user)):
    reports = await db.reports.find({}, {"_id": 0}).sort("tarih", -1).to_list(1000)
    return reports

@api_router.delete("/admin/reports/{report_id}")
async def delete_report(report_id: str, admin: dict = Depends(get_admin_user)):
    await db.reports.delete_one({"id": report_id})
    return {"message": "Rapor silindi"}

# ============ THEME ROUTES ============

@api_router.get("/themes")
async def get_all_themes():
    themes = await db.themes.find({}, {"_id": 0}).to_list(1000)
    return themes

@api_router.post("/admin/themes")
async def create_theme(theme: ThemeCreate, admin: dict = Depends(get_admin_user)):
    theme_id = str(uuid.uuid4())
    theme_doc = {
        "id": theme_id,
        "isim": theme.isim,
        "gorsel_url": theme.gorsel_url,
        "fiyat": theme.fiyat,
        "ambiyans": theme.ambiyans,
        "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()
    }
    await db.themes.insert_one(theme_doc)
    return {"message": "Tema oluşturuldu", "id": theme_id}

@api_router.delete("/admin/themes/{theme_id}")
async def delete_theme(theme_id: str, admin: dict = Depends(get_admin_user)):
    await db.themes.delete_one({"id": theme_id})
    return {"message": "Tema silindi"}

@api_router.put("/admin/themes/{theme_id}")
async def update_theme(theme_id: str, theme: ThemeCreate, admin: dict = Depends(get_admin_user)):
    await db.themes.update_one(
        {"id": theme_id},
        {"$set": {"isim": theme.isim, "gorsel_url": theme.gorsel_url, "fiyat": theme.fiyat, "ambiyans": theme.ambiyans}}
    )
    return {"message": "Tema güncellendi"}

@api_router.post("/themes/{theme_id}/satin-al")
async def purchase_theme(theme_id: str, current_user: dict = Depends(get_current_user)):
    theme = await db.themes.find_one({"id": theme_id}, {"_id": 0})
    if not theme:
        raise HTTPException(status_code=404, detail="Tema bulunamadı")
    
    user_themes = current_user.get("acik_temalar", [])
    if theme_id in user_themes:
        raise HTTPException(status_code=400, detail="Bu tema zaten açık")
    
    if theme["fiyat"] > 0 and current_user["kredi"] < theme["fiyat"]:
        raise HTTPException(status_code=400, detail="Yetersiz kredi")
    
    update = {"$push": {"acik_temalar": theme_id}}
    if theme["fiyat"] > 0:
        update["$inc"] = {"kredi": -theme["fiyat"]}
    
    await db.users.update_one({"id": current_user["id"]}, update)
    return {"message": "Tema açıldı", "yeni_kredi": current_user["kredi"] - theme["fiyat"]}

@api_router.put("/themes/aktif/{theme_id}")
async def set_active_theme(theme_id: str, current_user: dict = Depends(get_current_user)):
    user_themes = current_user.get("acik_temalar", [])
    if theme_id not in user_themes:
        raise HTTPException(status_code=400, detail="Bu temayı henüz açmadınız")
    
    theme = await db.themes.find_one({"id": theme_id}, {"_id": 0})
    if not theme:
        raise HTTPException(status_code=404, detail="Tema bulunamadı")
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"aktif_tema_id": theme_id, "aktif_tema_gorsel": theme["gorsel_url"], "aktif_tema_ambiyans": theme.get("ambiyans", "yok")}}
    )
    return {"message": "Tema aktifleştirildi"}

@api_router.put("/themes/kaldir")
async def remove_active_theme(current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"aktif_tema_id": None, "aktif_tema_gorsel": None, "aktif_tema_ambiyans": "yok"}}
    )
    return {"message": "Tema kaldırıldı"}




#-----------------------------


# ============ ALL MARKET ITEMS ROUTE ============
@api_router.get("/market/urunler")
async def get_all_market_items():
    items = await db.market_items.find({}, {"_id": 0}).to_list(1000)
    return items

# Include router

@app.get("/")
async def root():
    return {"message": "Rexagon Minecraft Server API", "status": "online"}

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Forum kategorilerini oluştur
    categories = ["Destek", "Şikayet", "Yardım", "Reklam", "Öneri", "Duyurular", "Genel"]
    for cat in categories:
        exists = await db.forum_categories.find_one({"isim": cat})
        if not exists:
            await db.forum_categories.insert_one({"id": str(uuid.uuid4()), "isim": cat, "aciklama": f"{cat} kategorisi"})
    
    # Market kategorilerini oluştur
    market_cats = ["VIP'ler", "Spawnerlar", "Özel Eşyalar", "Paketler"]
    for cat in market_cats:
        exists = await db.market_categories.find_one({"isim": cat})
        if not exists:
            await db.market_categories.insert_one({"id": str(uuid.uuid4()), "isim": cat, "aciklama": f"{cat} kategorisi"})
    
    # Admin kullanıcı oluştur (eğer yoksa)
    admin_exists = await db.users.find_one({"kullanici_adi": "admin"})
    if not admin_exists:
        admin_id = str(uuid.uuid4())
        admin_doc = {
            "id": admin_id,
            "kullanici_adi": "admin",
            "email": "admin@rexagon.com",
            "sifre_hash": get_password_hash("admin123"),
            "kredi": 99999.0,
            "profil_arka_plani": None,
            "rol": "admin",
            "yetki": "Yönetici",
            "yetki_gorseli": None,
            "dogum_tarihi": "2000-01-01",
            "kayit_tarihi": datetime.now(timezone.utc).isoformat(),
            "acik_temalar": [],
            "aktif_tema_id": None,
            "aktif_tema_gorsel": None
        }
        await db.users.insert_one(admin_doc)
        logger.info("Admin kullanıcı oluşturuldu: admin / admin123")

    # Default ambiyanslari ekle
    amb_count = await db.ambiances.count_documents({})
    if amb_count == 0:
        await db.ambiances.insert_many([
            {"id": "yok", "isim": "Yok", "tip": "yok"},
            {"id": "kar", "isim": "Kar (Kış)", "tip": "kar"},
            {"id": "ilkbahar", "isim": "Çiçek/Yaprak (İlkbahar)", "tip": "ilkbahar"}
        ])
    
    # Örnek Kış Teması Ekle
    kis_temasi = await db.themes.find_one({"isim": "Kış Teması"})
    if not kis_temasi:
        await db.themes.insert_one({
            "id": str(uuid.uuid4()),
            "isim": "Kış Teması",
            "gorsel_url": "/images/kis.jpg",
            "fiyat": 0,
            "ambiyans": "kar",
            "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Örnek Kış Teması oluşturuldu.")

    # Paketler kategorisine örnek ürünler ekle
    paketler_count = await db.market_items.count_documents({"kategori": "Paketler"})
    if paketler_count == 0:
        sample_items = [
            {"id": str(uuid.uuid4()), "isim": "Başlangıç Paketi", "aciklama": "Yeni oyuncular için temel araç ve malzemeler içeren harika başlangıç paketi.", "fiyat": 50.0, "kategori": "Paketler", "stok": 999, "gorsel": "", "indirim": 0, "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "isim": "Savaşçı Paketi", "aciklama": "Elmas zırh seti, kılıç ve özel büyüler içeren savaşçı paketi.", "fiyat": 150.0, "kategori": "Paketler", "stok": 500, "gorsel": "", "indirim": 10, "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "isim": "Madenci Paketi", "aciklama": "Elmas kazma, meşale ve madenci şapkası içeren özel madenci paketi.", "fiyat": 100.0, "kategori": "Paketler", "stok": 750, "gorsel": "", "indirim": 0, "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "isim": "Ultimate Paket", "aciklama": "Tüm eşyaları, VIP erişimi ve özel efektleri içeren en büyük paket!", "fiyat": 500.0, "kategori": "Paketler", "stok": 100, "gorsel": "", "indirim": 20, "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()},
        ]
        await db.market_items.insert_many(sample_items)
        logger.info("Paketler kategorisine örnek ürünler eklendi")
        

# ============ MINECRAFT SQLITE LEADERBOARD ============

@api_router.get("/leaderboard/ada-seviyesi")
async def get_top_island_level():
    islands = await db.leaderboard_islands.find({}, {"_id": 0}).sort("sira", 1).limit(10).to_list(10)
    for island in islands:
        if "ada_adi" not in island:
            island["ada_adi"] = "Bilinmeyen Ada"
        if "ada_lideri" not in island:
            island["ada_lideri"] = "MHF_Question"
        if "uyeler" not in island:
            island["uyeler"] = ""
        if "ada_seviyesi" not in island:
            island["ada_seviyesi"] = "0"
        if "sira" not in island:
            island["sira"] = 0
    return islands

    
app.include_router(api_router)