-- =====================================================
-- DATABASE DEMO: PHẦN MỀM QUẢN LÝ QUÁN COFFEE (PostgreSQL)
-- =====================================================

-- 1. QUẢN LÝ ĐĂNG NHẬP ---------------------------------
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'staff'
                  CHECK (role IN ('admin', 'staff')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Refresh token cho JWT: chỉ lưu hash, không lưu token thô.
-- Khi refresh token được xoay vòng, token cũ phải được revoke và
-- replaced_by_token_id trỏ tới token mới trong cùng token_family.
CREATE TABLE refresh_tokens (
    id                   BIGSERIAL PRIMARY KEY,
    user_id              INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash           VARCHAR(64)  NOT NULL UNIQUE, -- SHA-256 dạng hex
    token_family         VARCHAR(64)  NOT NULL,
    expires_at           TIMESTAMPTZ  NOT NULL,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    revoked_at           TIMESTAMPTZ,
    replaced_by_token_id BIGINT       REFERENCES refresh_tokens(id),
    user_agent           TEXT,
    ip_address           INET
);

CREATE INDEX idx_refresh_tokens_user
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_active
    ON refresh_tokens(user_id, expires_at)
    WHERE revoked_at IS NULL;

-- 2. QUẢN LÝ SẢN PHẨM / MENU --------------------------
CREATE TABLE categories (            -- 2.1 Danh mục món
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (              -- 2.2, 2.3, 2.5 Món, giá bán, trạng thái
    id          SERIAL PRIMARY KEY,
    category_id INT          NOT NULL REFERENCES categories(id),
    name        VARCHAR(150) NOT NULL,
    price       INT          NOT NULL CHECK (price >= 0),   -- VNĐ
    image_url   VARCHAR(255),
    status      VARCHAR(20)  NOT NULL DEFAULT 'available'
                CHECK (status IN ('available', 'sold_out', 'hidden'))
);

CREATE TABLE toppings (              -- 2.4 Topping
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(100) NOT NULL,
    price  INT          NOT NULL DEFAULT 0 CHECK (price >= 0),
    status VARCHAR(20)  NOT NULL DEFAULT 'available'
           CHECK (status IN ('available', 'sold_out'))
);

-- 6. QUẢN LÝ BÀN ---------------------------------------
CREATE TABLE tables (                -- 6.1, 6.2 Danh sách bàn + trạng thái
    id     SERIAL PRIMARY KEY,
    name   VARCHAR(50) NOT NULL UNIQUE,   -- "Bàn 1", "Bàn 2"...
    status VARCHAR(20) NOT NULL DEFAULT 'empty'
           CHECK (status IN ('empty', 'occupied', 'reserved'))
);

-- 5. QUẢN LÝ KHÁCH HÀNG --------------------------------
CREATE TABLE customers (             -- 5.1, 5.2, 5.3 Thông tin, thành viên, điểm
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    phone     VARCHAR(15)  UNIQUE,
    is_member BOOLEAN      NOT NULL DEFAULT FALSE,
    points    INT          NOT NULL DEFAULT 0 CHECK (points >= 0),
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- 3. QUẢN LÝ GỌI MÓN -----------------------------------
CREATE TABLE orders (                -- 3.1 Tạo đơn gọi món
    id          SERIAL PRIMARY KEY,
    table_id    INT REFERENCES tables(id),      -- NULL nếu mang đi
    customer_id INT REFERENCES customers(id),   -- NULL nếu khách vãng lai
    user_id     INT NOT NULL REFERENCES users(id),  -- nhân viên tạo đơn
    status      VARCHAR(20) NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'paid', 'cancelled')),
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (           -- 3.2, 3.3, 3.4 Thêm/sửa/xóa, ghi chú, trạng thái món
    id         SERIAL PRIMARY KEY,
    order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity   INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price INT NOT NULL,         -- lưu giá tại thời điểm bán
    note       VARCHAR(255),         -- ghi chú: ít đá, 50% đường...
    status     VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'preparing', 'done', 'served', 'cancelled'))
);

CREATE TABLE order_item_toppings (   -- topping của từng món
    order_item_id INT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    topping_id    INT NOT NULL REFERENCES toppings(id),
    unit_price    INT NOT NULL,
    PRIMARY KEY (order_item_id, topping_id)
);

-- 4. QUẢN LÝ HÓA ĐƠN & THANH TOÁN ----------------------
CREATE TABLE invoices (              -- 4.1, 4.2, 4.3, 4.4
    id             SERIAL PRIMARY KEY,
    order_id       INT NOT NULL UNIQUE REFERENCES orders(id),
    subtotal       INT NOT NULL,                  -- tổng tiền món + topping
    discount       INT NOT NULL DEFAULT 0,
    total          INT NOT NULL,                  -- subtotal - discount
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash'
                   CHECK (payment_method IN ('cash', 'transfer', 'card')),
    points_earned  INT NOT NULL DEFAULT 0,        -- điểm cộng cho khách
    paid_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 7.3 THỐNG KÊ TỒN KHO (bản đơn giản) -------------------
CREATE TABLE ingredients (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL UNIQUE,   -- cà phê hạt, sữa, đường...
    unit      VARCHAR(20)  NOT NULL,          -- kg, lít, hộp
    quantity  NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_quantity NUMERIC(10,2) NOT NULL DEFAULT 0  -- ngưỡng cảnh báo sắp hết
);

-- INDEX CƠ BẢN ------------------------------------------
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_table      ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_invoices_paid_at  ON invoices(paid_at);

-- =====================================================
-- 7. BÁO CÁO & THỐNG KÊ: không cần bảng riêng, dùng query
-- =====================================================

-- 7.1 Doanh thu theo ngày
-- SELECT DATE(paid_at) AS ngay, SUM(total) AS doanh_thu
-- FROM invoices GROUP BY DATE(paid_at) ORDER BY ngay DESC;

-- 7.2 Top món bán chạy
-- SELECT p.name, SUM(oi.quantity) AS so_luong
-- FROM order_items oi
-- JOIN products p ON p.id = oi.product_id
-- JOIN orders o   ON o.id = oi.order_id
-- WHERE o.status = 'paid' AND oi.status <> 'cancelled'
-- GROUP BY p.name ORDER BY so_luong DESC LIMIT 10;

-- 7.3 Nguyên liệu sắp hết
-- SELECT * FROM ingredients WHERE quantity <= min_quantity;
