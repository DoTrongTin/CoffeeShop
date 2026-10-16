# CoffeeShop Backend

Backend Node.js/TypeScript cho hệ thống quản lý quán cà phê. Frontend nằm ở repository `CoffeeShop-frontend` và mặc định gọi backend tại `http://localhost:8080`.

## Công nghệ

- Node.js và TypeScript
- Express 4
- PostgreSQL thông qua `pg`, schema tại `database/schema.sql`
- JWT access token và refresh token rotation
- `bcryptjs` để kiểm tra password hash
- CORS, JSON middleware và dotenv

## Bắt đầu nhanh

Yêu cầu Node.js 20 trở lên.

```bash
npm install
npm run dev
```

Server chạy tại `http://localhost:8080`. Kiểm tra nhanh:

```bash
curl http://localhost:8080/hello
curl http://localhost:8080/api/products
```

## Biến môi trường

| Tên   | Mặc định | Mô tả                 |
| ---   | ---      | ---                   |
| Tên | Mặc định | Mô tả |
| --- | --- | --- |
| `PORT` | `8080` | Port HTTP của backend |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Development fallback | Secret ký access token |
| `JWT_REFRESH_SECRET` | Development fallback | Secret ký refresh token |
| `ACCESS_TOKEN_EXPIRES_IN` | `15m` | Thời hạn access token |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Thời hạn refresh token |

Tạo `.env` từ `.env.example`:

```env
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coffeeshop
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

Trong production, bắt buộc cấu hình hai JWT secret; fallback chỉ dùng cho development.

## Scripts

| Lệnh            | Mục đích                               |
| ---             | ---                                    |
| `npm run dev`   | Chạy development server với watch mode |
| `npm run build` | Biên dịch TypeScript vào `dist/`       |
| `npm start`     | Chạy bản đã build                      |

Quy trình production:

```bash
npm run build
npm start
```

## Cấu trúc source

```text
src/
├── app.ts                         # Express app, middleware và route registration.
├── server.ts                      # Entry point khởi động HTTP server.
├── config/                        # Environment và PostgreSQL pool.
├── common/                        # Error classes và middleware dùng chung.
└── modules/
    ├── auth/                      # Login, JWT, refresh và logout.
    └── products/                  # API sản phẩm.
```

Domain mới nên được thêm dưới `src/modules/<domain>` và giữ nguyên các lớp `routes`, `controller`, `service`, `repository` khi phù hợp.

## Database

Schema PostgreSQL đầy đủ nằm tại [database/schema.sql](database/schema.sql). Schema hiện có các nhóm chính: users, refresh tokens, products, categories, toppings, tables, customers, orders, invoices và ingredients.

Ví dụ chạy schema:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

Auth repository đã dùng PostgreSQL. Product repository hiện vẫn dùng dữ liệu in-memory để kiểm tra API.

## Authentication

Database có bảng `refresh_tokens` để hỗ trợ JWT access token ngắn hạn và refresh token rotation. Backend chỉ lưu hash của refresh token, không lưu token gốc.

Các endpoint auth đã có: login, refresh, logout và endpoint `me` yêu cầu Bearer access token. Database phải được migrate và có user trước khi gọi login.

## API

Chi tiết request/response và ví dụ `curl` nằm trong [docs/API.md](docs/API.md).

## Quy ước phát triển

- Không commit file `.env` hoặc secret JWT.
- Không trả password hash hoặc refresh token hash trong response.
- Mọi endpoint mới cần được đăng ký trong `src/app.ts` thông qua module route.
- Dùng HTTP status phù hợp và giữ response JSON nhất quán.
