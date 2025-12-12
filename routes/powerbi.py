# routes/powerbi.py
from flask import Blueprint, request, jsonify

powerbi_bp = Blueprint("powerbi", __name__)

# URL fixa do seu relatório Power BI
BASE_POWERBI_URL = (
    "https://app.powerbi.com/view?"
    "r=eyJrIjoiNTBlZmQxYTAtMWQ2Ni00OGVmLTliZjEtZjU3YWZiNTUyZGU0IiwidCI6ImQ4NTRiMTgzLWRmNDctNDNhNy04YTZkLWQ1NmJmMmE0MWViZCJ9"
)

BASE_POWERBI_RH_URL = (
    "https://app.powerbi.com/view?"
    "r=eyJrIjoiNTBlZmQxYTAtMWQ2Ni00OGVmLTliZjEtZjU3YWZiNTUyZGU0IiwidCI6ImQ4NTRiMTgzLWRmNDctNDNhNy04YTZkLWQ1NmJmMmE0MWViZCJ9"
)

@powerbi_bp.route("/gerar_powerbi", methods=["POST"])
def gerar_powerbi():
    
    url = BASE_POWERBI_URL

    return jsonify({"url": url})

@powerbi_bp.route("/gerar_powerbi", methods=["POST"])
def gerar_powerbirh():
    
    url = BASE_POWERBI_URL

    return jsonify({"url": url})
