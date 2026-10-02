# Coffee Shop - Các Công Nghệ Lập Trình Hiện Đại

Dự án mẫu quản lý quán Cà Phê, được xây dựng để phục vụ môn học **Các công nghệ lập trình hiện đại**.

## 🚀 Công nghệ sử dụng
- **React**: Thư viện UI.
- **Vite**: Công cụ build siêu tốc.
- **TanStack Query (React Query)**: Quản lý state server, caching, và fetching dữ liệu (đóng vai trò Controller/State manager).
- **TypeScript**: Giúp viết code chặt chẽ và an toàn hơn.

## 📂 Cấu trúc dự án theo mô hình MVC

Source code nằm trong thư mục `src/`, được phân chia theo cấu trúc **MVC**:

```text
src/
├── models/        # (Model) - Khai báo các interface/class định nghĩa cấu trúc dữ liệu.
├── controllers/   # (Controller) - Chứa các Custom Hooks sử dụng Tanstack Query để xử lý logic và cung cấp dữ liệu cho View.
├── views/         # (View) - Các component React phụ trách giao diện UI, hiển thị dữ liệu từ Controller.
├── services/      # Các hàm gọi API giao tiếp với Backend / Database.
├── assets/        # Hình ảnh, font chữ tĩnh.
├── components/    # File cấu trúc dùng chung (UI components như Button, Card,...).
├── App.tsx        # Component gốc.
└── main.tsx       # Entry point kết nối React, khởi tạo QueryClient.
```

## 🛠 Hướng dẫn chạy dự án

1. Cài đặt các dependencies:
   ```bash
   npm install
   ```

2. Khởi chạy máy chủ phát triển (Development Server):
   ```bash
   npm run dev
   ```
