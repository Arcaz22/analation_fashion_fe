# API Kontrak WARDROBE

Base URL:

```text
/api/v1
```

Format response standar:

## Sukses

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

## Gagal

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "field": ["Pesan error"]
  }
}
```

## 1. Auth

Endpoint ini mendukung `login.html`.

Auth memakai pola hybrid:

- `access_token` dikirim lewat response JSON dan dipakai sebagai `Authorization: Bearer <access_token>`.
- `refresh_token` disimpan backend ke cookie `HttpOnly`, sehingga tidak dikirim lewat response JSON.
- Request dari browser harus menyertakan cookie untuk `refresh-token` dan `logout`.

### POST /api/v1/auth/register

Register user baru.

Request:

```json
{
  "name": "Admin",
  "email": "admin@wardrobe.app",
  "password": "fashion2024"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "access_token": "jwt-token",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@wardrobe.app",
      "role": "user",
      "profile_completed": false,
      "created_at": "2026-08-01T12:00:00Z",
      "updated_at": "2026-08-01T12:00:00Z"
    }
  }
}
```

Response juga mengirim cookie `refresh_token` dengan flag `HttpOnly`.

### POST /api/v1/auth/login

Login menggunakan email dan password.

Request:

```json
{
  "email": "admin@wardrobe.app",
  "password": "fashion2024"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "access_token": "jwt-token",
    "token_type": "Bearer",
    "user": {
      "id": "usr_001",
      "name": "Admin",
      "email": "admin@wardrobe.app",
      "role": "user",
      "created_at": "2026-08-01T12:00:00Z",
      "updated_at": "2026-08-01T12:00:00Z",
      "profile_completed": false
    }
  }
}
```

Response juga mengirim cookie `refresh_token` dengan flag `HttpOnly`.

Response `401`:

```json
{
  "success": false,
  "message": "Email atau password tidak valid.",
  "errors": {}
}
```

### POST /api/v1/auth/refresh-token

Memutar refresh token dari cookie dan membuat access token baru.

Request:

Tidak ada body. Refresh token dibaca dari cookie `refresh_token`.

Response `200`:

```json
{
  "success": true,
  "message": "Token berhasil diperbarui",
  "data": {
    "access_token": "jwt-token-baru",
    "token_type": "Bearer"
  }
}
```

Response juga mengganti cookie `refresh_token` dengan token baru.

### POST /api/v1/auth/logout

Logout user aktif.

Header:

```http
Authorization: Bearer <access_token>
```

Request:

Tidak ada body. Refresh token dibaca dari cookie `refresh_token`.

Response `200`:

```json
{
  "success": true,
  "message": "Logout berhasil",
  "data": null
}
```

Response juga menghapus cookie `refresh_token`. Access token aktif masuk blacklist Redis sampai waktu expired.

### GET /api/v1/auth/me

Mengambil user aktif dari access token.

Header:

```http
Authorization: Bearer <access_token>
```

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@wardrobe.app",
    "role": "user",
    "profile_completed": false,
    "created_at": "2026-08-01T12:00:00Z",
    "updated_at": "2026-08-01T12:00:00Z"
  }
}
```

## 2. User Profile

Endpoint ini mendukung `user_profile.html` dan redirect setelah login.

### GET /api/v1/users/me

Mengambil data user dan status kelengkapan profil.

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": "usr_001",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "member_since": "2023-10-01",
    "profile_completed": true,
    "skin_tone": {
      "input_method": "manual",
      "sample_area": "neck",
      "tone_label": "Autumn",
      "undertone": "Warm",
      "skin_hex": "#B87955",
      "palette_hex_list": ["#E8C49A", "#D4A870", "#B88448", "#9A6830", "#7A4C20"],
      "lab_l": 54.2,
      "lab_a": 16.4,
      "lab_b": 22.1
    },
    "body_shape": {
      "input_method": "manual",
      "gender": "male",
      "shape_label": "Trapezoid",
      "description": "Bahu sedikit lebih lebar dari pinggul dengan proporsi yang ideal.",
      "recommended_styles": ["Slim Fit", "Structured Shoulders", "Layered"],
      "shoulder_to_hip_ratio": 1.1,
      "waist_to_shoulder_ratio": 0.78,
      "waist_to_hip_ratio": 0.86
    }
  }
}
```

### PUT /api/v1/users/me

Mengubah data dasar user.

Request:

```json
{
  "name": "Alex Morgan"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Profil user berhasil diperbarui",
  "data": {
    "id": "usr_001",
    "name": "Alex Morgan",
    "email": "alex@example.com"
  }
}
```

### GET /api/v1/users/me/stats

Mengambil statistik untuk kartu ringkasan di profile.

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "total_items": 47,
    "total_recommendations": 23,
    "total_favorites": 12,
    "active_days": 89
  }
}
```

## 3. Skin Tone

Endpoint ini mendukung `skin_tone.html`.

### GET /api/v1/profile/skin-tone/metadata

