import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    conn = psycopg2.connect(
        host=os.environ['PGHOST'],
        database=os.environ['PGDATABASE'],
        user=os.environ['PGUSER'],
        password=os.environ['PGPASSWORD'],
        port=os.environ['PGPORT']
    )
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            type VARCHAR(10) NOT NULL,
            content TEXT NOT NULL,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    cur.close()
    conn.close()
    add_image_url_column()

def add_image_url_column():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT")
    conn.commit()
    cur.close()
    conn.close()

def add_post(post_type, content, image_url=None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO posts (type, content, image_url) VALUES (%s, %s, %s)", (post_type, content, image_url))
    conn.commit()
    cur.close()
    conn.close()

def get_posts(post_type):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM posts WHERE type = %s ORDER BY created_at DESC", (post_type,))
    posts = cur.fetchall()
    cur.close()
    conn.close()
    return posts
