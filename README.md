# CoffeeShop Backend

Backend Node.js/TypeScript cho hệ thống CoffeeShop. Frontend nằm ở repository `CoffeeShop-frontend`.

## 🚀 Công nghệ sử dụng
- **Express**: HTTP server và routing.
- **TypeScript**: Kiểm tra kiểu tĩnh và biên dịch backend.
- **CORS**: Cho phép frontend gọi API trong môi trường phát triển.

## 📂 Cấu trúc dự án

Source code được tổ chức theo module, mỗi module tách route, controller, service, repository và type:

```text
src/
├── app.ts                  # Khởi tạo Express và đăng ký middleware/routes.
├── server.ts               # Entry point và HTTP server.
└── modules/
   └── products/
      ├── product.routes.ts
      ├── product.controller.ts
      ├── product.service.ts
      ├── product.repository.ts
      └── product.types.ts
```

Các domain mới nên được thêm dưới `src/modules/<domain>`.

## API hiện có

- `GET /hello` - kiểm tra trạng thái server.
- `GET /api/products` - lấy danh sách sản phẩm.

## 🛠 Hướng dẫn chạy dự án

1. Cài đặt các dependencies:
   ```bash
   npm install
   ```

2. Khởi chạy máy chủ phát triển:
   ```bash
   npm run dev
   ```

Server mặc định chạy tại `http://localhost:8080`. Có thể đổi port bằng biến môi trường `PORT`.

3. Build và chạy bản production:
   ```bash
   npm run build
   npm start
   ```
