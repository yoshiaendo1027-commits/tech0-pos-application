from fastapi import Depends, FastAPI, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models import Product

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