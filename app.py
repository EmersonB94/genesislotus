from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
import random, string
from datetime import datetime

agora = datetime.now()

app = Flask(__name__, static_folder='static', template_folder='.')
app.config['APPLICATION_ROOT'] = '/genesislotus'
# app = Flask(__name__)
CORS(app)

# === CONEXÃO COM BANCO freesqldatabase ===
def conectar():
    return mysql.connector.connect(
        host="sql10.freesqldatabase.com",
        database="sql10805265",
        user="sql10805265",
        password="SXqt5m8ZIq",
        port=3306
    ) 

# === CONEXÃO COM BANCO LOCAL ===
#def conectar():
    #return mysql.connector.connect(
        #host="localhost",
        #user="root",
        #password="",
        #database="genesis_lotus_db"
    #)

# === ROTA PARA SERVIR HTML ===
@app.route('/')
def index_page():
    return send_from_directory('.', 'index.html')

@app.route('/genesislotus/esqueci_senha', methods=['POST'])
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

        # Gera nova senha aleatória (8 caracteres)
        nova_senha = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

        # Atualiza no banco
        cursor.execute("UPDATE cad_usuario SET senha=%s WHERE email=%s", (nova_senha, email))
        conn.commit()

        return jsonify({
            "sucesso": True,
            "mensagem": "Uma nova senha foi gerada. Entre em contato com os administradores para obtê-la."
        })

    except Exception as e:
        print("Erro ao redefinir senha:", e)
        return jsonify({"sucesso": False, "mensagem": "Erro ao processar solicitação."}), 500
    finally:
        cursor.close()
        conn.close()

# === LOGIN ===    
@app.route('/genesislotus/login', methods=['POST'])
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

        return jsonify({"sucesso": True, "mensagem": "Login realizado com sucesso.", "usuario": usuario})

    except Exception as e:
        print("Erro no login:", e)
        return jsonify({"sucesso": False, "mensagem": "Erro ao processar login."})
    finally:
        cursor.close()
        conn.close()

@app.route('/genesislotus/inicio')
def inicio_page():
    return send_from_directory('.', 'inicio.html')

@app.route('/genesislotus/chamado')
def chamado_page():
    return send_from_directory('.', 'chamados.html')

@app.route('/genesislotus/chamados_admin')
def chamadoAdmin_page():
    return send_from_directory('.', 'chamados_admin.html')

@app.route('/layout')
def teste_page():
    return send_from_directory('.', 'layout.html')

@app.route('/genesislotus/indicadores')
def page_indicador():
    return send_from_directory('.', 'indicadores.html')

@app.route('/genesislotus/ficha_indicadores')
def page_indicadorcad():
    return send_from_directory('.', 'indicadores_cad.html')

@app.route('/genesislotus/meu_rh')
def page_meurh():
    return send_from_directory('.', 'meu_rh.html')

@app.route('/genesislotus/meu_rh_acoes_treinamentos')
def page_acoestreinamentos():
    return send_from_directory('.', 'meu_rh_acoes_treinamentos.html')

@app.route('/genesislotus/meu_rh_avaliacao_experiencia')
def page_avaliacaoexperiencia():
    return send_from_directory('.', 'meu_rh_avaliacao_experiencia.html')

@app.route('/genesislotus/meu_rh_requisicao_pessoal')
def page_requisicaopessoal():
    return send_from_directory('.', 'meu_rh_requisicao_pessoal.html')

@app.route('/genesislotus/meu_rh_entrevista_desligamento')
def page_entrevistadesligamento():
    return send_from_directory('.', 'meu_rh_entrevista_desligamento.html')

@app.route('/genesislotus/meu_dp')
def page_meudp():
    return send_from_directory('.', 'meu_dp.html')

@app.route('/genesislotus/meu_dp_cad_colaborador')
def page_cadastrocolaborador():
    return send_from_directory('.', 'meu_dp_cad_colaborador.html')

@app.route('/meu_sst')
def page_meusst():
    return send_from_directory('.', 'meusst.html')

@app.route('/admin')
def page_admin():
    return send_from_directory('.', 'admin.html')

@app.route('/genesislotus/usuario')
def page_usuario():
    return send_from_directory('.', 'usuario.html')