Mengambil opsi dropdown skin tone.

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "sample_areas": ["face", "neck", "inner_arm", "body"],
    "undertones": ["Warm", "Cool", "Neutral"],
    "season_labels": ["Spring", "Summer", "Autumn", "Winter"]
  }
}
```

### POST /api/v1/profile/skin-tone/analyze

Menganalisis skin tone dari input manual atau kamera.

Request manual:

```json
{
  "input_method": "manual",
  "skin_hex": "#9E867E",
  "sample_area": "neck",
  "undertone": "Cool",
  "tone_label": "Autumn"
}
```

Request kamera:

```json
{
  "input_method": "camera",
  "image_base64": "data:image/jpeg;base64,...",
  "sample_area": "face"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Analisis skin tone berhasil",
  "data": {
    "input_method": "manual",
    "sample_area": "neck",
    "tone_label": "Autumn",
    "undertone": "Cool",
    "skin_hex": "#9E867E",
    "palette_hex_list": ["#D9C1B6", "#B99183", "#8F6A60", "#6A4A43"],
    "lab_l": 57.97,
    "lab_a": 7.59,
    "lab_b": 8.07
  }
}
```

### PUT /api/v1/profile/skin-tone

Menyimpan hasil skin tone ke profil user.

Request:

```json
{
  "input_method": "manual",
  "sample_area": "neck",
  "tone_label": "Autumn",
  "undertone": "Cool",
  "skin_hex": "#9E867E",
  "palette_hex_list": ["#D9C1B6", "#B99183", "#8F6A60", "#6A4A43"],
  "lab_l": 57.97,
  "lab_a": 7.59,
  "lab_b": 8.07
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Skin tone berhasil disimpan",
  "data": {
    "profile_completed": false
  }
}
```

### GET /api/v1/profile/skin-tone

Mengambil skin tone user aktif.

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "input_method": "manual",
    "sample_area": "neck",
    "tone_label": "Autumn",
    "undertone": "Cool",
    "skin_hex": "#9E867E",
    "palette_hex_list": ["#D9C1B6", "#B99183", "#8F6A60", "#6A4A43"],
    "lab_l": 57.97,
    "lab_a": 7.59,
    "lab_b": 8.07
  }
}
```

## 4. Body Shape

Endpoint ini mendukung `body_shape.html` dan `body-shape-detail.html`.

### GET /api/v1/profile/body-shape/metadata

Mengambil opsi gender, daftar shape, dan detail edukasi yang ditampilkan di halaman detail.

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "genders": ["female", "male"],
    "shapes": {
      "female": ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle"],
      "male": ["Trapezoid", "Rectangle", "Inverted Triangle", "Triangle", "Oval"]
    }
  }
}
```

### POST /api/v1/profile/body-shape/analyze

Menganalisis body shape dari pilihan manual atau kamera.

Request manual:

```json
{
  "input_method": "manual",
  "gender": "female",
  "shape_label": "Hourglass",
  "shoulder_to_hip_ratio": 1.0,
  "waist_to_shoulder_ratio": 0.75,
  "waist_to_hip_ratio": 0.7
}
```

Request kamera:

```json
{
  "input_method": "camera",
  "gender": "female",
  "image_base64": "data:image/jpeg;base64,..."
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Analisis body shape berhasil",
  "data": {
    "input_method": "manual",
    "gender": "female",
    "shape_label": "Hourglass",
    "description": "Bahu dan pinggul seimbang dengan pinggang yang ramping dan terdefinisi.",
    "recommended_styles": ["Wrap dress", "Belted waist", "Fitted tops"],
    "shoulder_to_hip_ratio": 1.0,
    "waist_to_shoulder_ratio": 0.75,
    "waist_to_hip_ratio": 0.7
  }
}
```

### PUT /api/v1/profile/body-shape

Menyimpan body shape ke profil user.

Request:

```json
{
  "input_method": "manual",
  "gender": "female",
  "shape_label": "Hourglass",
  "description": "Bahu dan pinggul seimbang dengan pinggang yang ramping dan terdefinisi.",
  "recommended_styles": ["Wrap dress", "Belted waist", "Fitted tops"],
  "shoulder_to_hip_ratio": 1.0,
  "waist_to_shoulder_ratio": 0.75,
  "waist_to_hip_ratio": 0.7
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Body shape berhasil disimpan",
  "data": {
    "profile_completed": true
  }
}
```

### GET /api/v1/profile/body-shape

Mengambil body shape user aktif.

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "input_method": "manual",
    "gender": "female",
    "shape_label": "Hourglass",
    "description": "Bahu dan pinggul seimbang dengan pinggang yang ramping dan terdefinisi.",
    "recommended_styles": ["Wrap dress", "Belted waist", "Fitted tops"],
    "shoulder_to_hip_ratio": 1.0,
    "waist_to_shoulder_ratio": 0.75,
    "waist_to_hip_ratio": 0.7
  }
}
```

## 5. Wardrobe

Endpoint ini mendukung `catalog.html` dan `new.item.html`.

Gambar item disimpan ke Cloudflare R2 sebagai satu file WebP:

