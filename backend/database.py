import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")  # SQLite用（ローカル開発）

if DATABASE_URL:
    url = DATABASE_URL
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
else:
    # Azure MySQL：部品を別々に渡す（パスワードに記号があっても壊れない）
    url = URL.create(
        "mysql+pymysql",
        username=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=3306,
        database=os.getenv("DB_NAME"),
    )
    connect_args = {"ssl": {"ssl": True}}  # AzureはSSL必須

engine = create_engine(
    url,
    connect_args=connect_args,
    pool_pre_ping=True,  # 使う前に接続が生きているか確認
    pool_recycle=1800,   # 古い接続を使い回さない
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()