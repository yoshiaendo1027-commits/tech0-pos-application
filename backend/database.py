import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# .env の内容を、環境変数として読み込む
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(".env に DATABASE_URL が書かれていません")

# SQLite のときだけ必要な設定（FastAPI が複数のスレッドで動くため）
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# DBへの入り口
engine = create_engine(DATABASE_URL, connect_args=connect_args)

# DBと会話するための窓口を作る道具
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


# すべてのテーブル定義の親
class Base(DeclarativeBase):
    pass


# APIごとに、窓口を開いて、終わったら閉じる
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()