@app.route('/genesislotus/empresa')
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
        cursor.execute("SELECT * FROM cad_usuario WHERE email=%s", (data['email'],))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({"sucesso": False, "mensagem": "E-mail já cadastrado."}), 400

        # Insere novo usuário
        sql = """
        INSERT INTO cad_usuario (nome, email, contato, senha, setor, cargo, nivel_usuario, empresa, status, cadastro)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(sql, (
            data['nome'],
            data['email'],
            data.get('contato', ''),
            data['senha'],
            data.get('setor', ''),
            data.get('cargo', ''),
            data.get('empresa', ''),
            data.get('nivel_usuario', '')
        ))

        conn.commit()
        cursor.close()
        conn.close()

        # return jsonify({"sucesso": True, "mensagem": "Usuário cadastrado com sucesso!"})

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
        UPDATE cad_usuario
        SET nome=%s, email=%s, senha=%s, contato=%s, setor=%s, cargo=%s, 
            nivel_usuario=%s, empresa=%s, status=%s, atualizacao=NOW()
        WHERE id=%s
        """
        cursor.execute(sql, (
            data['nome'],
            data['email'],
            data['senha'],
            data.get('contato', ''),
            data.get('setor', ''),
            data.get('cargo', ''),
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
        cursor.execute("SELECT * FROM cad_usuario ORDER BY nome") 
        usuarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"usuarios": usuarios})
    except Exception as e:
        print("🚨 ERRO AO LISTAR USUÁRIOS:", e)
        return jsonify({"sucesso": False, "mensagem": f"Erro no servidor: {str(e)}"}), 500
    
