from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# === CONEXÃO COM BANCO ===


def conectar():
    return mysql.connector.connect(
        host="sql10.freesqldatabase.com",
        database="sql10805265",
        user="sql10805265",
        password="SXqt5m8ZIq",
        port=3306
    )



# === ROTA PARA SERVIR HTML ===
@app.route('/')
def index_page():
    return send_from_directory('.', 'index.html')

# === LOGIN ===
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuario WHERE email=%s AND senha=%s", (email, senha))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if usuario:
        return jsonify({"sucesso": True, "usuario": usuario})
    else:
        return jsonify({"sucesso": False, "mensagem": "Usuário ou senha incorretos."}), 401
    
@app.route('/inicio')
def inicio_page():
    return send_from_directory('.', 'inicio.html')

@app.route('/indicadores')
def page_indicador():
    return send_from_directory('.', 'indicadores.html')

@app.route('/meu_rh')
def page_meurh():
    return send_from_directory('.', 'meurh.html')

@app.route('/meu_rh_acoes_treinamentos')
def page_acoestreinamentos():
    return send_from_directory('.', 'meurhacoestreinamentos.html')

@app.route('/meu_dp')
def page_meudp():
    return send_from_directory('.', 'meudp.html')

@app.route('/meu_sst')
def page_meusst():
    return send_from_directory('.', 'meusst.html')

@app.route('/admin')
def page_admin():
    return send_from_directory('.', 'admin.html')

@app.route('/usuario')
def page_usuario():
    return send_from_directory('.', 'usuario.html')

@app.route('/empresa')
def page_empresa():
    return send_from_directory('.', 'empresa.html')

# === CADASTRO ===
@app.route('/cadastrar', methods=['POST'])
def cadastrar_usuario():
    data = request.get_json()
    conn = conectar()
    cursor = conn.cursor()

    try:
        # Verifica se o email já existe
        cursor.execute("SELECT * FROM usuario WHERE email=%s", (data['email'],))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"sucesso": False, "mensagem": "E-mail já cadastrado."}), 400

        # Insere novo usuário
        sql = """
        INSERT INTO usuario (nome, email, senha, setor, nivel_usuario, empresa, cadastro)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(sql, (
            data['nome'],
            data['email'],
            data['senha'],
            data.get('setor', ''),
            data.get('empresa', ''),
            data.get('nivel_usuario', '')
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"sucesso": True, "mensagem": "Usuário cadastrado com sucesso!"})

    except Exception as e:
        print("🚨 ERRO AO CADASTRAR USUÁRIO:", e)  # aparece no terminal Flask
        return jsonify({"sucesso": False, "mensagem": f"Erro no servidor: {str(e)}"}), 500


    finally:
        cursor.close()
        conn.close()

# === EDITAR USUÁRIO ===
@app.route('/usuario/<int:id>', methods=['PUT'])
def editar_usuario(id):
    data = request.get_json()
    conn = conectar()
    cursor = conn.cursor()

    try:
        sql = """
        UPDATE usuario
        SET nome=%s, email=%s, senha=%s, contato=%s, setor=%s, nivel_usuario=%s, empresa=%s , status=%s, atualizacao=NOW()
        WHERE id=%s
        """
        cursor.execute(sql, (
            data['nome'],
            data['email'],
            data['senha'],
            data['contato'],
            data.get('setor', ''),
            data.get('nivel_usuario', ''),
            data.get('empresa', ''),
            data.get('status', ''),
            id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Usuário atualizado com sucesso!"})

    except Exception as e:
        print("🚨 ERRO AO EDITAR USUÁRIO:", e)
        return jsonify({"sucesso": False, "mensagem": f"Erro no servidor: {str(e)}"}), 500

# === LISTAR TODOS OS USUÁRIOS ===
@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuario")
        usuarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"usuarios": usuarios})
    except Exception as e:
        print("🚨 ERRO AO LISTAR USUÁRIOS:", e)
        return jsonify({"sucesso": False, "mensagem": f"Erro no servidor: {str(e)}"}), 500
    
# === AÇÕES / TREINAMENTOS ===

@app.route('/acoes_treinamentos', methods=['GET'])
def listar_treinamentos():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM acoestreinamentos ORDER BY data_realizacao DESC")
        registros = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "dados": registros})
    except Exception as e:
        print("🚨 ERRO AO LISTAR TREINAMENTOS:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500


@app.route('/acoes_treinamentos', methods=['POST'])
def salvar_treinamento():
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()

        sql = """
        INSERT INTO acoestreinamentos (
            empresa, tema, realizado, data_realizacao, local, tipo_acao,
            duracao, departamento, responsavel, modalidade, pat, participantes, data_hora_registro
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        """

        valores = (
            data['empresa'],
            data['tema'],
            data['realizado'],
            data['dataRealizacao'],
            data.get('local', ''),
            data.get('tipoAcao', ''),
            data.get('duracao', 0),
            data.get('departamento', ''),
            data.get('responsavel', ''),
            data.get('modalidade', ''),
            data.get('pat', ''),
            data.get('participantes', 0)
        )

        cursor.execute(sql, valores)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Registro salvo com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO SALVAR TREINAMENTO:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500


@app.route('/acoes_treinamentos/<int:id>', methods=['PUT'])
def editar_treinamento(id):
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()

        sql = """
        UPDATE acoestreinamentos SET
            empresa=%s, tema=%s, realizado=%s, data_realizacao=%s, local=%s, tipo_acao=%s,
            duracao=%s, departamento=%s, responsavel=%s, modalidade=%s, pat=%s, participantes=%s
        WHERE id=%s
        """

        valores = (
            data['empresa'],
            data['tema'],
            data['realizado'],
            data['dataRealizacao'],
            data.get('local', ''),
            data.get('tipoAcao', ''),
            data.get('duracao', 0),
            data.get('departamento', ''),
            data.get('responsavel', ''),
            data.get('modalidade', ''),
            data.get('pat', ''),
            data.get('participantes', 0),
            id
        )

        cursor.execute(sql, valores)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Registro atualizado com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO EDITAR TREINAMENTO:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500


@app.route('/acoes_treinamentos/<int:id>', methods=['DELETE'])
def excluir_treinamento(id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM acoestreinamentos WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Registro excluído com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO EXCLUIR TREINAMENTO:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

# === EMPRESAS ===

@app.route('/empresas', methods=['GET'])
def listar_empresas():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM cad_empresa ORDER BY id DESC")
        empresas = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "empresas": empresas})
    except Exception as e:
        print("🚨 ERRO AO LISTAR EMPRESAS:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500


@app.route('/empresa', methods=['POST'])
def cadastrar_empresa():
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()
        sql = """
        INSERT INTO cad_empresa (nome_fantasia, cnpj, endereco, telefone, responsavel, usuario, data_hora_cadastro)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(sql, (
            data['nome_fantasia'],
            data['cnpj'],
            data['endereco'],
            data['telefone'],
            data['responsavel'],
            data.get('usuario', '')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Empresa cadastrada com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO CADASTRAR EMPRESA:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500


@app.route('/empresa/<int:id>', methods=['PUT'])
def editar_empresa(id):
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()
        sql = """
        UPDATE cad_empresa
        SET nome_fantasia=%s, cnpj=%s, endereco=%s, telefone=%s, responsavel=%s
        WHERE id=%s
        """
        cursor.execute(sql, (
            data['nome_fantasia'],
            data['cnpj'],
            data['endereco'],
            data['telefone'],
            data['responsavel'],
            id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Empresa atualizada com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO EDITAR EMPRESA:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
