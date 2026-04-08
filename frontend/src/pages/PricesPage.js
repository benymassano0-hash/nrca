import React from 'react';
import './PricesPage.css';

const TICKET_PRICE_KZ = 15000;
const BREEDER_REG_KZ = 20000;

const formatKz = (value) => `${Number(value).toLocaleString('pt-PT')} Kz`;

function PricesPage() {
  return (
    <div className="prices-container">
      <div className="prices-card">
        <h1>Tabela de Preços</h1>
        <p className="prices-subtitle">Valores oficiais dos serviços do RCNA</p>

        {/* --- Registo de Criador --- */}
        <div className="prices-section">
          <h2 className="prices-section-title">🧑‍🌾 Registo de Criador</h2>
          <table className="prices-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Valor</th>
                <th>Tipo</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Registo de conta de criador</td>
                <td className="prices-value">{formatKz(BREEDER_REG_KZ)}</td>
                <td><span className="badge badge-once">Pagamento único</span></td>
                <td>IBAN ou Referência</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* --- Sistema de Tickets --- */}
        <div className="prices-section">
          <h2 className="prices-section-title">🎟️ Tickets de Registo de Cães</h2>
          <p className="prices-section-desc">
            Os tickets da conta podem ser usados nas <strong>3 opções</strong>: <strong>registar cão</strong>, <strong>transferir cão</strong> e <strong>registar ninhada</strong>. Cada operação abaixo consome <strong>1 ticket</strong>. Os tickets são carregados pelo administrador após confirmação do pagamento.
          </p>
          <table className="prices-table">
            <thead>
              <tr>
                <th>Operação</th>
                <th>Tickets necessários</th>
                <th>Preço por ticket</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🐕 Registo de cão</td>
                <td className="tickets-col">1 ticket</td>
                <td className="prices-value">{formatKz(TICKET_PRICE_KZ)}</td>
                <td>IBAN ou Referência</td>
              </tr>
              <tr>
                <td>🔄 Transferência de cão</td>
                <td className="tickets-col">1 ticket</td>
                <td className="prices-value">{formatKz(TICKET_PRICE_KZ)}</td>
                <td>IBAN ou Referência</td>
              </tr>
              <tr>
                <td>🐾 Registo de ninhada</td>
                <td className="tickets-col">1 ticket</td>
                <td className="prices-value">{formatKz(TICKET_PRICE_KZ)}</td>
                <td>IBAN ou Referência</td>
              </tr>
            </tbody>
          </table>

          <div className="ticket-examples">
            <span>Exemplo:</span>
            <span>5 tickets = {formatKz(TICKET_PRICE_KZ * 5)}</span>
            <span>10 tickets = {formatKz(TICKET_PRICE_KZ * 10)}</span>
            <span>20 tickets = {formatKz(TICKET_PRICE_KZ * 20)}</span>
          </div>
        </div>

        {/* --- Pagamento --- */}
        <div className="payment-box">
          <p><strong>IBAN:</strong> AO06042000000000082915064</p>
          <p><strong>Referência:</strong> 10116 .936789585</p>
          <p><strong>WhatsApp:</strong> +351 935013630</p>
          <p>Após o pagamento, envie o comprovativo por WhatsApp para ativação dos tickets.</p>
        </div>
      </div>
    </div>
  );
}

export default PricesPage;