@app.route('/api/atualizar_perfil', methods=['POST'])
def atualizar_perfil():
    data = request.get_json()
    user_id = data.get('id')
    senha = data.get('senha')
    contato = data.get('contato')

    if not user_id:
        return jsonify({"sucesso": False, "mensagem": "ID do usuário não informado."}), 400

    try:
        conn = conectar()
        cursor = conn.cursor()

        sql = """
            UPDATE cad_usuario
            SET contato = %s,
                senha = CASE WHEN %s <> '' THEN %s ELSE senha END,
                atualizacao = NOW()
            WHERE id = %s
        """
        cursor.execute(sql, (contato, senha, senha, user_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"sucesso": True})
    except Exception as e:
        print("🚨 ERRO AO ATUALIZAR PERFIL:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

    
# === AÇÕES / TREINAMENTOS ===

@app.route('/acoes_treinamentos', methods=['GET'])
def listar_treinamentos():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        unidade = request.args.get('unidade')
        mes = request.args.get('mes')
        ano = request.args.get('ano')

        query = "SELECT * FROM acoestreinamentos WHERE 1=1"
        params = []

        if unidade:
            query += " AND empresa = %s"
            params.append(unidade)
        if mes:
            query += " AND MONTH(data_realizacao) = %s"
            params.append(mes)
        if ano:
            query += " AND YEAR(data_realizacao) = %s"
            params.append(ano)

        query += " ORDER BY data_realizacao DESC"

        cursor.execute(query, params)
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
            data.get('empresa', ''),
            data['tema'],
            data['realizado'],
            data.get('dataRealizacao', ''),
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
    
# === AVALIAÇÃO DE EXPERIÊNCIA === #

@app.route('/api/avaliacao_experiencia', methods=['GET'])
def listar_avaliacao_experiencia():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                id,
                empresa,
                nome,
                cargo,
                dt_admissao,
                dt_integracao,
                dt_avaliacao1,
                dt_avaliacao2,
                padrinho,
                status
            FROM rg_avaliacao_experiencia
            ORDER BY id DESC
        """)
        resultados = cursor.fetchall()

        return jsonify({
            "sucesso": True,
            "dados": resultados
        })

    except Exception as e:
        # Captura e retorna erro
        return jsonify({
            "sucesso": False,
            "erro": str(e)
        }), 500

    finally:
        # Fecha conexão, se existir
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/avaliacao_experiencia/<int:id>', methods=['GET'])
def obter_avaliacao_experiencia(id):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                id,
                empresa,
                nome,
                cargo,
                DATE_FORMAT(dt_admissao, '%Y-%m-%d') AS dt_admissao,
                DATE_FORMAT(dt_integracao, '%Y-%m-%d') AS dt_integracao,
                DATE_FORMAT(dt_avaliacao1, '%Y-%m-%d') AS dt_avaliacao1,
                DATE_FORMAT(dt_avaliacao2, '%Y-%m-%d') AS dt_avaliacao2,
                padrinho,
                DATE_FORMAT(dt_padrinho, '%Y-%m-%d') AS dt_padrinho,
                status
            FROM rg_avaliacao_experiencia
            WHERE id = %s
        """, (id,))

        resultado = cursor.fetchone()

        if not resultado:
            return jsonify({
                "sucesso": False,
                "erro": "Registro não encontrado."
            }), 404

        return jsonify({
            "sucesso": True,
            "dados": resultado
        })

    except Exception as e:
        print("❌ Erro ao obter avaliação de experiência:", e)
        return jsonify({
            "sucesso": False,
            "erro": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/avaliacao_experiencia', methods=['POST'])
def salvar_avaliacao_experiencia():
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()

        sql = """
        INSERT INTO rg_avaliacao_experiencia (
            empresa, nome, cargo, dt_admissao, dt_integracao, dt_avaliacao1,
            dt_avaliacao2, padrinho, dt_padrinho, status, dt_atualizacao
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        """

        valores = (
            data['empresa'],
            data['nome'],
            data['cargo'],
            data.get('dt_admissao', ''),
            data.get('dt_integracao', ''),
            data.get('dt_avaliacao1', ''),
            data.get('dt_avaliacao2', ''),
            data.get('padrinho', ''),
            data.get('dt_padrinho', ''),
            data.get('status', ''),
        )

        cursor.execute(sql, valores)
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Registro salvo com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO SALVAR:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/avaliacao_experiencia/<int:id>', methods=['PUT'])
def editar_avaliacao_experiencia(id):
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()

        # ✅ Usando NULL (None) ao invés de strings vazias para campos opcionais
        sql = """
        UPDATE rg_avaliacao_experiencia SET
            empresa=%s,
            nome=%s,
            cargo=%s,
            dt_admissao=%s,
            dt_integracao=%s,
            dt_avaliacao1=%s,
            dt_avaliacao2=%s,
            padrinho=%s,
            dt_padrinho=%s,
            status=%s,
            dt_atualizacao=NOW()
        WHERE id=%s
        """

        # ✅ Usando `.get()` com fallback para None, não ''
        valores = (
            data.get('empresa') or None,
            data.get('nome') or None,
            data.get('cargo') or None,
            data.get('dt_admissao') or None,
            data.get('dt_integracao') or None,
            data.get('dt_avaliacao1') or None,
            data.get('dt_avaliacao2') or None,
            data.get('padrinho') or None,
            data.get('dt_padrinho') or None,
            data.get('status') or None,
            id
        )

        cursor.execute(sql, valores)
        conn.commit()

        return jsonify({"sucesso": True, "mensagem": "Registro atualizado com sucesso!"})

    except Exception as e:
        print("🚨 ERRO AO EDITAR AVALIAÇÃO DE EXPERIÊNCIA:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

    finally:
        cursor.close()
        conn.close()


@app.route('/api/avaliacao_experiencia/<int:id>', methods=['DELETE'])
def excluir_avaliacao_experiencia(id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM rg_avaliacao_experiencia WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Registro excluído com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO EXCLUIR AVALIACAO DE EXPERIENCIA:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

# === ENTREVISTA DE DESLIGAMENTO === #

@app.route('/api/entrevista_desligamento', methods=['GET'])
def listar_entrevista_desligamento():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                id,
                empresa,
                nome,
                cargo,
                dt_admissao,
                dt_demissao,
                tipo_desligamento,
                avaliador
            FROM rg_entrevista_desligamento
            ORDER BY id DESC
        """)
        resultados = cursor.fetchall()

        return jsonify({
            "sucesso": True,
            "dados": resultados
        })

    except Exception as e:
        # Captura e retorna erro
        return jsonify({
            "sucesso": False,
            "erro": str(e)
        }), 500

    finally:
        # Fecha conexão, se existir
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/entrevista_desligamento/<int:id>', methods=['GET'])
def obter_entrevista_desligamento(id):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                id,
                empresa,
                nome,
                cargo,
                DATE_FORMAT(dt_admissao, '%Y-%m-%d') AS dt_admissao,
                DATE_FORMAT(dt_demissao, '%Y-%m-%d') AS dt_demissao,
                tipo_desligamento,
                r_cargo_gostaria_exercer,
                r_gostaria_exercer_atividades,
                r_optou_responder,
                r_voltaria_trabalhar,
                avaliador
            FROM rg_entrevista_desligamento
            WHERE id = %s
        """, (id,))

        resultado = cursor.fetchone()

        if not resultado:
            return jsonify({
                "sucesso": False,
                "erro": "Registro não encontrado."
            }), 404

        return jsonify({
            "sucesso": True,
            "dados": resultado
        })

    except Exception as e:
        print("❌ Erro ao obter avaliação de experiência:", e)
        return jsonify({
            "sucesso": False,
            "erro": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


@app.route('/api/entrevista_desligamento', methods=['POST'])
def salvar_entrevista_desligamento():
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()

        sql = """
        INSERT INTO rg_entrevista_desligamento (
            empresa, nome, cargo, dt_admissao, dt_demissao, tipo_desligamento,
            avaliador, r_optou_responder, r_voltaria_trabalhar, r_gostaria_exercer_atividades, 	r_cargo_gostaria_exercer, dt_atualizacao
        ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        """

        valores = (
            data['empresa'],
            data['nome'],
            data['cargo'],
            data.get('dt_admissao', ''),
            data.get('dt_demissao', ''),
            data.get('tipo_desligamento', ''),
            data.get('avaliador', ''),
            data.get('r_optou_responder', ''),
            data.get('r_voltaria_trabalhar', ''),
            data.get('r_gostaria_exercer_atividades', ''),
            data.get('r_cargo_gostaria_exercer', ''),
        )

        cursor.execute(sql, valores)
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Registro salvo com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO SALVAR:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/entrevista_desligamento/<int:id>', methods=['PUT'])
def editar_entrevista_desligamento(id):
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()

        sql = """
        UPDATE rg_entrevista_desligamento SET
            empresa=%s, nome=%s, cargo=%s, dt_admissao=%s, dt_demissao=%s, tipo_desligamento=%s,
            avaliador=%s, r_optou_responder=%s, r_voltaria_trabalhar=%s, r_gostaria_exercer_atividades=%s, 
            r_cargo_gostaria_exercer=%s
        WHERE id=%s
        """

        valores = (
            data['empresa'],
            data['nome'],
            data['cargo'],
            data.get('dt_admissao', ''),
            data.get('dt_demissao', ''),
            data.get('tipo_desligamento', ''),
            data.get('avaliador', ''),
            data.get('r_optou_responder', ''),
            data.get('r_voltaria_trabalhar', ''),
            data.get('r_gostaria_exercer_atividades', ''),
            data.get('r_cargo_gostaria_exercer', ''),
            id
        )

        cursor.execute(sql, valores)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Registro atualizado com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO EDITAR ENTREVISTA DE DESLIGAMENTO:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

@app.route('/api/entrevista_desligamento/<int:id>', methods=['DELETE'])
def excluir_entrevista_desligamento(id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM rg_entrevista_desligamento WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True, "mensagem": "Registro excluído com sucesso!"})
    except Exception as e:
        print("🚨 ERRO AO EXCLUIR ENTREVISTA DE DESLIGAMENTO:", e)
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
    
# === INDICADORES ===

@app.route('/api/indicadores', methods=['GET'])
def obter_indicadores():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        indicador = request.args.get('indicador')
        mes = request.args.get('mes')
        ano = request.args.get('ano')
        unidade = request.args.get('unidade')

        query = "SELECT * FROM indicadores WHERE 1=1"
        params = []

        if unidade:
            query += " AND empresa = %s"
            params.append(unidade)
        if indicador:
            query += " AND indicador = %s"
            params.append(indicador)
        if mes:
            query += " AND mes = %s"
            params.append(mes)
        if ano:
            query += " AND ano = %s"
            params.append(ano)

        query += " ORDER BY ano DESC, mes ASC"
        cursor.execute(query, params)
        resultados = cursor.fetchall()
        return jsonify(resultados)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/indicadores', methods=['POST'])
def salvar_indicador():
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()
        sql = """
        INSERT INTO indicadores (empresa, indicador, mes, ano, valor, analise_critica, acao_corretiva, prazo, status, dtregistro)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s, NOW())
        """
        cursor.execute(sql, (
            data['unidade'], data['indicador'], data['mes'], data['ano'], data['valor'],
            data.get('analise_critica', ''), data.get('acao_corretiva', ''),
            data.get('prazo', None), data.get('status', 'Pendente')
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True})
    except Exception as e:
        print("🚨 ERRO AO SALVAR INDICADOR:", e)
        return jsonify({"sucesso": False, "erro": str(e)}), 500

@app.route('/api/indicadores/<int:id>', methods=['PUT'])
def editar_indicador(id):
    try:
        data = request.get_json()
        conn = conectar()
        cursor = conn.cursor()
        sql = """
        UPDATE indicadores SET empresa=%s, indicador=%s, mes=%s, ano=%s, valor=%s,
            analise_critica=%s, acao_corretiva=%s, prazo=%s, status=%s
        WHERE id=%s
        """
        cursor.execute(sql, (
            data['unidade'], data['indicador'], data['mes'], data['ano'], data['valor'],
            data.get('analise_critica', ''), data.get('acao_corretiva', ''),
            data.get('prazo', None), data.get('status', 'Pendente'), id
        ))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True})
    except Exception as e:
        print("🚨 ERRO AO EDITAR INDICADOR:", e)
        return jsonify({"sucesso": False, "erro": str(e)}), 500

@app.route('/api/indicadores/<int:id>', methods=['DELETE'])
def excluir_indicador(id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM indicadores WHERE id=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"sucesso": True})
    except Exception as e:
        print("🚨 ERRO AO EXCLUIR INDICADOR:", e)
        return jsonify({"sucesso": False, "erro": str(e)}), 500

## ANALISE DE TOTAIS ##

@app.route('/api/totais', methods=['GET'])
def obter_totais():
    try:
        # unidade = request.args.get('unidadeSelecionada')  # Captura a unidade enviada pelo front-end
        unidade = request.args.get('empresa_id')

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        # ===== Contar usuários ativos =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_usuario WHERE status='Ativo' AND empresa=%s", (unidade,))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_usuario WHERE status='Ativo'")
        total_usuarios = cursor.fetchone()['total']

        # ===== Contar chamados ativos =====
        cursor.execute("SELECT COUNT(*) AS total FROM rg_chamado WHERE status='Em aberto'")
        total_chamados = cursor.fetchone()['total']

        # ===== Contar indicadores =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM indicadores WHERE empresa=%s", (unidade,))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM indicadores")
        total_indicadores = cursor.fetchone()['total']

        # ===== Contar clientes (empresas) =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_empresa WHERE nome_fantasia=%s", (unidade,))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_empresa")
        total_clientes = cursor.fetchone()['total']

        # ===== Contar ações =====
        cursor.execute("SELECT COUNT(*) AS total FROM acoestreinamentos WHERE tipo_acao = %s", ('Ação',))
        total_acoes = cursor.fetchone()['total']


        # ===== Contar treinamentos =====
        cursor.execute("SELECT COUNT(*) AS total FROM acoestreinamentos WHERE tipo_acao = %s", ('Treinamento',))
        total_treinamentos = cursor.fetchone()['total']

        # ===== Contar requisições de pessoal =====

        cursor.execute("SELECT COUNT(*) AS total FROM rg_requisicao_pessoal")
        total_requisicoes = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) AS total FROM rg_avaliacao_experiencia")
        total_avaliacoes = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(*) AS total FROM rg_entrevista_desligamento")
        total_entrevista = cursor.fetchone()['total']

        cursor.close()
        conn.close()

        return jsonify({
            "sucesso": True,
            "totais": {
                "usuarios": total_usuarios,
                "indicadores": total_indicadores,
                "clientes": total_clientes,
                "acoes": total_acoes,
                "treinamentos": total_treinamentos,
                "requisicoes": total_requisicoes,
                "avaliacoes": total_avaliacoes,
                "entrevista": total_entrevista,
                "chamados": total_chamados
            }
        })

    except Exception as e:
        print("🚨 ERRO AO OBTER TOTAIS:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500

@app.route('/api/unidades_permitidas')
def unidades_permitidas():
    usuario_id = request.args.get('usuario_id')

    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    # Busca a empresa vinculada ao usuário
    cursor.execute("""
        SELECT id, empresa AS nome
        FROM cad_usuario
        WHERE id = %s
    """, (usuario_id,))

    resultado = cursor.fetchone()

    cursor.close()
    conn.close()

    if resultado:
        return jsonify({
            "sucesso": True,
            "unidades": [resultado],
            "unidade_padrao": resultado['nome']  # unidade padrão automática
        })
    else:
        return jsonify({
            "sucesso": False,
            "mensagem": "Usuário não encontrado ou sem empresa vinculada."
        })

def gerar_numero_requisicao():
    # Gera REQ-YYYYMMDD-HHMM-XXXX
    now = datetime.now().strftime("%Y%m%d%H%M%S")
    suf = ''.join(random.choices(string.digits, k=4))
    return f"REQ-{now}-{suf}"

# === LISTAR (com filtros: unidade, mes, ano, status) ===
@app.route('/api/requisicoes_pessoal', methods=['GET'])
def listar_requisicoes():
    unidade = request.args.get('unidade')
    mes = request.args.get('mes')  # "01".."12"
    ano = request.args.get('ano')  # "2025"
    status = request.args.get('status')

    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM rg_requisicao_pessoal WHERE 1=1"
        params = []

        if unidade:
            query += " AND empresa = %s"
            params.append(unidade)
        if status:
            query += " AND status = %s"
            params.append(status)
        if ano:
            # filtrar pelo ano da data_solicitacao
            if mes:
                # filtrar por ano e mês
                query += " AND DATE_FORMAT(data_solicitacao, '%%Y') = %s AND DATE_FORMAT(data_solicitacao, '%%m') = %s"
                params.extend([ano, mes])
            else:
                query += " AND DATE_FORMAT(data_solicitacao, '%%Y') = %s"
                params.append(ano)
        elif mes:
            # se mês sem ano, pega mês independente do ano
            query += " AND DATE_FORMAT(data_solicitacao, '%%m') = %s"
            params.append(mes)

        query += " ORDER BY data_solicitacao DESC"

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()

        
        return jsonify({"sucesso": True, "dados": rows})
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": f"Erro listar: {str(e)}"}), 500
    finally:
        try: cursor.close(); conn.close()
        except: pass

# === BUSCAR 1 REQUISIÇÃO ===
@app.route('/api/requisicoes_pessoal/<int:id>', methods=['GET'])
def obter_requisicao(id):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        # Consulta pelo ID
        cursor.execute("SELECT * FROM rg_requisicao_pessoal WHERE id = %s", (id,))
        row = cursor.fetchone()

        if row:
            # Converter qualquer campo de data para string
            for k in (
                'data_solicitacao',
                'prazo_desejado',
                'data_abertura_vaga',
                'data_inicio_selecao',
                'data_contratacao',
                'data_criacao',
                'ultima_atualizacao'
            ):
                if row.get(k):
                    row[k] = str(row[k])  # ✅ converte para string sem precisar de datetime

            return jsonify({"sucesso": True, "dado": row})
        else:
            return jsonify({"sucesso": False, "mensagem": "Registro não encontrado."}), 404

    except Exception as e:
        # Retorna erro detalhado no JSON
        return jsonify({"sucesso": False, "mensagem": f"Erro ao obter requisição: {str(e)}"}), 500

    finally:
        # Fecha a conexão de forma segura
        try:
            cursor.close()
            conn.close()
        except:
            pass

# === CRIAR ===
@app.route('/api/requisicoes_pessoal', methods=['POST'])
def criar_requisicao():
    dados = request.get_json()
    # campos esperados da tabela (mínimos verificados)
    solicitante_nome = dados.get('solicitante_nome')
    tipo_requisicao = dados.get('tipo_requisicao')
    titulo_cargo = dados.get('titulo_cargo')

    if not solicitante_nome or not tipo_requisicao or not titulo_cargo:
        return jsonify({"sucesso": False, "mensagem": "Campos obrigatórios faltando."}), 400

    # gerar numero_requisicao caso não venha
    numero_requisicao = dados.get('numero_requisicao') or gerar_numero_requisicao()

    try:
        conn = conectar()
        cursor = conn.cursor()
        sql = """
        INSERT INTO rg_requisicao_pessoal (
          numero_requisicao, data_solicitacao, status,
          solicitante_nome, solicitante_cargo, departamento,
          tipo_requisicao, titulo_cargo, area_setor, empresa, quantidade,
          motivo, colaborador_substituido, urgencia, prazo_desejado,
          faixa_salarial, tipo_contrato, formacao_exigida, experiencia_minima,
          competencias_tecnicas, competencias_comportamentais, responsavel_rh,
          observacoes, data_criacao, ultima_atualizacao
        ) VALUES (
          %s, %s, %s,
          %s, %s, %s,
          %s, %s, %s, %s, %s,
          %s, %s, %s, %s,
          %s, %s, %s, %s,
          %s, %s, %s,
          %s, NOW(), NOW()
        )
        """
        params = (
            numero_requisicao,
            dados.get('data_solicitacao') or datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            dados.get('status') or 'Pendente',
            solicitante_nome,
            dados.get('solicitante_cargo'),
            dados.get('departamento'),
            tipo_requisicao,
            titulo_cargo,
            dados.get('area_setor'),
            dados.get('empresa'),
            dados.get('quantidade') or 1,
            dados.get('motivo'),
            dados.get('colaborador_substituido'),
            dados.get('urgencia') or 'Média',
            dados.get('prazo_desejado'),
            dados.get('faixa_salarial'),
            dados.get('tipo_contrato') or 'CLT',
            dados.get('formacao_exigida'),
            dados.get('experiencia_minima'),
            dados.get('competencias_tecnicas'),
            dados.get('competencias_comportamentais'),
            dados.get('responsavel_rh'),
            dados.get('observacoes')
        )
        cursor.execute(sql, params)
        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Requisição criada com sucesso.", "id": cursor.lastrowid})
    except mysql.connector.IntegrityError as ie:
        return jsonify({"sucesso": False, "mensagem": f"Erro de integridade: {str(ie)}"}), 400
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": f"Erro criar: {str(e)}"}), 500
    finally:
        try: cursor.close(); conn.close()
        except: pass

# === ATUALIZAR ===
@app.route('/api/requisicoes_pessoal/<int:id>', methods=['PUT'])
def atualizar_requisicao(id):
    dados = request.get_json()
    try:
        conn = conectar()
        cursor = conn.cursor()
        # cria lista de sets dinamicamente (seguro com parâmetros)
        campos = []
        params = []
        allowed = [
            'numero_requisicao','status','solicitante_nome','solicitante_cargo','departamento',
            'tipo_requisicao','titulo_cargo','area_setor','empresa','quantidade','motivo',
            'colaborador_substituido','urgencia','prazo_desejado','faixa_salarial','tipo_contrato',
            'formacao_exigida','experiencia_minima','competencias_tecnicas','competencias_comportamentais',
            'responsavel_rh','observacoes','data_abertura_vaga','data_inicio_selecao','data_contratacao'
        ]
        for key in allowed:
            if key in dados:
                campos.append(f"{key}=%s")
                params.append(dados.get(key))
        if not campos:
            return jsonify({"sucesso": False, "mensagem": "Nenhum campo para atualizar."}), 400

        params.append(id)
        sql = f"UPDATE rg_requisicao_pessoal SET {', '.join(campos)}, ultima_atualizacao=NOW() WHERE id=%s"
        cursor.execute(sql, tuple(params))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"sucesso": False, "mensagem": "Registro não encontrado."}), 404
        return jsonify({"sucesso": True, "mensagem": "Atualizado com sucesso."})
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": f"Erro atualizar: {str(e)}"}), 500
    finally:
        try: cursor.close(); conn.close()
        except: pass

