from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "minecraft-server-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
    email: str
    kredi: float
    profil_arka_plani: Optional[str] = None
    rol: str
    yetki: str
    yetki_gorseli: Optional[str] = None
    kayit_tarihi: str
    acik_temalar: List[str] = []
    aktif_tema_id: Optional[str] = None
    aktif_tema_gorsel: Optional[str] = None
    biyografi: Optional[str] = None
    ada_seviyesi: int = 0
    dinar: float = 0

class ForumKonu(BaseModel):
    baslik: str
    icerik: str
    kategori: str

class ForumCevap(BaseModel):
    icerik: str

class MarketUrun(BaseModel):
    isim: str
    aciklama: str
    fiyat: float
    kategori: str
    stok: int
    gorsel: Optional[str] = None
    indirim: Optional[float] = 0

class Haber(BaseModel):
    baslik: str
    icerik: str

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

class SifreDegistir(BaseModel):
    eski_sifre: str
    yeni_sifre: str

class BiyografiGuncelle(BaseModel):
    biyografi: str

# ============ AUTH HELPERS ============

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

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
    return current_user

# ============ USER ROUTES ============

@api_router.get("/users/{kullanici_adi}", response_model=UserResponse)
async def get_user_profile(kullanici_adi: str):
    user = await db.users.find_one({"kullanici_adi": kullanici_adi}, {"_id": 0, "sifre_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    # Ensure theme fields exist
    user.setdefault("acik_temalar", [])
    user.setdefault("aktif_tema_id", None)
    user.setdefault("aktif_tema_gorsel", None)
    user.setdefault("biyografi", None)
    user.setdefault("ada_seviyesi", 0)
    user.setdefault("dinar", 0)
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
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"biyografi": data.biyografi}}
    )
    return {"message": "Biyografi güncellendi"}

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

@api_router.get("/leaderboard/ada-seviyesi")
async def get_top_island_level():
    users = await db.users.find({}, {"_id": 0, "sifre_hash": 0}).sort("ada_seviyesi", -1).limit(10).to_list(10)
    for u in users:
        u.setdefault("ada_seviyesi", 0)
        u.setdefault("dinar", 0)
        u.setdefault("biyografi", None)
        u.setdefault("acik_temalar", [])
        u.setdefault("aktif_tema_id", None)
        u.setdefault("aktif_tema_gorsel", None)
    return users

@api_router.get("/leaderboard/dinar")
async def get_top_dinar():
    users = await db.users.find({}, {"_id": 0, "sifre_hash": 0}).sort("dinar", -1).limit(10).to_list(10)
    for u in users:
        u.setdefault("ada_seviyesi", 0)
        u.setdefault("dinar", 0)
        u.setdefault("biyografi", None)
        u.setdefault("acik_temalar", [])
        u.setdefault("aktif_tema_id", None)
        u.setdefault("aktif_tema_gorsel", None)
    return users

# ============ FORUM ROUTES ============

@api_router.get("/forum/kategoriler")
async def get_forum_categories():
    categories = await db.forum_categories.find({}, {"_id": 0}).to_list(100)
    return categories

@api_router.get("/forum/{kategori}/konular")
async def get_forum_topics(kategori: str, skip: int = 0, limit: int = 20):
    topics = await db.forum_topics.aggregate([
        {"$match": {"kategori": kategori}},
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

@api_router.post("/forum/konu")
async def create_forum_topic(konu: ForumKonu, current_user: dict = Depends(get_current_user)):
    konu_id = str(uuid.uuid4())
    konu_doc = {
        "id": konu_id,
        "baslik": konu.baslik,
        "icerik": konu.icerik,
        "kategori": konu.kategori,
        "yazar_id": current_user["id"],
        "tarih": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_topics.insert_one(konu_doc)
    return {"message": "Konu oluşturuldu", "id": konu_id}

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
        "tarih": datetime.now(timezone.utc).isoformat()
    }
    await db.forum_replies.insert_one(cevap_doc)
    return {"message": "Cevap eklendi", "id": cevap_id}

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
    return transactions

@api_router.post("/cuzdan/yukle")
async def load_wallet(tutar: float, current_user: dict = Depends(get_current_user)):
    # This will integrate with PayTR/Shopier
    # For now, just create a pending transaction
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
    
    # TODO: Send command to Minecraft server
    # minecraft_command = f"give {current_user['kullanici_adi']} {item['isim']}"
    # send_to_minecraft_server(minecraft_command)
    
    return {
        "message": "Satın alma başarılı",
        "yeni_kredi": current_user["kredi"] - item["fiyat"],
        "minecraft_command": f"give {current_user['kullanici_adi']} minecraft:diamond 1"  # Placeholder
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
            "yazar_adi": "$yazar.kullanici_adi"
        }}
    ]).to_list(limit)
    return news

@api_router.get("/haber/{haber_id}")
async def get_news_detail(haber_id: str):
    news = await db.news.find_one({"id": haber_id}, {"_id": 0})
    if not news:
        raise HTTPException(status_code=404, detail="Haber bulunamadı")
    return news

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
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    return {"message": "Kullanıcı güncellendi"}

@api_router.delete("/admin/kullanici/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_admin_user)):
    await db.users.delete_one({"id": user_id})
    return {"message": "Kullanıcı silindi"}

@api_router.post("/admin/haber")
async def create_news(haber: Haber, admin: dict = Depends(get_admin_user)):
    haber_id = str(uuid.uuid4())
    haber_doc = {
        "id": haber_id,
        "baslik": haber.baslik,
        "icerik": haber.icerik,
        "yazar_id": admin["id"],
        "tarih": datetime.now(timezone.utc).isoformat()
    }
    await db.news.insert_one(haber_doc)
    return {"message": "Haber oluşturuldu", "id": haber_id}

@api_router.put("/admin/haber/{haber_id}")
async def update_news(haber_id: str, haber: Haber, admin: dict = Depends(get_admin_user)):
    await db.news.update_one(
        {"id": haber_id},
        {"$set": {"baslik": haber.baslik, "icerik": haber.icerik}}
    )
    return {"message": "Haber güncellendi"}

@api_router.delete("/admin/haber/{haber_id}")
async def delete_news(haber_id: str, admin: dict = Depends(get_admin_user)):
    await db.news.delete_one({"id": haber_id})
    return {"message": "Haber silindi"}

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
        "olusturulma_tarihi": datetime.now(timezone.utc).isoformat()
    }
    await db.market_items.insert_one(urun_doc)
    return {"message": "Ürün oluşturuldu", "id": urun_id}

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
        {"$set": {"isim": theme.isim, "gorsel_url": theme.gorsel_url, "fiyat": theme.fiyat}}
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
        {"$set": {"aktif_tema_id": theme_id, "aktif_tema_gorsel": theme["gorsel_url"]}}
    )
    return {"message": "Tema aktifleştirildi"}

@api_router.put("/themes/kaldir")
async def remove_active_theme(current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"aktif_tema_id": None, "aktif_tema_gorsel": None}}
    )
    return {"message": "Tema kaldırıldı"}

# ============ ALL MARKET ITEMS ROUTE ============

@api_router.get("/market/urunler")
async def get_all_market_items():
    items = await db.market_items.find({}, {"_id": 0}).to_list(1000)
    return items

# Include router
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
