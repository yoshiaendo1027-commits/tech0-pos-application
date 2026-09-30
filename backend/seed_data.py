from sqlalchemy import select

from database import Base, SessionLocal, engine
from models import Product

# フロントの DUMMY_PRODUCTS と同じ3件
SAMPLE_PRODUCTS = [
    {"product_code": "1001", "name": "ブレンドコーヒー", "price": 400},
    {"product_code": "1002", "name": "カフェラテ", "price": 450},
    {"product_code": "1003", "name": "ホットコーラ", "price": 500},
]


def seed():
    # テーブルがなければ作る
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for data in SAMPLE_PRODUCTS:
            # すでに同じ商品コードがあれば、入れない
            exists = db.scalars(
                select(Product).where(Product.product_code == data["product_code"])
            ).first()
            if exists:
                continue
            db.add(Product(**data))

        db.commit()

        count = len(db.scalars(select(Product)).all())
        print(f"products テーブルの件数：{count}件")
    finally:
        db.close()


if __name__ == "__main__":
    seed()