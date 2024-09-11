from flask import Flask, render_template, request, jsonify, url_for
from database import init_db, add_post, get_posts
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

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
    post_type = request.form.get('type')
    content = request.form.get('content')
    
    if not post_type or not content:
        return jsonify({'error': 'Missing post type or content'}), 400
    
    image_url = None
    if 'image' in request.files:
        image = request.files['image']
        if image.filename != '':
            filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(image_path)
            image_url = url_for('static', filename=f'uploads/{filename}')
    
    add_post(post_type, content, image_url)
    return jsonify({'success': True}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
