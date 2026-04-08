import React, { useState, useEffect } from 'react';
import EventGallery from '../components/EventGallery';
import api from '../api';
import './ComoFuncionaPage.css';
import './PromoBanner.css';

function HomePage() {
  const [showHomeLogo, setShowHomeLogo] = useState(true);
  const [promo, setPromo] = useState(null);

  useEffect(() => {
    const loadPromo = async () => {
      try {
        const enabledRes = await api.get('/settings/promo_enabled');
        const isEnabled = enabledRes.data.value === true || enabledRes.data.value === 'true';
        if (!isEnabled) return;
        const [titleRes, descRes, discountRes] = await Promise.allSettled([
          api.get('/settings/promo_title'),
          api.get('/settings/promo_description'),
          api.get('/settings/promo_discount'),
        ]);
        setPromo({
          title: titleRes.status === 'fulfilled' ? titleRes.value.data.value : 'Promoção Especial!',
          description: descRes.status === 'fulfilled' ? descRes.value.data.value : '',
          discount: discountRes.status === 'fulfilled' ? discountRes.value.data.value : '',
        });
      } catch (_) {}
    };
    loadPromo();
  }, []);

  return (
    <div className="como-funciona-wrapper">
      {/* Banner de Promoção */}
      {promo && (
        <div className="promo-banner">
          <div className="promo-banner-inner">
            <span className="promo-banner-icon">🎉</span>
            <div className="promo-banner-body">
              <strong className="promo-banner-title">{promo.title}</strong>
              {promo.description && <p className="promo-banner-desc">{promo.description}</p>}
            </div>
            {promo.discount > 0 && (
              <span className="promo-banner-badge">{promo.discount}% OFF</span>
            )}
          </div>
        </div>
      )}

      {/* Cabeçalho de boas-vindas */}
      <div className="card">
        {showHomeLogo && (
          <img
            src="/logo-oficial.jpeg"
            alt="Logo RCA Pedigree"
            style={{ width: '100%', maxWidth: '360px', display: 'block', margin: '0 auto 14px', borderRadius: '14px' }}
            onError={() => setShowHomeLogo(false)}
          />
        )}
        <h1>Bem-vindo ao RCA</h1>
        <p style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '8px', padding: '10px 12px', color: '#0f172a' }}>
          Seja muito bem-vindo. Estamos felizes por ter você no painel RCA.
        </p>
        <p>Sistema de Pedigree de Angola</p>
      </div>

      {/* Como Funciona */}
      <div className="card">
        <h2>📜 Como Funciona o Registo de Pedigree</h2>
        <p className="subtitulo">Entenda o processo completo de emissão e registo do pedigree oficial.</p>
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

      <div className="card compromisso-card">
        <h2>🤝 Compromissos do Clube Angolano de Canicultura</h2>
        <p className="subtitulo">
          A nossa atuação assenta em princípios claros para fortalecer a canicultura responsável,
          proteger as raças puras e educar a comunidade em Angola.
        </p>
        <div className="compromissos-grid">
          <article className="compromisso-item">
            <h3>Promover a Criação Responsável</h3>
            <p>
              Incentivar e apoiar os criadores na adoção de práticas éticas de criação que priorizem
              a saúde, o bem-estar e o temperamento dos cães, além da pureza e do padrão da raça.
            </p>
          </article>
          <article className="compromisso-item">
            <h3>Apoiar a Investigação e a Saúde Canina</h3>
            <p>
              Colaborar com instituições de investigação para promover a saúde e o bem-estar dos cães,
              combatendo doenças hereditárias e melhorando as condições de vida das raças puras.
            </p>
          </article>
          <article className="compromisso-item">
            <h3>Preservar os Padrões de Raça</h3>
            <p>
              Manter elevados padrões de qualidade das diversas raças de cães em Angola, assegurando
              que a linhagem e as características distintivas de cada raça sejam mantidas para as
              futuras gerações.
            </p>
          </article>
          <article className="compromisso-item">
            <h3>Educar Criadores e o Público</h3>
            <p>
              Fornecer recursos educativos, workshops e seminários para criadores e o público em geral
              sobre as melhores práticas na criação, cuidados, saúde e bem-estar de raças puras.
            </p>
          </article>
          <article className="compromisso-item">
            <h3>Defender a Integridade das Raças</h3>
            <p>
              Lutar contra práticas prejudiciais, como a criação indiscriminada e a venda
              irresponsável de cães, garantindo que a herança e a integridade das raças puras sejam
              protegidas e valorizadas.
            </p>
          </article>
          <article className="compromisso-item">
            <h3>Avaliar e Certificar</h3>
            <p>
              Organizar e promover exposições caninas, concursos e avaliações de raças, com o objetivo
              de avaliar cães de acordo com padrões reconhecidos internacionalmente e incentivar a
              melhoria contínua da qualidade genética.
            </p>
          </article>
        </div>
        <div className="compromisso-fecho">
          <p>
            Através destes compromissos, o Clube Angolano de Canicultura aspira a fomentar uma
            comunidade de canicultura responsável e ética, contribuindo para a preservação e o
            enriquecimento do património canino em Angola.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="card cta-card">
        <h3>Pronto para registar o seu cão?</h3>
        <p>Acede ao sistema e inicia o processo de registo de forma rápida e segura.</p>
        <a href="/login" className="btn-cta">Entrar no Sistema</a>
      </div>

      {/* Galeria de Eventos */}
      <EventGallery />

      <p className="app-creator-credit">Criador do app: José João Massano</p>
    </div>
  );
}

export default HomePage;