```text
users/{user_id}/wardrobe/{item_id}/image.webp
```

Original upload tidak disimpan permanen. Backend melakukan resize dan convert ke WebP saat upload.

### GET /api/v1/wardrobe/items/metadata

Mengambil opsi kategori, formalitas, dan status item.

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "categories": ["accessory", "bottom", "footwear", "outer", "top"],
    "formality_levels": ["casual", "smart-casual", "formal"],
    "statuses": ["active", "archived", "laundry", "unavailable"]
  }
}
```

### GET /api/v1/wardrobe/items

Mengambil daftar item wardrobe.

Query:

```text
category=top
```

Response `200`:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "item_001",
      "category": "top",
      "dominant_color": "white",
      "description": "Classic White Cotton Shirt",
      "image_url": "https://...",
      "thumbnail_url": "https://...",
      "formality_level": "smart-casual",
      "occasion_tags": ["kuliah", "kerja"],
      "status": "active",
      "width": 960,
      "height": 1280,
      "size_bytes": 124000
    }
  ],
  "meta": {"total": 1}
}
```

### POST /api/v1/wardrobe/items

Menyimpan item wardrobe.

Content type:

```text
multipart/form-data
```

Request:

```text
image: File
category: top
dominant_color: white
description: Classic White Cotton Shirt
formality_level: smart-casual
occasion_tags: kuliah,kerja
status: active
```

Response `200`:

```json
{
  "success": true,
  "message": "Wardrobe item berhasil disimpan",
  "data": {
    "id": "item_001",
    "category": "top",
    "dominant_color": "white",
    "description": "Classic White Cotton Shirt",
    "image_url": "https://...",
    "thumbnail_url": "https://...",
    "formality_level": "smart-casual",
    "occasion_tags": ["kuliah", "kerja"],
    "status": "active",
    "width": 960,
    "height": 1280,
    "size_bytes": 124000
  }
}
```

### GET /api/v1/wardrobe/items/{item_id}

Mengambil detail satu item.

### DELETE /api/v1/wardrobe/items/{item_id}

Menghapus item.

Response `200`:

```json
{
  "success": true,
  "message": "Wardrobe item berhasil dihapus",
  "data": {
    "deleted": true
  }
}
```

## 6. Outfit Recommendations

Endpoint ini mendukung `ai_outfit_recomentaion.html` dan riwayat di `user_profile.html`.

### POST /api/v1/outfit-recommendations

Membuat rekomendasi outfit berdasarkan occasion.
Nilai `Formal Event` dikirim sebagai `formal-event`, sama seperti tag occasion pada form tambah item.

Request:

```json
{
  "occasion": "kuliah",
  "top_k": 3
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Rekomendasi outfit berhasil dibuat",
  "data": {
    "id": "rec_001",
    "occasion": "kuliah",
    "candidate_id": "top-1|bottom-1|outer-1|footwear-1",
    "candidate_count": 12,
    "outfit": {
      "top": {
        "id": "top-1",
        "category": "top",
        "dominant_color": "white",
        "description": "Oversized Linen Shirt",
        "image_key": "users/1/wardrobe/top-1/image.webp",
        "image_url": "https://...",
        "thumbnail_url": "https://..."
      },
      "bottom": {
        "id": "bottom-1",
        "category": "bottom",
        "dominant_color": "khaki",
        "description": "Straight Chino Pant",
        "image_key": "users/1/wardrobe/bottom-1/image.webp",
        "image_url": "https://...",
        "thumbnail_url": "https://..."
      },
      "outer": null,
      "footwear": {
        "id": "footwear-1",
        "category": "footwear",
        "dominant_color": "white",
        "description": "White Leather Sneakers",
        "image_key": "users/1/wardrobe/footwear-1/image.webp",
        "image_url": "https://...",
        "thumbnail_url": "https://..."
      }
    },
    "reasoning": "Clean and work-appropriate with balanced neutral colors.",
    "missing_gap": null,
    "recommendations": [
      {
        "candidate_id": "top-1|bottom-1|none|footwear-1",
        "outfit": {
          "top": {"id": "top-1", "category": "top"},
          "bottom": {"id": "bottom-1", "category": "bottom"},
          "outer": null,
          "footwear": {"id": "footwear-1", "category": "footwear"}
        },
        "reasoning": "Kombinasi ini menyeimbangkan kenyamanan untuk kuliah dengan tampilan yang tetap rapi.",
        "missing_gap": null
      }
    ],
    "wardrobe_item_ids": ["top-1", "bottom-1", "footwear-1"],
    "created_at": "2026-08-02T12:00:00Z"
  }
}
```

Response `422` saat profil atau wardrobe belum siap:

```json
{
  "success": false,
  "message": "Profil atau wardrobe belum lengkap",
  "errors": {
    "profile": ["Skin tone dan body shape wajib lengkap."],
    "wardrobe": ["Minimal butuh top, bottom, dan footwear aktif."]
  }
}
```

### GET /api/v1/outfit-recommendations/history

Mengambil riwayat rekomendasi.

Query:

```text
limit=20
```
