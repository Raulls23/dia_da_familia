import Fastify from 'fastify';
import cors from '@fastify/cors';
import pg from 'pg';

const { Pool } = pg;

const fastify = Fastify();

await fastify.register(cors, {
    origin: '*'
});

const pool = new Pool({
    user: 'postgres',
    password: 'senai',
    host: 'localhost',
    port: 5432,
    database: 'familia'
});

fastify.post('/formularios', async (request, reply) => {
    const { nome } = request.body;
    const result = await pool.query(
        'INSERT INTO formularios (nome) VALUES ($1) RETURNING *',
        [nome]
    );
    return result.rows[0];
});

fastify.get('/formularios', async () => {
    const result = await pool.query('SELECT * FROM formularios');
    return result.rows;
});

fastify.post('/questoes', async (request, reply) => {
    const { formulario_id, pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta } = request.body;
    const result = await pool.query(
        'INSERT INTO questoes (formulario_id, pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [formulario_id, pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta.toUpperCase()]
    );
    return result.rows[0];
});

fastify.get('/formularios/:id/questoes', async (request) => {
    const { id } = request.params;
    const result = await pool.query('SELECT id, pergunta, opcao_a, opcao_b, opcao_c, opcao_d FROM questoes WHERE formulario_id = $1', [id]);
    return result.rows;
});

fastify.post('/tentativas', async (request, reply) => {
    const { formulario_id, nome_respondente, respostas } = request.body;

    const tentativaRes = await pool.query(
        'INSERT INTO tentativas (formulario_id, nome_respondente) VALUES ($1, $2) RETURNING id',
        [formulario_id, nome_respondente]
    );

    const tentativaId = tentativaRes.rows[0].id;

    for (const resp of respostas) {
        await pool.query(
            'INSERT INTO respostas_tentativa (tentativa_id, questao_id, opcao_escolhida) VALUES ($1, $2, $3)',
            [tentativaId, resp.questao_id, resp.opcao_escolhida.toUpperCase()]
        );
    }

    return { message: 'Tentativa registrada com sucesso', tentativaId };
});

fastify.get('/ranking/:formulario_id', async (request) => {
    const { formulario_id } = request.params;
    
    const query = `
        SELECT 
            t.nome_respondente,
            COUNT(rt.id) FILTER (WHERE rt.opcao_escolhida = q.resposta_correta) as acertos
        FROM tentativas t
        JOIN respostas_tentativa rt ON t.id = rt.tentativa_id
        JOIN questoes q ON rt.questao_id = q.id
        WHERE t.formulario_id = $1
        GROUP BY t.id, t.nome_respondente
        ORDER BY acertos DESC
    `;

    const result = await pool.query(query, [formulario_id]);
    return result.rows;
});

fastify.listen({ port: 3000 }, (err) => {
    if (err) {
        process.exit(1);
    }
    console.log('Servidor rodando em http://localhost:3000');
});