# === EXCLUIR ===
@app.route('/api/requisicoes_pessoal/<int:id>', methods=['DELETE'])
def excluir_requisicao(id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM rg_requisicao_pessoal WHERE id=%s", (id,))
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"sucesso": False, "mensagem": "Registro não encontrado."}), 404
        return jsonify({"sucesso": True, "mensagem": "Excluído com sucesso."})
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": f"Erro excluir: {str(e)}"}), 500
    finally:
        try: cursor.close(); conn.close()
        except: pass

# === UNIDADES PERMITIDAS (exemplo) ===
@app.route('/api/unidades_permitidas', methods=['GET'])
def unidades_permitidasRP():
    usuario_id = request.args.get('usuario_id')
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        # Ajuste a consulta abaixo conforme sua estrutura de tabelas.
        # Exemplo: buscar unidades vinculadas ao usuário (tabela 'unidades' e 'usuario_unidade')
        # Aqui eu retorno um exemplo genérico:
        cursor.execute("SELECT id, nome FROM unidades WHERE ativo=1 ORDER BY nome")
        rows = cursor.fetchall()
        return jsonify({"sucesso": True, "unidades": rows})
    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500
    finally:
        try: cursor.close(); conn.close()
        except: pass

# === Rota para inserir um chamado ===
@app.route("/chamados", methods=["POST"])
def criar_chamado():
    try:
        # Recebe os dados enviados via JSON
        dados = request.get_json()

        conn = conectar()
        cursor = conn.cursor()

        # Inserção com nomes de tabela e colunas ajustados
        cursor.execute("""
            INSERT INTO rg_chamado
                (descricao, modulo, motivo, obs, prioridade, setor, usuario, status, dtregistro)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """, (
            dados["descricao"],
            dados["modulo"],
            dados["motivo"],
            dados.get("observacoes"),
            dados["prioridade"],
            dados["setor"],
            dados["usuario"],
            dados["status"]
        ))

        conn.commit()

        # Retorno de sucesso
        return jsonify({"sucesso": True, "mensagem": "Chamado criado com sucesso!"})

    except Exception as e:
        # Mostra o erro no terminal para debug
        print("Erro ao criar chamado:", e)

        # Retorna o erro detalhado também no JSON (útil para testes)
        return jsonify({
        "sucesso": False,
        "mensagem": f"Erro ao criar chamado: {str(e)}"
        }), 500


    finally:
        cursor.close()
        conn.close()


