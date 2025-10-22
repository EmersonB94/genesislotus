from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
from supabase import create_client
import os

app = Flask(__name__)
CORS(app)

# === CONEXÃO COM SUPABASE VIA API (não usa psycopg2) ===
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# === ROTA: CADASTRO / EDIÇÃO DE USUÁRIO ===
@app.route('/usuarios', methods=['GET', 'POST', 'PUT'])
def usuarios():
    if request.method == 'GET':
        try:
            response = supabase.table("usuariocad").select("*").order("nome", desc=False).execute()
            return jsonify(response.data)
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
        dtcadastro = datetime.now().isoformat()

        try:
            # Verifica se e-mail já existe
            existente = supabase.table("usuariocad").select("*").eq("email", email).execute()
            if existente.data:
                return jsonify({"erro": "E-mail já cadastrado"}), 400

            # Insere novo usuário
            supabase.table("usuariocad").insert({
                "nome": nome,
                "email": email,
                "setor": setor,
                "contato": contato,
                "senha": senha,
                "perfil": tipo,
                "tipo": tipo,
                "dtcadastro": dtcadastro
            }).execute()

            return jsonify({"mensagem": "Usuário cadastrado com sucesso!"})
        except Exception as e:
            return jsonify({"erro": str(e)}), 500

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
            supabase.table("usuariocad").update({
                "nome": nome,
                "email": email,
                "setor": setor,
                "contato": contato,
                "senha": senha,
                "tipo": tipo,
                "perfil": tipo,
                "status": status
            }).eq("email", id_email).execute()

            return jsonify({"mensagem": "Usuário atualizado com sucesso!"})
        except Exception as e:
            return jsonify({"erro": str(e)}), 500

# === ROTA: LOGIN DE USUÁRIO ===
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    senha = data.get('senha')

    try:
        result = supabase.table("usuariocad").select("*").execute() # .eq("email", email).eq("senha", senha)
        if not result.data:
            print("Consulta retornou:", usuario)
            return jsonify({"erro": "Usuário ou senha incorretos"}), 401

        usuario = result.data[0]

        # Atualiza dtacesso
        supabase.table("usuariocad").update({
            "dtacesso": datetime.now().isoformat()
        }).eq("email", email).execute()

        return jsonify({"mensagem": "Login realizado com sucesso!", "usuario": usuario})
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

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



