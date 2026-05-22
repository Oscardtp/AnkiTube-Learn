import React, { useState } from 'react';

const Error404Screen: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moment: 'general',
          section: '404-not-found',
          intent: 'suggestion',
          text: 'Solicito notificación cuando la función "Estadísticas avanzadas" esté disponible.',
          feedback_email: feedbackEmail,
          anonymous_session_id: '404-page-not-logged-in'
        })
      });

      if (res.ok) {
        alert('¡Gracias! Te avisaremos cuando esté listo ✨');
        setShowFeedback(false);
        setFeedbackEmail('');
      } else {
        alert('Hubo un problema, por favor inténtalo de nuevo.');
      }
    } catch {
      alert('Error de conexión. Por favor inténtalo más tarde.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center'
      }}
    >
      {/* Navegación siempre visible */}
      <div style={{ alignSelf: 'flex-start', marginBottom: '40px' }}>
        <a
          href="/"
          style={{
            color: '#06B6D4',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ← Volver a Inicio
        </a>
      </div>

      {/* Ilustración */}
      <div
        style={{
          width: '120px',
          height: '120px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(26, 86, 219, 0.08)',
          marginBottom: '32px'
        }}
      >
        <span style={{ fontSize: '48px' }}>🚧✨</span>
      </div>

      {/* Título */}
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#1E293B',
          margin: '0 0 12px 0'
        }}
      >
        Estamos construyendo esto para ti
      </h1>

      {/* Subtítulo y contexto */}
      <p
        style={{
          fontSize: '16px',
          color: '#1E293B',
          margin: '0 0 20px 0'
        }}
      >
        «Estadísticas avanzadas» llega en noviembre. Serás el primero en probarlo.
      </p>

      {/* CTA Primario: Volver a Estudiar */}
      <a
        href="/dashboard"
        style={{
          display: 'inline-block',
          backgroundColor: '#1A56DB',
          color: '#FFFFFF',
          padding: '14px 28px',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '16px',
          textDecoration: 'none',
          marginBottom: '24px'
        }}
      >
        Volver al Dashboard
      </a>

      {/* Divider suave */}
      <p style={{ color: '#64748B', margin: '24px 0 16px', fontSize: '14px' }}>
        Mientras tanto puedes:
      </p>

      {/* CTA secundarios */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <a
          href="/dashboard"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #06B6D4',
            color: '#06B6D4',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none'
          }}
        >
          Crear un mazo nuevo
        </a>

        <a
          href="/my-decks"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #06B6D4',
            color: '#06B6D4',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none'
          }}
        >
          Estudiar tarjetas pendientes
        </a>
      </div>

      {/* Feedback / Avísame */}
      {showFeedback ? (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: '32px',
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#475569' }}>
            ¿Quieres que te avisemos cuando esté listo?
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="email"
              placeholder="nombre@ejemplo.com"
              value={feedbackEmail}
              onChange={(e) => setFeedbackEmail(e.target.value)}
              required
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              disabled={sending}
              style={{
                backgroundColor: '#06B6D4',
                color: '#FFFFFF',
                border: 'none',
                padding: '0 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.7 : 1
              }}
            >
              {sending ? '…' : 'Avísame'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowFeedback(true)}
          style={{
            marginTop: '24px',
            background: 'none',
            border: 'none',
            color: '#06B6D4',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 500,
            padding: '4px 8px'
          }}
        >
          ¿Quieres que te avisemos?
        </button>
      )}
    </div>
  );
};

export default Error404Screen;