from flask import Blueprint, request, jsonify
from db import conectar
import random, string
from datetime import datetime

analise_bp = Blueprint("analise", __name__)

@analise_bp.route('/api/totais', methods=['GET'])
def obter_totais():
    try:
        # unidade = request.args.get('unidadeSelecionada')  # Captura a unidade enviada pelo front-end
        unidade = request.args.get('empresa_id')

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        print("Unidade selecionada: ", unidade)

        # ===== Contar usuários ativos =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_usuario WHERE status='Ativo' AND empresa LIKE %s """, (f"%{unidade}%",))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_usuario WHERE status='Ativo'")
        total_usuarios = cursor.fetchone()['total']

        print("Usuarios: ", total_usuarios)

        # ===== Contar chamados ativos =====
        cursor.execute("SELECT COUNT(*) AS total FROM rg_chamado WHERE status='Em aberto' or status='Em andamento'")
        total_chamados = cursor.fetchone()['total']

        print("Chamados: ", total_chamados)

        # ===== Contar indicadores =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM indicadores WHERE empresa=%s", (unidade,))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM indicadores")
        total_indicadores = cursor.fetchone()['total']

        print("Indicadores: ", total_indicadores)

        # ===== Contar clientes (empresas) =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_empresa WHERE nome_fantasia=%s", (unidade,))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_empresa")
        total_clientes = cursor.fetchone()['total']

        print("Clientes: ", total_clientes  )

        # ===== Contar ações =====
        cursor.execute("SELECT COUNT(*) AS total FROM rg_acoes_treinamentos WHERE tipo_acao = %s and empresa = %s""", ('Ação',unidade))
        total_acoes = cursor.fetchone()['total']

        print("Ações: ", total_acoes)

        # ===== Contar treinamentos =====
        cursor.execute(
            """
            SELECT COUNT(*) AS total 
            FROM rg_acoes_treinamentos 
            WHERE tipo_acao = %s AND empresa = %s
            """,
            ('Treinamento', unidade)
        )

        total_treinamentos = cursor.fetchone()['total']

        print("Treinamentos: ", total_treinamentos)

        # ===== Contar requisições de pessoal =====

        cursor.execute("SELECT COUNT(*) AS total FROM rg_requisicao_pessoal where empresa=%s", (unidade,))
        total_requisicoes = cursor.fetchone()['total']

        print("Requisição: ", total_requisicoes)

        cursor.execute("SELECT COUNT(*) AS total FROM rg_avaliacao_experiencia where empresa=%s", (unidade,))
        total_avaliacoes = cursor.fetchone()['total']

        print("Avaliação Exp.: ", total_avaliacoes)

        cursor.execute("SELECT COUNT(*) AS total FROM rg_entrevista_desligamento where empresa=%s", (unidade,))
        total_entrevista = cursor.fetchone()['total']

        print("Entrevista Desligamento: ", total_entrevista)

        cursor.execute("SELECT COUNT(*) AS total FROM rg_processo_seletivo where empresa=%s", (unidade,))
        total_processo_seletivo = cursor.fetchone()['total']

        print("Processo Seletivo: ", total_processo_seletivo)

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
                "pss" : total_processo_seletivo,
                "avaliacoes": total_avaliacoes,
                "entrevista": total_entrevista,
                "chamados": total_chamados
            }
        })

    except Exception as e:
        print("🚨 ERRO AO OBTER TOTAIS:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500
    
@analise_bp.route('/api/dados_rh', methods=['GET'])
def obter_dados_rh():
    try:
        # unidade = request.args.get('unidadeSelecionada')  # Captura a unidade enviada pelo front-end
        unidade = request.args.get('empresa_id')

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        print("Dados RH")
        print("Unidade selecionada: ", unidade)

        # ===== Contar chamados ativos =====
        cursor.execute("SELECT COUNT(*) AS total FROM rg_chamado WHERE status='Em aberto' or status='Em andamento'")
        total_chamados = cursor.fetchone()['total']

        print("Chamados: ", total_chamados)

        # ===== Contar indicadores =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM indicadores WHERE empresa=%s", (unidade,))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM indicadores")
        total_indicadores = cursor.fetchone()['total']

        print("Indicadores: ", total_indicadores)

        # ===== Contar clientes (empresas) =====
        if unidade:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_empresa WHERE nome_fantasia=%s", (unidade,))
        else:
            cursor.execute("SELECT COUNT(*) AS total FROM cad_empresa")
        total_clientes = cursor.fetchone()['total']

        print("Clientes: ", total_clientes  )

        # ===== Contar ações =====
        cursor.execute("SELECT COUNT(*) AS total FROM rg_acoes_treinamentos WHERE tipo_acao = %s and empresa = %s""", ('Ação',unidade))
        total_acoes = cursor.fetchone()['total']

        print("Ações: ", total_acoes)

        # ===== Contar treinamentos =====
        cursor.execute(
            """
            SELECT COUNT(*) AS total 
            FROM rg_acoes_treinamentos 
            WHERE tipo_acao = %s AND empresa = %s
            """,
            ('Treinamento', unidade)
        )

        total_treinamentos = cursor.fetchone()['total']

        print("Treinamentos: ", total_treinamentos)

        # ===== Contar requisições de pessoal =====

        cursor.execute("SELECT COUNT(*) AS total FROM rg_requisicao_pessoal where empresa=%s", (unidade,))
        total_requisicoes = cursor.fetchone()['total']

        print("Requisição: ", total_requisicoes)

        cursor.execute("SELECT COUNT(*) AS total FROM rg_avaliacao_experiencia where empresa=%s", (unidade,))
        total_avaliacoes = cursor.fetchone()['total']

        print("Avaliação Exp.: ", total_avaliacoes)

        cursor.execute("SELECT COUNT(*) AS total FROM rg_entrevista_desligamento where empresa=%s", (unidade,))
        total_entrevista = cursor.fetchone()['total']

        print("Entrevista Desligamento: ", total_entrevista)

        cursor.execute("SELECT COUNT(*) AS total FROM rg_processo_seletivo where empresa=%s", (unidade,))
        total_processo_seletivo = cursor.fetchone()['total']

        print("Processo Seletivo: ", total_processo_seletivo)

        cursor.close()
        conn.close()

        return jsonify({
            "sucesso": True,
            "totais": {
                "indicadores": total_indicadores,
                "clientes": total_clientes,
                "acoes": total_acoes,
                "treinamentos": total_treinamentos,
                "requisicoes": total_requisicoes,
                "pss" : total_processo_seletivo,
                "avaliacoes": total_avaliacoes,
                "entrevista": total_entrevista,
                "chamados": total_chamados
            }
        })

    except Exception as e:
        print("🚨 ERRO AO OBTER TOTAIS:", e)
        return jsonify({"sucesso": False, "mensagem": str(e)}), 500