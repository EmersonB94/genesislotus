from flask import Blueprint, request, jsonify
from db import conectar
import random, string
from datetime import datetime

cron_bp = Blueprint("cron", __name__)

@cron_bp.route('/cron/suspender_usuarios_inativos', methods=['GET']) # em cron-job - executa essa ação 1x por dia
def suspender_inativos():
    try:
        conn = conectar()
        cursor = conn.cursor()

        sql = """
            UPDATE cad_usuario
            SET status = 'Suspenso Inatividade'
            WHERE 
                (
                    dtacesso IS NULL 
                    AND cadastro < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
                )
                OR
                (
                    dtacesso IS NOT NULL
                    AND dtacesso < DATE_SUB(CURDATE(), INTERVAL 60 DAY)
                );
        """

        cursor.execute(sql)
        conn.commit()

        print("Usuários inativos foram atualizados com sucesso.")
        return jsonify({"sucesso": True, "mensagem": "Processo gerado!"})

    except Exception as e:
        print("Erro ao atualizar usuários:", e)

    finally:
        cursor.close()
        conn.close()

# Atualizar indicadores

@cron_bp.route('/cron/atualizar_indicadores_status', methods=['GET']) # em cron-job - executa essa ação 1x por dia
def atualizar_indicadores_status():
    conn = None
    cursor = None

    try:
        conn = conectar()
        cursor = conn.cursor()

        sql = """
            UPDATE indicadores
            SET status = 'Vencido e não aplicado'
            WHERE prazo < CURDATE();
        """

        cursor.execute(sql)
        conn.commit()

        return jsonify({"sucesso": True, "mensagem": "Indicadores vencidos foram atualizados."})

    except Exception as e:
        print("Erro ao atualizar indicadores:", e)
        return jsonify({"sucesso": False, "mensagem": "Erro ao atualizar indicadores.", "erro": str(e)})

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()