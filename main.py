from flask import Flask, render_template, request, jsonify, url_for
from database import init_db, add_post, get_posts, delete_post, edit_post, get_subtitle, update_subtitle
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database
init_db()

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/')
def public_view():
    work_posts = get_posts('work')
    personal_posts = get_posts('personal')
    subtitle = get_subtitle()
    return render_template('public.html', work_posts=work_posts, personal_posts=personal_posts, subtitle=subtitle)

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

@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
def delete_post_route(post_id):
    if delete_post(post_id):
        return jsonify({'success': True}), 200
    return jsonify({'error': 'Post not found'}), 404

@app.route('/api/posts/<int:post_id>', methods=['PUT'])
def edit_post_route(post_id):
    content = request.json.get('content')
    if not content:
        return jsonify({'error': 'Missing content'}), 400
    
    if edit_post(post_id, content):
        return jsonify({'success': True}), 200
    return jsonify({'error': 'Post not found'}), 404

@app.route('/api/subtitle', methods=['GET'])
def get_subtitle_route():
    subtitle = get_subtitle()
    return jsonify({'subtitle': subtitle})

@app.route('/api/subtitle', methods=['POST'])
def update_subtitle_route():
    subtitle = request.json.get('subtitle')
    if subtitle is None:
        return jsonify({'error': 'Missing subtitle'}), 400
    
    update_subtitle(subtitle)
    return jsonify({'success': True}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
