import React from 'react';
import './ComoFuncionaPage.css';

function ComoFuncionaPage() {
  return (
    <div className="como-funciona-wrapper">
      <div className="card">
        <h1>📜 Como Funciona o Registo de Pedigree</h1>
        <p className="subtitulo">
          Entenda o processo completo de emissão e registo do pedigree oficial.
        </p>
      </div>

      {/* PASSO 1 */}
      <div className="card passo-card">
        <div className="passo-titulo">
          <span className="passo-numero">1</span>
          <h2>🐾 Pais Registados</h2>
        </div>
        <p>Para um cão ter pedigree, é necessário que:</p>
        <ul>
          <li>O <strong>pai</strong> e a <strong>mãe</strong> estejam registados no RCA ou noutro clube reconhecido.</li>
          <li>Ambos possuam <strong>pedigree válido</strong>.</li>
        </ul>
      </div>

      {/* PASSO 2 */}
      <div className="card passo-card">
        <div className="passo-titulo">
          <span className="passo-numero">2</span>
          <h2>🐶 Registo da Ninhada</h2>
        </div>
        <p>
          Quando os filhotes nascem, o <strong>criador informa o RCA</strong>.
          Todos os filhotes são registados no sistema e recebem os seus dados oficiais.
        </p>
      </div>

      {/* PASSO 3 */}
      <div className="card passo-card">
        <div className="passo-titulo">
          <span className="passo-numero">3</span>
          <h2>🧾 Emissão do Pedigree</h2>
        </div>
        <p>Cada cão recebe um documento oficial com as seguintes informações:</p>
        <ul>
          <li>Nome do cão</li>
          <li>Raça</li>
          <li>Data de nascimento</li>
          <li>Nome dos pais</li>
          <li>Antepassados (até várias gerações)</li>
        </ul>
      </div>

      {/* PASSO 4 */}
      <div className="card passo-card">
        <div className="passo-titulo">
          <span className="passo-numero">4</span>
          <h2>🔢 Número de Registo</h2>
        </div>
        <p>
          Cada cão recebe um <strong>número único de registo</strong>.
          Esse número identifica o animal no sistema de forma permanente e intransferível.
        </p>
      </div>

      {/* PARA QUE SERVE */}
      <div className="card destaque-card">
        <h2>🏆 Para que Serve o Pedigree?</h2>
        <p>O pedigree é um documento de grande importância para:</p>
        <div className="beneficios-grid">
          <div className="beneficio-item">
            <span className="beneficio-icone">✅</span>
            <span>Comprovar que o cão é de <strong>raça pura</strong></span>
          </div>
          <div className="beneficio-item">
            <span className="beneficio-icone">🏅</span>
            <span>Participar em <strong>exposições caninas</strong></span>
          </div>
          <div className="beneficio-item">
            <span className="beneficio-icone">🔬</span>
            <span>Controlar e registar <strong>cruzamentos</strong></span>
          </div>
          <div className="beneficio-item">
            <span className="beneficio-icone">💎</span>
            <span>Aumentar o <strong>valor do cão</strong></span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="card cta-card">
        <h3>Pronto para registar o seu cão?</h3>
        <p>Acede ao sistema e inicia o processo de registo de forma rápida e segura.</p>
        <a href="/login" className="btn-cta">Entrar no Sistema</a>
      </div>
    </div>
  );
}

export default ComoFuncionaPage;
