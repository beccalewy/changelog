from flask import Flask, render_template, request, jsonify
from database import init_db, add_post, get_posts
import os

app = Flask(__name__)

# Initialize database
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/posts', methods=['GET'])
def get_all_posts():
    post_type = request.args.get('type', 'work')
    posts = get_posts(post_type)
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    post_type = data.get('type')
    content = data.get('content')
    
    if not post_type or not content:
        return jsonify({'error': 'Missing post type or content'}), 400
    
    add_post(post_type, content)
    return jsonify({'success': True}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
