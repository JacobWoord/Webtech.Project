from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for, render_template, flash, g
from functools import wraps
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

def login_required(f):
    """Decorator to require login for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Je moet ingelogd zijn om deze pagina te bekijken.', 'error')
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    """Decorator to require admin privileges for a route."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Je moet ingelogd zijn om deze pagina te bekijken.', 'error')
            return redirect(url_for('login_page'))
        if not session.get('is_admin'):
            flash('Je hebt geen toegang tot deze pagina.', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

@app.context_processor
def inject_user():
    """Make user info available in all templates."""
    return {
        'logged_in': 'user_id' in session,
        'user_name': session.get('user_name'),
        'user_email': session.get('user_email'),
        'is_admin': session.get('is_admin', False)
    }

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
@app.route('/')
def index():
    # Fetch latest 3 courses for featured section
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses ORDER BY id DESC LIMIT 3')
    featured_courses = cursor.fetchall()
    conn.close()
    return render_template('index.html', featured_courses=featured_courses)

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
            'SELECT id, name, email, level, is_admin FROM users WHERE email = ? AND password = ?',
            (email, hashed_password)
        )
        user = cursor.fetchone()
        conn.close()

        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['user_email'] = user['email']
            session['is_admin'] = bool(user['is_admin'])
            flash(f'Welkom terug, {user["name"]}!', 'success')
            return redirect(url_for('dashboard'))
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

# Admin - View all enrollments
@app.route('/admin/enrollments')
@admin_required
def admin_enrollments():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT e.id, e.enrolled_at, u.id as user_id, u.name as user_name, u.email as user_email,
               c.id as course_id, c.title as course_title
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY e.enrolled_at DESC
    ''')
    enrollments = cursor.fetchall()
    conn.close()
    return render_template('admin_enrollments.html', enrollments=enrollments)

# CRUD - List all courses (Admin only)
@app.route('/courses')
@admin_required
def list_courses():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses ORDER BY id DESC')
    courses = cursor.fetchall()
    conn.close()
    return render_template('courses.html', courses=courses)

# CRUD - Create new course (Admin only)
@app.route('/courses/new', methods=['GET', 'POST'])
@admin_required
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

        flash(f'Cursus "{title}" succesvol aangemaakt!', 'success')
        return redirect(url_for('list_courses'))

    return render_template('course_form.html', title='Nieuwe Cursus', course=None)

# CRUD - View single course (Admin only)
@app.route('/courses/<int:id>')
@admin_required
def view_course(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses WHERE id = ?', (id,))
    course = cursor.fetchone()
    conn.close()

    if not course:
        flash('Cursus niet gevonden', 'error')
        return redirect(url_for('list_courses'))

    return render_template('course_detail.html', course=course)

# CRUD - Edit course (Admin only)
@app.route('/courses/<int:id>/edit', methods=['GET', 'POST'])
@admin_required
def edit_course(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses WHERE id = ?', (id,))
    course = cursor.fetchone()

    if not course:
        conn.close()
        flash('Cursus niet gevonden', 'error')
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

        flash(f'Cursus "{title}" succesvol bijgewerkt!', 'success')
        return redirect(url_for('view_course', id=id))

    conn.close()
    return render_template('course_form.html', title='Cursus Bewerken', course=course)

# CRUD - Delete course (Admin only)
@app.route('/courses/<int:id>/delete', methods=['POST'])
@admin_required
def delete_course(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT title FROM courses WHERE id = ?', (id,))
    course = cursor.fetchone()

    if course:
        title = course['title']
        cursor.execute('DELETE FROM courses WHERE id = ?', (id,))
        conn.commit()
        flash(f'Cursus "{title}" succesvol verwijderd!', 'success')

    conn.close()
    return redirect(url_for('list_courses'))

# User course catalog - View available courses
@app.route('/cursussen')
def course_catalog():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM courses ORDER BY id DESC')
    courses = cursor.fetchall()

    # Get user's enrolled courses if logged in
    enrolled_course_ids = []
    if 'user_id' in session:
        cursor.execute('SELECT course_id FROM enrollments WHERE user_id = ?', (session['user_id'],))
        enrolled_course_ids = [row['course_id'] for row in cursor.fetchall()]

    conn.close()
    return render_template('course_catalog.html', courses=courses, enrolled_course_ids=enrolled_course_ids)

# Enroll in a course
@app.route('/cursussen/<int:id>/inschrijven', methods=['POST'])
@login_required
def enroll_course(id):
    conn = get_db()
    cursor = conn.cursor()

    # Check if course exists
    cursor.execute('SELECT title FROM courses WHERE id = ?', (id,))
    course = cursor.fetchone()

    if not course:
        conn.close()
        flash('Cursus niet gevonden', 'error')
        return redirect(url_for('course_catalog'))

    # Check if already enrolled
    cursor.execute('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
                   (session['user_id'], id))
    if cursor.fetchone():
        conn.close()
        flash('Je bent al ingeschreven voor deze cursus', 'info')
        return redirect(url_for('course_catalog'))

    # Enroll user
    from datetime import datetime
    cursor.execute(
        'INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES (?, ?, ?)',
        (session['user_id'], id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    )
    conn.commit()
    conn.close()

    flash(f'Je bent succesvol ingeschreven voor "{course["title"]}"!', 'success')
    return redirect(url_for('course_catalog'))

# View user's enrolled courses (My Courses)
@app.route('/mijn-cursussen')
@login_required
def my_courses():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT c.*, e.enrolled_at
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
    ''', (session['user_id'],))
    courses = cursor.fetchall()
    conn.close()
    return render_template('my_courses.html', courses=courses)

