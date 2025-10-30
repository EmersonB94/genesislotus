from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# === CONEXÃO COM BANCO ===
def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="genesis_lotus_db"
    )

# === CADASTRAR INDICADOR ===
@app.route('/indicadores', methods=['POST'])
def cadastrar_indicador():
    data = request.get_json()
    conn = conectar()
    cursor = conn.cursor()

    sql = """
        INSERT INTO indicadores (indicador, mes, ano, prazo, acao_corretiva, analise_critica, status, resultado)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """
    valores = (
        data.get('indicador'),
        data.get('mes'),
        data.get('ano'),
        data.get('prazo'),
        data.get('acao_corretiva'),
        data.get('analise_critica'),
        data.get('status'),
        data.get('resultado')
    )
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"sucesso": True, "mensagem": "Indicador cadastrado com sucesso!"})

# === LISTAR INDICADORES ===
@app.route('/indicadores', methods=['GET'])
def listar_indicadores():
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM indicadores ORDER BY ano DESC, mes DESC")
    dados = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(dados)

# === ATUALIZAR INDICADOR ===
@app.route('/indicadores/<int:id>', methods=['PUT'])
def atualizar_indicador(id):
    data = request.get_json()
    conn = conectar()
    cursor = conn.cursor()
    sql = """
        UPDATE indicadores SET
        indicador=%s, mes=%s, ano=%s, prazo=%s, acao_corretiva=%s,
        analise_critica=%s, status=%s, resultado=%s
        WHERE id=%s
    """
    valores = (
        data.get('indicador'),
        data.get('mes'),
        data.get('ano'),
        data.get('prazo'),
        data.get('acao_corretiva'),
        data.get('analise_critica'),
        data.get('status'),
        data.get('resultado'),
        id
    )
    cursor.execute(sql, valores)
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"sucesso": True, "mensagem": "Indicador atualizado com sucesso!"})

# === EXCLUIR INDICADOR ===
@app.route('/indicadores/<int:id>', methods=['DELETE'])
def excluir_indicador(id):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM indicadores WHERE id=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"sucesso": True, "mensagem": "Indicador excluído com sucesso!"})

if __name__ == '__main__':
    app.run(debug=True)
