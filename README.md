# Candle E-Shop
React Router v7, Prisma ORM7 kai MySQL

## Requirements

Katebaste:
    Node.js
    XAMPP
    Git

## Set up

### 1. kane clone to repository

```bash
git clone <your-repo-url>
```

### 2. Depentancies

otan to anoi3eis sto vs code anoi3e terminal kai grapse:

```bash
cd candle-e-shop
npm install
```

### 3. Database

gia na kaneis setup to DB anoi3e to XAMPP kane enable to MySQL
kai anoi3e to Shell apo to XAMPP kai grapse:

```bash
CREATE DATABASE candle_e_shop;
```

### 4. .env file

ftia3e ena arxei pou 8a legete ".env" sto root tou project
kai grapse:

```env
DATABASE_URL="mysql://root:@localhost:3306/candle_e_shop"
DATABASE_HOST="localhost"
DATABASE_USER="root"
DATABASE_PASSWORD=""
DATABASE_NAME="candle_e_shop"
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. DB Mitigation

```bash
npx prisma migrate dev
```

### 7. Bale inserts

anoi3e pali to shell sto XAMPP kai grapse:

```XAMP Shell
mysql -h localhost -u root
USE candle_e_shop;
```
kai meta:

```sql
INSERT INTO Product (title, description, price, imageUrl, visible, createdAt) VALUES
('Lavender Candle', 'A relaxing lavender scented candle', 9.99, 'https://placehold.co/400x250', 1, NOW()),
('Vanilla Candle', 'A sweet vanilla scented candle', 12.99, 'https://placehold.co/400x250', 1, NOW()),
('Rose Candle', 'A romantic rose scented candle', 14.99, 'https://placehold.co/400x250', 1, NOW());
```

### 8. Run Dev

```bash
npm run dev
```