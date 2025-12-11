# CodeCraft - WebTech Project

Een interactief leerplatform voor HTML & CSS, gebouwd met Flask en Jinja2 template inheritance.

---

## Inhoudsopgave

1. [Jinja2 Template Syntax](#jinja2-template-syntax)
2. [Template Inheritance Uitleg](#template-inheritance-uitleg)
3. [base.html Structuur](#basehtml-structuur)
4. [Templates Extenden](#templates-extenden)
5. [Applicatie Structuur](#applicatie-structuur)
6. [Database Schema](#database-schema)
7. [Routes Overzicht](#routes-overzicht)
8. [Aanpassingen Maken](#aanpassingen-maken)

---

## Jinja2 Template Syntax

Jinja2 gebruikt speciale syntax om dynamische content in HTML te plaatsen. Er zijn drie hoofdtypen:

### 1. Variabelen: `{{ }}`

Dubbele accolades worden gebruikt om **variabelen weer te geven** in de HTML:

```html
<!-- Een variabele weergeven -->
<h1>Welkom, {{ user_name }}!</h1>

<!-- Een object property -->
<p>{{ course.title }}</p>

<!-- Met een filter (bijv. capitalize, upper, lower) -->
<p>{{ user.level | capitalize }}</p>

<!-- Berekeningen -->
<span>{{ (count / total * 100) | int }}%</span>
```

**Filters** transformeren de waarde:
- `| capitalize` - Eerste letter hoofdletter
- `| upper` - Alles hoofdletters
- `| lower` - Alles kleine letters
- `| int` - Naar integer
- `| length` - Lengte van string/lijst

### 2. Statements: `{% %}`

Enkele accolades met procent-tekens zijn voor **logica en controle**:

```html
<!-- If-else statements -->
{% if logged_in %}
    <p>Je bent ingelogd</p>
{% else %}
    <p>Log in om verder te gaan</p>
{% endif %}

<!-- For loops -->
{% for course in courses %}
    <div>{{ course.title }}</div>
{% endfor %}

<!-- Template inheritance -->
{% extends "base.html" %}
{% block content %}...{% endblock %}

<!-- Variabelen instellen -->
{% set greeting = "Hallo" %}
```

### 3. Commentaar: `{# #}`

Voor commentaar dat niet in de HTML output komt:

```html
{# Dit is een Jinja2 commentaar - niet zichtbaar in de browser #}
```

### Samenvatting Syntax

| Syntax | Gebruik | Voorbeeld |
|--------|---------|-----------|
| `{{ }}` | Variabele weergeven | `{{ user_name }}` |
| `{% %}` | Logica/statements | `{% if logged_in %}` |
| `{# #}` | Commentaar | `{# notitie #}` |

---

## Template Inheritance Uitleg

Template inheritance is een krachtige feature van Jinja2 waarmee je een **basis template** (parent) kunt maken die door andere templates (children) wordt **ge-extend**.

### Waarom Template Inheritance?

**Zonder inheritance** (slecht):
```
index.html      → navbar + content + footer (100 regels)
login.html      → navbar + content + footer (80 regels)
dashboard.html  → navbar + content + footer (90 regels)
```
Probleem: Als je de navbar wilt aanpassen, moet je dit in ALLE bestanden doen!

**Met inheritance** (goed):
```
base.html       → navbar + {% block content %} + footer
index.html      → {% extends "base.html" %} + eigen content
login.html      → {% extends "base.html" %} + eigen content
dashboard.html  → {% extends "base.html" %} + eigen content
```
Voordeel: Navbar aanpassen? Alleen in base.html!

### Hoe Werkt Het?

1. **Parent template** (`base.html`) definieert de **structuur** met **blocks**
2. **Child templates** **extenden** de parent en **vullen blocks in**

```
┌─────────────────────────────────────────────────────────┐
│  base.html (Parent Template)                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  <nav>Navbar</nav>                                │  │
│  │                                                   │  │
│  │  {% block content %}                              │  │
│  │    <!-- Standaard content (optioneel) -->        │  │
│  │  {% endblock %}                                   │  │
│  │                                                   │  │
│  │  <footer>Footer</footer>                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ extends
                          ▼
┌─────────────────────────────────────────────────────────┐
│  login.html (Child Template)                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  {% extends "base.html" %}                        │  │
│  │                                                   │  │
│  │  {% block content %}                              │  │
│  │    <h1>Inloggen</h1>                              │  │
│  │    <form>...</form>                               │  │
│  │  {% endblock %}                                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ resulteert in
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Uiteindelijke HTML Output                              │
│  ┌───────────────────────────────────────────────────┐  │
│  │  <nav>Navbar</nav>                                │  │
│  │                                                   │  │
│  │  <h1>Inloggen</h1>                                │  │
│  │  <form>...</form>                                 │  │
│  │                                                   │  │
│  │  <footer>Footer</footer>                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## base.html Structuur

Ons `base.html` bestand bevat de volgende blocks:

```html
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- BLOCK: description - voor meta description per pagina -->
    <meta name="description" content="{% block description %}CodeCraft{% endblock %}">

    <!-- BLOCK: title - voor paginatitel -->
    <title>{% block title %}CodeCraft{% endblock %}</title>

    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">

    <!-- BLOCK: extra_head - voor extra CSS/meta tags -->
    {% block extra_head %}{% endblock %}
</head>
<body>
    <!-- Navigatiebalk (altijd zichtbaar) -->
    <nav class="navbar">
        <!-- ... navbar content ... -->
    </nav>

    <!-- BLOCK: content - hoofdinhoud van de pagina -->
    <main>
        {% block content %}{% endblock %}
    </main>

    <!-- BLOCK: footer - kan overschreven worden -->
    {% block footer %}
    <footer class="footer">
        <!-- ... standaard footer ... -->
    </footer>
    {% endblock %}

    <!-- BLOCK: extra_js - voor JavaScript per pagina -->
    {% block extra_js %}{% endblock %}
</body>
</html>
```

### Beschikbare Blocks

| Block | Doel | Verplicht? |
|-------|------|------------|
| `title` | Paginatitel in browser tab | Aanbevolen |
| `description` | Meta description voor SEO | Optioneel |
| `extra_head` | Extra CSS, fonts, meta tags | Optioneel |
| `content` | Hoofdinhoud van de pagina | **Ja** |
| `footer` | Footer (heeft standaard content) | Optioneel |
| `extra_js` | JavaScript code | Optioneel |

---

## Templates Extenden

### Basis Voorbeeld

```html
{% extends "base.html" %}

{% block title %}Mijn Pagina - CodeCraft{% endblock %}

{% block content %}
<section class="contact">
    <div class="container">
        <h2>Mijn Pagina</h2>
        <p>Dit is de inhoud van mijn pagina.</p>
    </div>
</section>
{% endblock %}
```

### Met JavaScript

```html
{% extends "base.html" %}

{% block title %}Login - CodeCraft{% endblock %}

{% block content %}
<section class="contact">
    <form id="loginForm">
        <!-- form content -->
    </form>
</section>
{% endblock %}

{% block extra_js %}
<script>
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        // JavaScript code hier
    });
</script>
{% endblock %}
```

### Met Aangepaste Footer

```html
{% extends "base.html" %}

{% block content %}
<!-- pagina content -->
{% endblock %}

{% block footer %}
<footer class="footer custom-footer">
    <p>Dit is een aangepaste footer voor deze pagina!</p>
</footer>
{% endblock %}
```

### Conditionele Content in Templates

```html
{% extends "base.html" %}

{% block content %}
<div class="container">
    {% if logged_in %}
        <h1>Welkom terug, {{ user_name }}!</h1>
        <a href="{{ url_for('dashboard') }}">Ga naar Dashboard</a>
    {% else %}
        <h1>Welkom bij CodeCraft</h1>
        <a href="{{ url_for('login_page') }}">Log in</a>
    {% endif %}

    {% if courses %}
        {% for course in courses %}
            <div class="course-card">
                <h3>{{ course.title }}</h3>
                <p>{{ course.description[:100] }}...</p>
            </div>
        {% endfor %}
    {% else %}
        <p>Geen cursussen beschikbaar.</p>
    {% endif %}
</div>
{% endblock %}
```

---

## Applicatie Structuur

```
WebTech.Project/
│
├── py/
│   └── app.py              # Flask applicatie (routes, database, API)
│
├── templates/              # Jinja2 HTML templates
│   ├── base.html           # Parent template (navbar + footer)
│   ├── index.html          # Homepage
│   ├── login.html          # Login pagina
│   ├── register.html       # Registratie pagina
│   ├── dashboard.html      # Gebruiker dashboard
│   ├── profile.html        # Profiel bewerken
│   ├── course_catalog.html # Cursus overzicht (publiek)
│   ├── my_courses.html     # Ingeschreven cursussen
│   ├── course_view.html    # Cursus bekijken (student)
│   ├── courses.html        # Admin: cursus beheer
│   ├── course_form.html    # Admin: cursus maken/bewerken
│   ├── course_detail.html  # Admin: cursus details
│   └── admin_enrollments.html # Admin: inschrijvingen
│
├── static/
│   └── style.css           # Alle CSS styling
│
├── db/
│   └── data.db             # SQLite database
│
└── README.md               # Dit bestand
```

---

## Database Schema

### Users Tabel

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    level TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Courses Tabel

```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enrollments Tabel

```sql
CREATE TABLE enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(user_id, course_id)
);
```

---

## Routes Overzicht

### Publieke Routes

| Route | Methode | Functie | Template |
|-------|---------|---------|----------|
| `/` | GET | Homepage | `index.html` |
| `/login` | GET | Login pagina | `login.html` |
| `/register` | GET | Registratie pagina | `register.html` |
| `/cursussen` | GET | Cursus catalogus | `course_catalog.html` |

### API Routes

| Route | Methode | Functie |
|-------|---------|---------|
| `/api/login` | POST | Inloggen (JSON) |
| `/api/register` | POST | Registreren (JSON) |
| `/logout` | GET | Uitloggen |

### Gebruiker Routes (login vereist)

| Route | Methode | Functie | Template |
|-------|---------|---------|----------|
| `/dashboard` | GET | Dashboard | `dashboard.html` |
| `/profile` | GET/POST | Profiel bewerken | `profile.html` |
| `/mijn-cursussen` | GET | Mijn cursussen | `my_courses.html` |
| `/cursussen/<id>/inschrijven` | POST | Inschrijven voor cursus | - |
| `/mijn-cursussen/<id>` | GET | Cursus bekijken | `course_view.html` |

### Admin Routes (admin vereist)

| Route | Methode | Functie | Template |
|-------|---------|---------|----------|
| `/admin/courses` | GET | Cursus beheer | `courses.html` |
| `/admin/courses/new` | GET/POST | Nieuwe cursus | `course_form.html` |
| `/admin/courses/<id>` | GET | Cursus details | `course_detail.html` |
| `/admin/courses/<id>/edit` | GET/POST | Cursus bewerken | `course_form.html` |
| `/admin/courses/<id>/delete` | POST | Cursus verwijderen | - |
| `/admin/enrollments` | GET | Inschrijvingen | `admin_enrollments.html` |

---

## Aanpassingen Maken

### Navbar Aanpassen

**Bestand:** `templates/base.html`

```html
<nav class="navbar">
    <div class="nav-container">
        <!-- Logo aanpassen -->
        <a href="{{ url_for('index') }}" class="logo">
            <span class="logo-bracket">&lt;</span>
            <strong>Code</strong>Craft
            <span class="logo-bracket">/&gt;</span>
        </a>

        <!-- Menu items aanpassen -->
        <ul class="nav-menu">
            <li><a href="{{ url_for('index') }}">Home</a></li>
            <!-- Voeg nieuwe links toe hier -->
        </ul>
    </div>
</nav>
```

### Footer Aanpassen

**Bestand:** `templates/base.html` (voor alle pagina's)

Of in een specifieke template om de standaard footer te overschrijven:
```html
{% block footer %}
<footer class="custom-footer">
    <!-- Je aangepaste footer -->
</footer>
{% endblock %}
```

### Styling Aanpassen

**Bestand:** `static/style.css`

Belangrijke CSS classes:
- `.navbar` - Navigatiebalk
- `.footer` - Footer
- `.container` - Content container
- `.contact-form` - Formulier styling
- `.submit-button` - Buttons
- `.catalog-card` - Cursus kaarten
- `.admin-table` - Admin tabellen

### Nieuwe Pagina Toevoegen

1. **Maak een nieuwe template** in `templates/`:

```html
{% extends "base.html" %}

{% block title %}Nieuwe Pagina - CodeCraft{% endblock %}

{% block content %}
<section class="contact">
    <div class="container">
        <h2>Nieuwe Pagina</h2>
        <!-- Je content hier -->
    </div>
</section>
{% endblock %}
```

2. **Voeg een route toe** in `py/app.py`:

```python
@app.route('/nieuwe-pagina')
def nieuwe_pagina():
    return render_template('nieuwe_pagina.html',
        logged_in='user_id' in session,
        user_name=session.get('user_name'),
        is_admin=session.get('is_admin', False)
    )
```

3. **Voeg link toe in navbar** (optioneel) in `templates/base.html`

### Database Aanpassen

**Bestand:** `py/app.py`

De database wordt geïnitialiseerd in de `init_db()` functie. Om tabellen aan te passen:

```python
def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Bestaande tabellen...

    # Nieuwe tabel toevoegen
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS nieuwe_tabel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            naam TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
```

### Nieuwe Cursus Velden Toevoegen

1. Update de `courses` tabel in `init_db()`
2. Update `course_form.html` met nieuwe form fields
3. Update de `create_course()` en `edit_course()` functies in `app.py`
4. Update de weergave in `course_catalog.html`, `courses.html`, etc.

---

## Applicatie Starten

```bash
cd py
python3 app.py
```

De applicatie draait op: `http://localhost:5000`

### Standaard Admin Account

Bij eerste start wordt automatisch een admin account aangemaakt:
- **Email:** admin@codecraft.nl
- **Wachtwoord:** admin123

---

## Veelvoorkomende Jinja2 Patronen

### Flash Messages Weergeven

```html
{% with messages = get_flashed_messages(with_categories=true) %}
    {% if messages %}
        {% for category, message in messages %}
            <div class="alert alert-{{ category }}">{{ message }}</div>
        {% endfor %}
    {% endif %}
{% endwith %}
```

### URL's Genereren

```html
<!-- Statische bestanden -->
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
<img src="{{ url_for('static', filename='images/logo.png') }}">

<!-- Routes -->
<a href="{{ url_for('index') }}">Home</a>
<a href="{{ url_for('view_course', id=course.id) }}">Bekijk</a>
```

### Tekst Afkorten

```html
<!-- Beschrijving afkorten tot 150 karakters -->
<p>{{ course.description[:150] }}{% if course.description|length > 150 %}...{% endif %}</p>
```

### Datum Formatteren

```html
<!-- Alleen datum (eerste 10 karakters van timestamp) -->
<p>{{ course.created_at[:10] }}</p>

<!-- Datum + tijd (eerste 16 karakters) -->
<p>{{ enrollment.enrolled_at[:16] }}</p>
```

---

## Licentie

WebTech Project - Hanzehogeschool Groningen
