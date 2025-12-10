from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
import sqlite3
import hashlib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, static_folder=BASE_DIR)
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

# Serve static files
@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(BASE_DIR, filename)

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
    # Initialize database
    print("Database initialized!")
    print("Server running at http://localhost:5000")
    app.run(debug=True, port=5000)
