from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = Flask(__name__)
CORS(app)

# === CONEXÃO COM O BANCO (SUPABASE) ===
def get_db_connection():
    conn = psycopg2.connect(
        host='db.ywxvnonihvqfenuhdifr.supabase.co',
        port=5432,
        dbname='postgres',
        user='postgres',
        password='@dados@',
        sslmode='require'  # obrigatorio para Supabase
    )
    return conn

# === ROTA: CADASTRO / EDIÇÃO DE USUÁRIO ===
@app.route('/usuarios', methods=['GET', 'POST', 'PUT'])
def usuarios():
    if request.method == 'GET':
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute('SELECT * FROM "usuariocad" ORDER BY "nome"')
            usuarios = cur.fetchall()
            cur.close()
            conn.close()
            return jsonify(usuarios)
        except Exception as e:
            return jsonify({"erro": str(e)}), 500

    elif request.method == 'POST':
        data = request.json
        nome = data.get("nome")
        email = data.get("email")
        setor = data.get("setor", "")
        contato = data.get("contato", "")
        senha = data.get("senha")
        tipo = data.get("tipo", "Leitor")
        dtcadastro = datetime.now()

        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute('SELECT * FROM "usuariocad" WHERE "email"=%s', (email,))
            if cur.fetchone():
                return jsonify({"erro": "E-mail já cadastrado"}), 400

            cur.execute('''
                INSERT INTO "usuariocad" ("nome","email","setor","contato","senha","perfil","tipo","dtcadastro")
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
            ''', (nome,email,setor,contato,senha,tipo,tipo,dtcadastro))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"mensagem":"Usuário cadastrado com sucesso!"})
        except Exception as e:
            return jsonify({"erro": str(e)}),500

    elif request.method == 'PUT':
        data = request.json
        id_email = data.get("emailOriginal")
        nome = data.get("nome")
        email = data.get("email")
        setor = data.get("setor", "")
        contato = data.get("contato", "")
        senha = data.get("senha")
        tipo = data.get("tipo")
        status = data.get("status", "Suspensa")

        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute('''
                UPDATE "usuariocad"
                SET "nome"=%s, "email"=%s, "setor"=%s, "contato"=%s,
                    "senha"=%s, "tipo"=%s, "perfil"=%s
                WHERE "email"=%s
            ''', (nome,email,setor,contato,senha,tipo,tipo,id_email))
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({"mensagem":"Usuário atualizado com sucesso!"})
        except Exception as e:
            return jsonify({"erro": str(e)}),500

# === ROTA: LOGIN DE USUÁRIO ===
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute('SELECT * FROM "usuariocad" WHERE "email"=%s AND "senha"=%s', (email, senha))
        usuario = cur.fetchone()
        if not usuario:
            return jsonify({"erro":"Usuário ou senha incorretos"}),401

        # Atualiza dtacesso
        cur.execute('UPDATE "usuariocad" SET "dtacesso"=NOW() WHERE "email"=%s', (email,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"mensagem":"Login realizado com sucesso!","usuario":usuario})
    except Exception as e:
        return jsonify({"erro": str(e)}),500

# === SERVE O HTML ===
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('.', 'dashboard.html')

@app.route('/usuario')
def usuario_html():
    return send_from_directory('.', 'usuario.html')

if __name__ == '__main__':
    app.run(debug=True)
