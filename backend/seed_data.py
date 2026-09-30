from datetime import date
from decimal import Decimal

from sqlalchemy import select

from database import Base, SessionLocal, engine
from models import Member, Product, Staff, TaxRate

SAMPLE_PRODUCTS = [
    {"product_code": "1001", "name": "ブレンドコーヒー", "price": 400},
    {"product_code": "1002", "name": "カフェラテ", "price": 450},
    {"product_code": "1003", "name": "ホットコーラ", "price": 500},
]

# サンプルの会員（架空のデータ）
SAMPLE_MEMBERS = [
    {
        "member_code": "M0001",
        "name": "山田 花子",
        "phone": "090-0000-0001",
        "address": "東京都（サンプル）",
        "gender": "女性",
        "birth_date": date(1990, 4, 1),
    },
    {
        "member_code": "M0002",
        "name": "佐藤 一郎",
        "phone": "090-0000-0002",
        "address": "神奈川県（サンプル）",
        "gender": "男性",
        "birth_date": date(1985, 10, 20),
    },
]


def seed():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 商品
        for data in SAMPLE_PRODUCTS:
            exists = db.scalars(
                select(Product).where(Product.product_code == data["product_code"])
            ).first()
            if not exists:
                db.add(Product(**data))

        # 会員
        for data in SAMPLE_MEMBERS:
            exists = db.scalars(
                select(Member).where(Member.member_code == data["member_code"])
            ).first()
            if not exists:
                db.add(Member(**data))

        # 担当者（ログインはまだダミー。password_hash は仮の値で、認証には使わない）
        if not db.scalars(select(Staff).where(Staff.staff_code == "S001")).first():
            db.add(
                Staff(
                    staff_code="S001",
                    password_hash="PLACEHOLDER_NOT_A_REAL_HASH",
                    name="テスト太郎",
                )
            )

        # 税率（valid_to が空 = 現在有効）
        if not db.scalars(select(TaxRate)).first():
            db.add(TaxRate(rate=Decimal("10.00"), valid_from=date(2019, 10, 1)))

        db.commit()

        print("products :", len(db.scalars(select(Product)).all()), "件")
        print("members  :", len(db.scalars(select(Member)).all()), "件")
        print("staff    :", len(db.scalars(select(Staff)).all()), "件")
        print("tax_rates:", len(db.scalars(select(TaxRate)).all()), "件")
    finally:
        db.close()


if __name__ == "__main__":
    seed()