import os
import sys
import argparse
from typing import List

from sqlalchemy import create_engine, MetaData, Table, select, insert, text
from sqlalchemy.engine import Engine

try:
    from dotenv import load_dotenv  # type: ignore
    load_dotenv()
except Exception:
    pass


def create_db_engine(url: str) -> Engine:
    if not url:
        raise RuntimeError("La URL de conexión no puede ser vacía")

    # Normaliza esquemas de Postgres para SQLAlchemy psycopg2
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and "+psycopg2" not in url:
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)

    return create_engine(url, pool_pre_ping=True, future=True)


def reflect_tables(metadata: MetaData, engine: Engine, table_names: List[str]) -> List[Table]:
    reflected = []
    for name in table_names:
        reflected.append(Table(name, metadata, autoload_with=engine))
    return reflected


def truncate_tables(engine: Engine, table_names: List[str]):
    with engine.begin() as conn:
        # Desactiva checks en Postgres solo si es necesario; orden correcto suele bastar
        for name in table_names:
            conn.execute(text(f'TRUNCATE TABLE "{name}" RESTART IDENTITY CASCADE'))


def copy_table(source_engine: Engine, target_engine: Engine, table: Table):
    with source_engine.connect() as src_conn, target_engine.begin() as tgt_conn:
        rows = src_conn.execute(select(table)).mappings().all()
        if not rows:
            return 0
        # Inserción masiva manteniendo IDs
        tgt_conn.execute(insert(table), rows)
        return len(rows)


def main():
    parser = argparse.ArgumentParser(description="Migra datos de MySQL a PostgreSQL (Supabase)")
    parser.add_argument("--mysql-url", default=os.getenv("MYSQL_URL"), help="URL MySQL origen, ej: mysql://user:pass@localhost/db")
    parser.add_argument("--pg-url", default=os.getenv("DATABASE_URL"), help="URL Postgres destino (Supabase)")
    parser.add_argument("--truncate", action="store_true", help="Vaciar tablas destino antes de insertar")
    args = parser.parse_args()

    if not args.mysql_url:
        print("ERROR: Define MYSQL_URL (or --mysql-url)", file=sys.stderr)
        sys.exit(1)
    if not args.pg_url:
        print("ERROR: Define DATABASE_URL (or --pg-url)", file=sys.stderr)
        sys.exit(1)

    # Orden que respeta FKs: primero tablas sin dependencias
    table_order = [
        "area",
        "tipoproveedor",
        "usuario",
        "proveedor",
    ]

    # Motores
    source_engine = create_db_engine(args.mysql_url)
    target_engine = create_db_engine(args.pg_url)

    # Usa un único MetaData para que las definiciones coincidan en insert
    metadata_src = MetaData()
    metadata_tgt = MetaData()

    src_tables = reflect_tables(metadata_src, source_engine, table_order)
    tgt_tables = reflect_tables(metadata_tgt, target_engine, table_order)

    if args.truncate:
        truncate_tables(target_engine, list(reversed(table_order)))

    total = 0
    for idx, name in enumerate(table_order):
        src_tbl = src_tables[idx]
        tgt_tbl = tgt_tables[idx]

        # Ajusta el objeto Table de destino a columnas del origen si hay difs en defaults
        # (mientras los nombres de columna coincidan, funcionará)
        copied = 0
        with source_engine.connect() as src_conn, target_engine.begin() as tgt_conn:
            rows = src_conn.execute(select(src_tbl)).mappings().all()
            if rows:
                tgt_conn.execute(insert(tgt_tbl), rows)
                copied = len(rows)
        print(f"Tabla {name}: {copied} filas copiadas")
        total += copied

    print(f"Completado. Total filas copiadas: {total}")


if __name__ == "__main__":
    main()


