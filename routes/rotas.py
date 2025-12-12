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

rotas_bp = Blueprint("rotas", __name__)

@rotas_bp.route('/')
def index_page():
    return send_from_directory('.', 'index.html')

@rotas_bp.route('/inicio')
def inicio_page():
    return send_from_directory('.', 'inicio.html')

@rotas_bp.route('/chamado')
def chamado_page():
    return send_from_directory('.', 'chamados.html')

@rotas_bp.route('/movimentacoes')
def mov_page():
    return send_from_directory('.', 'mov.html')

@rotas_bp.route('/chamados_admin')
def chamadoAdmin_page():
    return send_from_directory('.', 'chamados_admin.html')

@rotas_bp.route('/layout')
def teste_page():
    return send_from_directory('.', 'layout.html')

@rotas_bp.route('/indicadores')
def page_indicador():
    return send_from_directory('.', 'indicadores.html')

@rotas_bp.route('/ficha_indicadores')
def page_indicadorcad():
    return send_from_directory('.', 'indicadores_cad.html')

@rotas_bp.route('/meu_rh_acoes_treinamentos')
def page_acoestreinamentos():
    return send_from_directory('.', 'meu_rh_acoes_treinamentos.html')

@rotas_bp.route('/meu_rh_avaliacao_experiencia')
def page_avaliacaoexperiencia():
    return send_from_directory('.', 'meu_rh_avaliacao_experiencia.html')

@rotas_bp.route('/meu_rh_requisicao_pessoal')
def page_requisicaopessoal():    
    return send_from_directory('.', 'meu_rh_requisicao_pessoal.html')

@rotas_bp.route('/meu_rh_processo_seletivo')
def page_processoseletivo():    
    return send_from_directory('.', 'meu_rh_processo_seletivo.html')

@rotas_bp.route('/meu_rh_entrevista_desligamento')
def page_entrevistadesligamento():
    return send_from_directory('.', 'meu_rh_entrevista_desligamento.html')

@rotas_bp.route('/meu_dp_cad_colaborador')
def page_cadastrocolaborador():
    return send_from_directory('.', 'meu_dp_cad_colaborador.html')

@rotas_bp.route('/meu_sst_acoes_treinamentos')
def page_meusstacoes():
    return send_from_directory('.', 'meu_sst_acoes_treinamentos.html')

@rotas_bp.route('/meu_sst_acidentes')
def page_meusstasos():
    return send_from_directory('.', 'meu_sst_acidentes.html')

@rotas_bp.route('/meu_sst_asos')
def page_meusstacidentes():
    return send_from_directory('.', 'meu_sst_asos.html')

@rotas_bp.route('/empresa')
def page_empresa():
    return send_from_directory('.', 'empresa.html')

@rotas_bp.route('/meu_rh')
def page_meurh():   
    return send_from_directory('.', 'meu_rh.html')

@rotas_bp.route('/powerbi')
def page_powerbi():   
    return send_from_directory('.', 'powerbi.html')

@rotas_bp.route('/meu_dp')
def page_meudp():
   return send_from_directory('.', 'meu_dp.html')

@rotas_bp.route('/meu_sst')
def page_meusst():
    return send_from_directory('.', 'meu_sst.html')