# === Rota para listar chamados do usuário logado ===
@app.route("/chamados", methods=["GET"])
def listar_chamados():
    try:
        usuario = request.args.get("usuario")
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM rg_chamado
            WHERE usuario = %s
            ORDER BY dtregistro DESC
        """, (usuario,))
        chamados = cursor.fetchall()

        return jsonify({"sucesso": True, "chamados": chamados})
    except Exception as e:
        print(e)
        return jsonify({"sucesso": False, "mensagem": "Erro ao buscar chamados."}), 500
    finally:
        cursor.close()
        conn.close()

# === Atualizar chamado existente ===
@app.route("/chamados/<int:id_chamado>", methods=["PUT"])
def atualizar_chamado(id_chamado):
    try:
        dados = request.get_json()
        conn = conectar()
        cursor = conn.cursor()

        # Se o status for "Concluído", define dtconclusao = NOW()
        if dados["status"] == "Concluído":
            cursor.execute("""
                UPDATE rg_chamado
                SET descricao=%s, modulo=%s, motivo=%s, obs=%s, prioridade=%s,
                    setor=%s, status=%s, dtconclusao=NOW()
                WHERE id=%s
            """, (
                dados["descricao"],
                dados["modulo"],
                dados["motivo"],
                dados.get("observacoes"),
                dados["prioridade"],
                dados["setor"],
                dados["status"],
                id_chamado
            ))
        else:
            cursor.execute("""
                UPDATE rg_chamado
                SET descricao=%s, modulo=%s, motivo=%s, obs=%s, prioridade=%s,
                    setor=%s, status=%s
                WHERE id=%s
            """, (
                dados["descricao"],
                dados["modulo"],
                dados["motivo"],
                dados.get("observacoes"),
                dados["prioridade"],
                dados["setor"],
                dados["status"],
                id_chamado
            ))

        conn.commit()
        return jsonify({"sucesso": True, "mensagem": "Chamado atualizado com sucesso!"})

    except Exception as e:
        print("Erro ao atualizar chamado:", e)
        return jsonify({"sucesso": False, "mensagem": f"Erro ao atualizar chamado: {e}"}), 500
    finally:
        cursor.close()
        conn.close()


# === Listar com filtros ===
@app.route("/chamados/filtros", methods=["GET"])
def filtrar_chamados():
    try:
        usuario = request.args.get("usuario")
        modulo = request.args.get("modulo")
        prioridade = request.args.get("prioridade")
        status = request.args.get("status")
        solicitante = request.args.get("solicitante")
        data_inicio = request.args.get("data_inicio")
        data_fim = request.args.get("data_fim")

        query = "SELECT * FROM rg_chamado WHERE 1=1"
        params = []

        if usuario:
            query += " AND usuario = %s"
            params.append(usuario)
        if modulo:
            query += " AND modulo = %s"
            params.append(modulo)
        if prioridade:
            query += " AND prioridade = %s"
            params.append(prioridade)
        if status:
            query += " AND status = %s"
            params.append(status)
        if solicitante:
            query += " AND usuario LIKE %s"
            params.append(f"%{solicitante}%")
        if data_inicio and data_fim:
            query += " AND DATE(dtregistro) BETWEEN %s AND %s"
            params.append(data_inicio)
            params.append(data_fim)

        query += " ORDER BY dtregistro DESC"

        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, tuple(params))
        chamados = cursor.fetchall()

        return jsonify({"sucesso": True, "chamados": chamados})
    except Exception as e:
        print(e)
        return jsonify({"sucesso": False, "mensagem": f"Erro ao filtrar chamados: {e}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/cadindicadores", methods=["POST"])
def salvar_cadindicador():
    try:
        # Recebe os dados enviados via JSON
        dados = request.get_json()

        conn = conectar()
        cursor = conn.cursor()

        # Inserção com nomes de tabela e colunas ajustados
        cursor.execute("""
            INSERT INTO cad_indicadores
        (nome, definicao, formula, fonte, meta, setor, unidademedida, tipo, status, dtregistro)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        """,   (
        dados.get("nome"),
        dados.get("definicao"),
        dados.get("formula"),
        dados.get("fonte"),
        dados.get("meta"),
        dados.get("setor"),
        dados.get("unidademedida"),
        dados.get("tipo"),
        dados.get("status")
        ))

        conn.commit()

        # Retorno de sucesso
        return jsonify({"sucesso": True, "mensagem": "Indicador salvo com sucesso!"})

    except Exception as e:
        # Mostra o erro no terminal para debug
        print("Erro ao criar chamado:", e)

        # Retorna o erro detalhado também no JSON (útil para testes)
        return jsonify({
        "sucesso": False,
        "mensagem": f"Erro ao criar chamado: {str(e)}"
        }), 500


    finally:
        cursor.close()
        conn.close()

@app.route("/cadindicadores", methods=["GET"])
def listar_cadindicadores():
    try:
        usuario = request.args.get("usuario")
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM cad_indicadores
            ORDER BY nome DESC
        """)
        indicadores = cursor.fetchall()

        return jsonify({"sucesso": True, "indicadores": indicadores})
    except Exception as e:
        print(e)
        return jsonify({"sucesso": False, "mensagem": "Erro ao buscar indicadores."}), 500
    finally:
        cursor.close()
        conn.close()

# ---------------------------
# EDITAR
# ---------------------------
@app.route("/cadindicadores/<int:id>", methods=["PUT"])
def atualizar_cadindicador(id):
    dados = request.json

    sql = """
        UPDATE cad_indicadores
        SET nome=%s, definicao=%s, formula=%s, fonte=%s, meta=%s,
            setor=%s, unidademedida=%s, tipo=%s, status=%s
        WHERE id=%s
    """

    valores = (
        dados.get("nome"),
        dados.get("definicao"),
        dados.get("formula"),
        dados.get("fonte"),
        dados.get("meta"),
        dados.get("setor"),
        dados.get("unidademedida"),
        dados.get("tipo"),
        dados.get("status"),
        id
    )

    cursor = mysql.connection.cursor()
    cursor.execute(sql, valores)
    mysql.connection.commit()
    cursor.close()

    return jsonify({"sucesso": True, "mensagem": "Indicador atualizado com sucesso!"})

if __name__ == '__main__':
    app.run(debug=True)