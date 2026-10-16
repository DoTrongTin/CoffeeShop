# CoffeeShop Backend

Backend Node.js/TypeScript cho hệ thống quản lý quán cà phê. Frontend nằm ở repository `CoffeeShop-frontend` và mặc định gọi backend tại `http://localhost:8080`.

## Công nghệ

- Node.js và TypeScript
- Express 4
- PostgreSQL schema tại `database/schema.sql`
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

| Tên | Mặc định | Mô tả |
| --- | --- | --- |
| `PORT` | `8080` | Port HTTP của backend |

Tạo file `.env` ở thư mục gốc nếu cần đổi port:

```env
PORT=8080
```

`dotenv` được nạp khi chạy `src/server.ts`.

## Scripts

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy development server với watch mode |
| `npm run build` | Biên dịch TypeScript vào `dist/` |
| `npm start` | Chạy bản đã build |

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
└── modules/
    └── products/
        ├── product.routes.ts      # Khai báo endpoint sản phẩm.
        ├── product.controller.ts  # Nhận request và trả response.
        ├── product.service.ts     # Business logic.
        ├── product.repository.ts  # Nguồn dữ liệu hiện tại.
        └── product.types.ts       # TypeScript types.
```

Domain mới nên được thêm dưới `src/modules/<domain>` và giữ nguyên các lớp `routes`, `controller`, `service`, `repository` khi phù hợp.

## Database

Schema PostgreSQL đầy đủ nằm tại [database/schema.sql](database/schema.sql). Schema hiện có các nhóm chính: users, refresh tokens, products, categories, toppings, tables, customers, orders, invoices và ingredients.

Ví dụ chạy schema:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

Backend hiện tại chưa kết nối database; product repository đang dùng dữ liệu in-memory để kiểm tra API.

## Authentication

Database đã có bảng `refresh_tokens` để hỗ trợ JWT access token ngắn hạn và refresh token rotation. Bảng chỉ nên lưu hash của refresh token, không lưu token gốc.

JWT endpoints và middleware xác thực chưa được triển khai trong source hiện tại. Khi triển khai, cần bổ sung secret, thời hạn token, login, refresh, logout và middleware kiểm tra role.

## API

Chi tiết request/response và ví dụ `curl` nằm trong [docs/API.md](docs/API.md).

## Quy ước phát triển

- Không commit file `.env` hoặc secret JWT.
- Không trả password hash hoặc refresh token hash trong response.
- Mọi endpoint mới cần được đăng ký trong `src/app.ts` thông qua module route.
- Dùng HTTP status phù hợp và giữ response JSON nhất quán.
