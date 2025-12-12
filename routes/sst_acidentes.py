from flask import Blueprint, request, jsonify
from db import conectar
import random, string
from datetime import datetime
from app import registrar_movimento   # 👈 IMPORTA A FUNÇÃO DO APP.PY

sst_acidentes_bp = Blueprint("sst_acidentes", __name__)


@sst_acidentes_bp.route("/api/acidentes", methods=["GET"])
def listar_acidentes():
    try:
        empresa = request.args.get("unidade")
        mes = request.args.get("mes")
        ano = request.args.get("ano")

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        sql = "SELECT * FROM rg_acidentes WHERE empresa = %s"
        valores = [empresa]

        if mes:
            sql += " AND DATE_FORMAT(data, '%m') = %s"
            valores.append(mes)

        if ano:
            sql += " AND DATE_FORMAT(data, '%Y') = %s"
            valores.append(ano)

        sql += " ORDER BY data DESC"

        cursor.execute(sql, valores)
        registros = cursor.fetchall()

        return jsonify({"sucesso": True, "dados": registros})

    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": f"Erro: {e}"})

@sst_acidentes_bp.route('/api/acidentes/<int:id>', methods=['GET'])
def buscar_acidente(id):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM rg_acidentes WHERE id = %s", (id,))
        dado = cursor.fetchone()

        return jsonify(dado if dado else {})

    except Exception as e:
        return jsonify({"erro": str(e)})

@sst_acidentes_bp.route("/api/acidentes", methods=["POST"])
def salvar_acidente():
    try:
        dados = request.get_json()

        conn = conectar()
        cursor = conn.cursor()

        sql = """
            INSERT INTO rg_acidentes
            (empresa, nome, cargo, ocorrido, data, local, tipo, responsavel,
             cat, afastamento, dataretorno, dtregistro, usuario)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW(),%s)
        """

        valores = (
            dados.get("empresa"),
            dados.get("nome"),
            dados.get("cargo"),
            dados.get("ocorrido"),
            dados.get("data"),
            dados.get("local"),
            dados.get("tipo"),
            dados.get("responsavel"),
            dados.get("cat"),
            dados.get("afastamento"),
            dados.get("dataretorno"),
            dados.get("usuario")
        )

        registrar_movimento(
            dados.get["usuario"],
            dados.get["empresa"],
            "Novo",
            "SST-Acidentes",
            dados["nome"]
        )

        cursor.execute(sql, valores)
        conn.commit()

        return jsonify({"sucesso": True, "mensagem": "Acidente registrado com sucesso!"})

    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": f"Erro: {e}"})

@sst_acidentes_bp.route('/api/acidentes/<int:id>', methods=['PUT'])
def editar_acidente(id):
    try:
        data = request.get_json()

        sql = """
        UPDATE rg_acidentes SET
            empresa=%s, nome=%s, cargo=%s, ocorrido=%s, data=%s, local=%s, tipo=%s,
            responsavel=%s, cat=%s, afastamento=%s, dataretorno=%s, usuario=%s, dtatualizacao=now()
        WHERE id=%s
        """

        valores = (
            data["empresa"],
            data["nome"],
            data["cargo"],
            data["ocorrido"],
            data["data"],
            data["local"],
            data["tipo"],
            data["responsavel"],
            data["cat"],
            data["afastamento"],
            data["dataretorno"],
            data["usuario"],
            id
        )

        registrar_movimento(
            data.get["usuario"],
            data.get["empresa"],
            "Editar",
            "SST-Acidentes",
            data["nome"]
        )

        conn = conectar()
        cursor = conn.cursor()
        cursor.execute(sql, valores)
        conn.commit()

        return jsonify({"sucesso": True, "mensagem": "Registro atualizado com sucesso!"})

    except Exception as e:
        return jsonify({"sucesso": False, "mensagem": str(e)})