# Student course view (view enrolled course details)
@app.route('/mijn-cursussen/<int:id>')
@login_required
def view_enrolled_course(id):
    conn = get_db()
    cursor = conn.cursor()

    # Check if user is enrolled in this course
    cursor.execute('''
        SELECT c.*, e.enrolled_at
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.user_id = ? AND c.id = ?
    ''', (session['user_id'], id))
    course = cursor.fetchone()
    conn.close()

    if not course:
        flash('Je bent niet ingeschreven voor deze cursus.', 'error')
        return redirect(url_for('my_courses'))

    return render_template('course_view.html', course=course)

# User Dashboard
@app.route('/dashboard')
@login_required
def dashboard():
    conn = get_db()
    cursor = conn.cursor()

    # Get user's enrolled courses
    cursor.execute('''
        SELECT c.*, e.enrolled_at
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
        LIMIT 5
    ''', (session['user_id'],))
    enrolled_courses = cursor.fetchall()

    # Get enrollment count
    cursor.execute('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?', (session['user_id'],))
    enrollment_count = cursor.fetchone()['count']

    # Get total courses available
    cursor.execute('SELECT COUNT(*) as count FROM courses')
    total_courses = cursor.fetchone()['count']

    conn.close()
    return render_template('dashboard.html',
                           enrolled_courses=enrolled_courses,
                           enrollment_count=enrollment_count,
                           total_courses=total_courses)

# User Profile
@app.route('/profiel', methods=['GET', 'POST'])
@login_required
def profile():
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        name = request.form.get('name')
        level = request.form.get('level')

        cursor.execute('UPDATE users SET name = ?, level = ? WHERE id = ?',
                       (name, level, session['user_id']))
        conn.commit()

        # Update session
        session['user_name'] = name
        flash('Profiel succesvol bijgewerkt!', 'success')

    # Get user data
    cursor.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],))
    user = cursor.fetchone()

    # Get enrollment count
    cursor.execute('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?', (session['user_id'],))
    enrollment_count = cursor.fetchone()['count']

    conn.close()
    return render_template('profile.html', user=user, enrollment_count=enrollment_count)

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
        'SELECT id, name, email, level, is_admin FROM users WHERE email = ? AND password = ?',
        (email, hashed_password)
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        session['user_id'] = user['id']
        session['user_name'] = user['name']
        session['user_email'] = user['email']
        session['is_admin'] = bool(user['is_admin'])
        return jsonify({
            'success': True,
            'message': 'Ingelogd!',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'level': user['level'],
                'is_admin': bool(user['is_admin'])
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
