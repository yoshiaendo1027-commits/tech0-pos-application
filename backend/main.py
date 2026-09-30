from datetime import date
from decimal import ROUND_FLOOR, Decimal

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from database import get_db
from models import Member, Product, Staff, TaxRate, Transaction, TransactionItem

app = FastAPI()


@app.get("/")
def root():
    return {"service": "POS API", "status": "ok"}


@app.get("/api/products/{product_code}")
def get_product(product_code: str, db: Session = Depends(get_db)):
    product = db.scalars(
        select(Product).where(Product.product_code == product_code)
    ).first()

    if product is None:
        raise HTTPException(status_code=404, detail="商品がマスタ未登録です")

    return {
        "product_code": product.product_code,
        "name": product.name,
        "price": product.price,
    }


# ---- 会員 ----


@app.get("/api/members/{member_code}")
def get_member(member_code: str, db: Session = Depends(get_db)):
    member = db.scalars(
        select(Member).where(Member.member_code == member_code)
    ).first()

    if member is None:
        raise HTTPException(status_code=404, detail="該当する会員が見つかりません")

    # 画面に必要な情報だけを返す
    return {
        "member_code": member.member_code,
        "name": member.name,
    }


# ---- 購入確定 ----


# リクエストの形（金額は受け取らない）
class TransactionItemIn(BaseModel):
    product_code: str
    quantity: int = Field(ge=1, le=99)


class TransactionIn(BaseModel):
    staff_code: str
    member_code: str | None = None  # 会員でなければ省略できる
    items: list[TransactionItemIn] = Field(min_length=1)


@app.post("/api/transactions", status_code=201)
def create_transaction(body: TransactionIn, db: Session = Depends(get_db)):
    # 担当者の確認
    staff = db.scalars(
        select(Staff).where(Staff.staff_code == body.staff_code)
    ).first()
    if staff is None:
        raise HTTPException(status_code=400, detail="担当者が見つかりません")

    # 会員の確認（送られてきた場合のみ）
    member = None
    if body.member_code:
        member = db.scalars(
            select(Member).where(Member.member_code == body.member_code)
        ).first()
        if member is None:
            raise HTTPException(status_code=400, detail="該当する会員が見つかりません")

    # 現在有効な税率を、マスタから取る
    today = date.today()
    tax_rate = db.scalars(
        select(TaxRate)
        .where(TaxRate.valid_from <= today)
        .where(or_(TaxRate.valid_to.is_(None), TaxRate.valid_to >= today))
        .order_by(TaxRate.valid_from.desc())
    ).first()
    if tax_rate is None:
        raise HTTPException(status_code=500, detail="税率が設定されていません")

    # 明細を作りながら、マスタの単価で小計を計算する
    lines = []
    subtotal = 0
    for item in body.items:
        product = db.scalars(
            select(Product).where(Product.product_code == item.product_code)
        ).first()
        if product is None:
            raise HTTPException(
                status_code=400,
                detail=f"商品コード {item.product_code} はマスタ未登録です",
            )

        line_subtotal = product.price * item.quantity
        subtotal += line_subtotal
        lines.append(
            TransactionItem(
                product_id=product.id,
                product_name=product.name,  # 購入時点の名称を残す
                unit_price=product.price,  # 購入時点の単価を残す
                quantity=item.quantity,
                line_subtotal=line_subtotal,
            )
        )

    # 税額（円未満は切り捨て）
    tax_amount = int(
        (Decimal(subtotal) * tax_rate.rate / 100).to_integral_value(
            rounding=ROUND_FLOOR
        )
    )

    transaction = Transaction(
        member_id=member.id if member else None,
        staff_id=staff.id,
        subtotal=subtotal,
        discount_total=0,
        tax_amount=tax_amount,
        total_without_tax=subtotal,
        total_with_tax=subtotal + tax_amount,
        items=lines,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {
        "transaction_id": transaction.id,
        "total_without_tax": transaction.total_without_tax,
        "tax_amount": transaction.tax_amount,
        "total_with_tax": transaction.total_with_tax,
    }