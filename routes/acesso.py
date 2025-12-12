from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error  # opcional, para tratamento de erros;
import random, string
from datetime import datetime, date
from db import conectar # Conecta ao banco de dados;
import smtplib # Comandos dos e-mails
from email.mime.text import MIMEText # Comandos dos e-mails;
from flask import Blueprint, request, jsonify

acesso_bp = Blueprint("acesso", __name__)

@acesso_bp.route('/esqueci_senha', methods=['POST'])
def esqueci_senha():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"sucesso": False, "mensagem": "E-mail é obrigatório."}), 400

    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM cad_usuario WHERE email=%s", (email,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"sucesso": False, "mensagem": "E-mail não encontrado."}), 404

        # Gera nova senha aleatória
        nova_senha = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

        # Atualiza no banco
        cursor.execute("UPDATE cad_usuario SET senha=%s WHERE email=%s", (nova_senha, email))
        conn.commit()

        # ---- Enviar e-mail ----
        # enviar_email_nova_senha(usuario["email"], usuario["nome"], nova_senha)

        return jsonify({
            "sucesso": True,
            "mensagem": "Uma nova senha foi enviada para o seu e-mail."
        })

    except Exception as e:
        print("Erro ao redefinir senha:", e)
        return jsonify({"sucesso": False, "mensagem": "Erro ao processar solicitação."}), 500
    finally:
        cursor.close()
        conn.close()

# === LOGIN ===    
@acesso_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM cad_usuario WHERE email=%s", (email,))
        usuario = cursor.fetchone()

        if not usuario:
            return jsonify({"sucesso": False, "mensagem": "E-mail não cadastrado."})

        if usuario['status'] != 'Ativo':
            return jsonify({"sucesso": False, "mensagem": f"Usuário {usuario['status']}."})

        if usuario['senha'] != senha:
            return jsonify({"sucesso": False, "mensagem": "Senha incorreta."})

        # ✅ Atualiza o campo dtacesso com data/hora atual
        agora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute("UPDATE cad_usuario SET dtacesso=%s WHERE id=%s", (agora, usuario['id']))
        conn.commit()

        # Remove senha antes de enviar ao frontend
        usuario.pop('senha', None)
        # Converter valores de permissões para booleanos (S/N → True/False)
        usuario["perm_rh"] = (usuario.get("modrh") == "S")
        usuario["perm_dp"] = (usuario.get("moddp") == "S")
        usuario["perm_sst"] = (usuario.get("modsst") == "S")
        usuario["perm_adm"] = (usuario.get("modadm") == "S")
        usuario["perm_rh_full"] = (usuario.get("modrh_req_full") == "S")

        return jsonify({
        "sucesso": True,
        "mensagem": "Login realizado com sucesso.",
        "usuario": usuario
        })

    except Exception as e:
        print("Erro no login:", e)
        return jsonify({"sucesso": False, "mensagem": "Erro ao processar login."})
    finally:
        cursor.close()
        conn.close()