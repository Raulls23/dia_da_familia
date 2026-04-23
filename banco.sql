CREATE TABLE formularios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL
);

CREATE TABLE questoes (
    id SERIAL PRIMARY KEY,
    formulario_id INTEGER REFERENCES formularios(id),
    pergunta TEXT NOT NULL,
    opcao_a TEXT NOT NULL,
    opcao_b TEXT NOT NULL,
    opcao_c TEXT NOT NULL,
    opcao_d TEXT NOT NULL,
    resposta_correta CHAR(1) NOT NULL -- A, B, C ou D
);

CREATE TABLE tentativas (
    id SERIAL PRIMARY KEY,
    formulario_id INTEGER REFERENCES formularios(id),
    nome_respondente VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE respostas_tentativa (
    id SERIAL PRIMARY KEY,
    tentativa_id INTEGER REFERENCES tentativas(id),
    questao_id INTEGER REFERENCES questoes(id),
    opcao_escolhida CHAR(1) NOT NULL
);