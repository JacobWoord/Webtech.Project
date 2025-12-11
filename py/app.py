from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for, render_template, flash
import sqlite3
import hashlib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, 
            static_folder=os.path.join(BASE_DIR, 'static'),
            template_folder=os.path.join(BASE_DIR, 'templates'))
app.secret_key = 'your-secret-key-change-this-in-production'

DATABASE = os.path.join(BASE_DIR, 'db', 'data.db')

def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    """Hash a password for storing."""
    return hashlib.sha256(password.encode()).hexdigest()

def create_dummy_data():
    data = [
        ("Jacob","jacobwoord@gmail.com","Intermadiate","HTML/CSS","Interactive","I want to learn as much as possible")
    ] 
    connection = get_db()
    cursor = connection.cursor()  
    cursor.execute(
        'INSERT INTO contacts (name,email,level,interest,method,message) VALUES (?, ?, ?, ?, ?, ?)',
        data[0]  
    )
    connection.commit()
    connection.close()

# Home page
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        # Handle contact form submission
        name = request.form.get('name')
        email = request.form.get('email')
        flash(f'Bedankt voor je inschrijving, {name}! We nemen contact op via {email}', 'success')
        return redirect(url_for('index'))
    return render_template('index.html')

# Login page
@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        conn = get_db()
        cursor = conn.cursor()
        hashed_password = hash_password(password)
        cursor.execute(
            'SELECT id, name, email, level FROM users WHERE email = ? AND password = ?',
            (email, hashed_password)
        )
        user = cursor.fetchone()
        conn.close()
        
        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['user_email'] = user['email']
            flash('Succesvol ingelogd!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Ongeldige e-mail of wachtwoord', 'error')
    
    return render_template('login.html')

# Register page
@app.route('/register', methods=['GET', 'POST'])
def register_page():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        password = request.form.get('password')
        level = request.form.get('level')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if email exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            flash('E-mail is al geregistreerd', 'error')
            conn.close()
        else:
            hashed_password = hash_password(password)
            cursor.execute(
                'INSERT INTO users (name, email, password, level) VALUES (?, ?, ?, ?)',
                (name, email, hashed_password, level)
            )
            conn.commit()
            conn.close()
            flash('Account aangemaakt! Je kunt nu inloggen.', 'success')
            return redirect(url_for('login_page'))
    
    return render_template('register.html')

# Logout
@app.route('/logout')
def logout_route():
    session.clear()
    flash('Uitgelogd!', 'success')
    return redirect(url_for('index'))

# CRUD - List all courses
@app.route('/courses')
def list_courses():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses ORDER BY id DESC')
    courses = cursor.fetchall()
    conn.close()
    return render_template('courses.html', courses=courses)

# CRUD - Create new course
@app.route('/courses/new', methods=['GET', 'POST'])
def create_course():
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        
        from datetime import datetime
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO courses (title, description, created_at) VALUES (?, ?, ?)',
            (title, description, datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        )
        conn.commit()
        conn.close()
        
        flash(f'Course "{title}" created successfully!', 'success')
        return redirect(url_for('list_courses'))
    
    return render_template('course_form.html', title='Create New Course', course=None)

# CRUD - View single course
@app.route('/courses/<int:id>')
def view_course(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses WHERE id = ?', (id,))
    course = cursor.fetchone()
    conn.close()
    
    if not course:
        flash('Course not found', 'error')
        return redirect(url_for('list_courses'))
    
    return render_template('course_detail.html', course=course)

# CRUD - Edit course
@app.route('/courses/<int:id>/edit', methods=['GET', 'POST'])
def edit_course(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses WHERE id = ?', (id,))
    course = cursor.fetchone()
    
    if not course:
        conn.close()
        flash('Course not found', 'error')
        return redirect(url_for('list_courses'))
    
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        
        cursor.execute(
            'UPDATE courses SET title = ?, description = ? WHERE id = ?',
            (title, description, id)
        )
        conn.commit()
        conn.close()
        
        flash(f'Course "{title}" updated successfully!', 'success')
        return redirect(url_for('view_course', id=id))
    
    conn.close()
    return render_template('course_form.html', title='Edit Course', course=course)

# CRUD - Delete course
@app.route('/courses/<int:id>/delete', methods=['POST'])
def delete_course(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT title FROM courses WHERE id = ?', (id,))
    course = cursor.fetchone()
    
    if course:
        title = course['title']
        cursor.execute('DELETE FROM courses WHERE id = ?', (id,))
        conn.commit()
        flash(f'Course "{title}" deleted successfully!', 'success')
    
    conn.close()
    return redirect(url_for('list_courses'))

# Register endpoint
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    level = data.get('level')

    if not all([name, email, password]):
        return jsonify({'success': False, 'message': 'Alle velden zijn verplicht'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check if email already exists
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'success': False, 'message': 'E-mail is al geregistreerd'}), 400

    # Insert new user
    hashed_password = hash_password(password)
    cursor.execute(
        'INSERT INTO users (name, email, password, level) VALUES (?, ?, ?, ?)',
        (name, email, hashed_password, level)
    )
    conn.commit()
    conn.close()

    return jsonify({'success': True, 'message': 'Account aangemaakt!'})

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'success': False, 'message': 'E-mail en wachtwoord zijn verplicht'}), 400

    conn = get_db()
    cursor = conn.cursor()

    hashed_password = hash_password(password)
    cursor.execute(
        'SELECT id, name, email, level FROM users WHERE email = ? AND password = ?',
        (email, hashed_password)
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_email'] = user['email']
        return jsonify({
            'success': True,
            'message': 'Ingelogd!',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'level': user['level']
            }
        })
    else:
        return jsonify({'success': False, 'message': 'Ongeldige e-mail of wachtwoord'}), 401

# Logout endpoint
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Uitgelogd!'})

# Check if user is logged in
@app.route('/api/me', methods=['GET'])
def get_current_user():
    if 'user_id' in session:
        return jsonify({
            'logged_in': True,
            'user': {
                'id': session['user_id'],
                'name': session['user_name'],
                'email': session['user_email']
            }
        })
    return jsonify({'logged_in': False})

if __name__ == '__main__':
    import sys
    # Only print on the main process (not the reloader)
    if sys.argv[0] != '-c':
        print("Database initialized!")
        print("Server running at http://localhost:5000")
    app.run(debug=True, port=5000)
