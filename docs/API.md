# CoffeeShop API

Base URL mặc định: `http://localhost:8080`

## Health check

### `GET /hello`

Dùng để kiểm tra backend có đang chạy hay không.

Response `200 OK`:

```json
{
  "message": "CoffeeShop backend is running"
}
```

Example:

```bash
curl http://localhost:8080/hello
```

## Products

### `GET /api/products`

Trả về danh sách sản phẩm hiện có. Dữ liệu hiện tại được lấy từ in-memory repository.

Response `200 OK`:

```json
[
  {
    "id": "1",
    "name": "Cà phê Đen",
    "price": 20000
  },
  {
    "id": "2",
    "name": "Cà phê Sữa",
    "price": 25000
  }
]
```

Example:

```bash
curl http://localhost:8080/api/products
```

## Authentication status

Authentication endpoints are not available yet. The PostgreSQL schema already reserves `users` and `refresh_tokens` for the planned JWT flow:

1. Login returns a short-lived access token and a refresh token.
2. The server stores only the SHA-256 hash of the refresh token.
3. Refresh rotates the token and revokes the old record.
4. Logout revokes the active refresh token.

Until those endpoints are implemented, product endpoints do not require an `Authorization` header.