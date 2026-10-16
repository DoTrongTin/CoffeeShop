const products = [
    { id: '1', name: 'Cà phê Đen', price: 20000 },
    { id: '2', name: 'Cà phê Sữa', price: 25000 },
    { id: '3', name: 'Bạc Xỉu', price: 30000 },
];
export const productRepository = {
    findAll() {
        return products;
    },
};
