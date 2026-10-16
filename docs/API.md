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

## Authentication

JWT endpoints require a configured PostgreSQL database and an active user in the `users` table.

### `POST /api/auth/login`

Request:

```json
{
  "username": "admin",
  "password": "your-password"
}
```

Response `200 OK`:

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Administrator",
    "role": "admin"
  },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

### `POST /api/auth/refresh`

Request:

```json
{
  "refreshToken": "<refresh-jwt>"
}
```

The old refresh token is revoked and a new token is issued. Reuse of a revoked token revokes its token family.

### `POST /api/auth/logout`

Request:

```json
{
  "refreshToken": "<refresh-jwt>"
}
```

Response: `204 No Content`.

### `GET /api/auth/me`

Header:

```text
Authorization: Bearer <access-jwt>
```

Response `200 OK`:

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "Administrator",
    "role": "admin"
  }
}
```

JWT flow:

1. Login returns a short-lived access token and a refresh token.
2. The server stores only the SHA-256 hash of the refresh token.
3. Refresh rotates the token and revokes the old record.
4. Logout revokes the active refresh token.