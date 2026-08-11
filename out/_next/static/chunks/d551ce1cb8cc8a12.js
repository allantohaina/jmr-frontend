(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,66240,e=>{"use strict";var t=e.i(43476),r=e.i(71645),i=e.i(22016);e.i(47624);var o=e.i(21140),a=e.i(51617),s=e.i(12732);function n(){let[e,n]=(0,r.useState)(""),[l,d]=(0,r.useState)(""),[c,p]=(0,r.useState)(""),[x,m]=(0,r.useState)(!1),[g,h]=(0,r.useState)(!1);(0,r.useEffect)(()=>{h(!0),(0,o.getToken)()&&(window.location.href="/backoffice")},[]);let f=async t=>{if(t.preventDefault(),p(""),!a.loginRateLimiter.check("admin-login").allowed)return void p("Trop de tentatives. Veuillez réessayer plus tard.");m(!0);try{let t=new FormData;t.append("intent","login"),t.append("email",e),t.append("password",l);let r=await (0,o.authenticateWithForm)(t);r&&r.user&&"admin"===r.user.role?window.location.href="/backoffice":p("Accès refusé. Vous n'avez pas les droits d'administration.")}catch(e){p(e instanceof Error?e.message:"Une erreur est survenue.")}finally{m(!1)}};return g?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(s.AuthBar,{initialTheme:"dark"}),(0,t.jsx)("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Inter:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg-deep: #1e2a38;
          --bg-panel: #141e2e;
          --gold: #e5ad46;
          --gold-light: #eccc90;
          --text-cream: #f3efe4;
          --text-muted: #8b93a7;
        }

        .admin-login-root {
          min-height: 100vh;
          background: var(--bg-deep);
          font-family: 'Inter', sans-serif;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .panel {
          position: relative;
          background: var(--bg-panel);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
        }

        .thread-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.15;
        }

        .brand-mark {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark h1 {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 18px;
          letter-spacing: 3px;
          color: var(--gold);
        }

        .copy-section {
          position: relative;
          z-index: 1;
          margin-top: auto;
        }

        .copy-section .eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: var(--gold);
          margin-bottom: 16px;
        }

        .copy-section h2 {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 300;
          line-height: 1.35;
          color: var(--text-cream);
          margin-bottom: 20px;
        }

        .copy-section p {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 420px;
        }

        .panel-footer {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 24px;
          margin-top: 48px;
        }

        .panel-footer span {
          font-size: 11px;
          letter-spacing: 1px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          background: var(--bg-deep);
        }

        .form-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(229, 173, 70, 0.1);
          border: 1px solid rgba(229, 173, 70, 0.25);
          border-radius: 24px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 500;
          color: var(--gold);
          margin-bottom: 24px;
          width: fit-content;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 13px;
          margin-bottom: 32px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--text-cream);
        }

        .form-side h3 {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--text-cream);
          margin-bottom: 6px;
        }

        .form-side .subtitle {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          color: var(--text-muted);
          margin-bottom: 40px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: var(--text-cream);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-group input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(229, 173, 70, 0.12);
          animation: stitchPulse 0.6s ease;
        }

        .form-group input::placeholder {
          color: rgba(139, 147, 167, 0.5);
        }

        @keyframes stitchPulse {
          0% { box-shadow: 0 0 0 0 rgba(229, 173, 70, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(229, 173, 70, 0.08); }
          100% { box-shadow: 0 0 0 3px rgba(229, 173, 70, 0.12); }
        }

        .error-box {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.25);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #f87171;
          font-size: 13px;
          line-height: 1.5;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--gold);
          border: none;
          border-radius: 10px;
          color: #1e2a38;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-top: 8px;
        }

        .submit-btn:hover {
          background: var(--gold-light);
        }

        .submit-btn:active {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-footer-note {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 28px;
        }

        @media (max-width: 900px) {
          .admin-login-root {
            grid-template-columns: 1fr;
          }
          .panel {
            display: none;
          }
          .form-side {
            padding: 32px 24px;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}),(0,t.jsxs)("div",{className:"admin-login-root",children:[(0,t.jsxs)("div",{className:"panel",children:[(0,t.jsxs)("svg",{className:"thread-bg",viewBox:"0 0 600 900",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,t.jsx)("path",{d:"M50 100 Q200 200 150 400 Q100 600 250 800",stroke:"#e5ad46",strokeWidth:"1.5",strokeDasharray:"8 6",fill:"none"}),(0,t.jsx)("path",{d:"M120 50 Q300 180 220 450 Q140 720 300 850",stroke:"#e5ad46",strokeWidth:"1",strokeDasharray:"6 8",fill:"none"}),(0,t.jsx)("path",{d:"M400 30 Q320 250 380 480 Q440 700 350 880",stroke:"#eccc90",strokeWidth:"1",strokeDasharray:"10 5",fill:"none"}),(0,t.jsx)("path",{d:"M500 120 Q420 300 480 520 Q540 740 430 870",stroke:"#e5ad46",strokeWidth:"1.2",strokeDasharray:"5 9",fill:"none"}),(0,t.jsx)("path",{d:"M80 200 Q250 320 180 560 Q110 800 280 900",stroke:"#eccc90",strokeWidth:"0.8",strokeDasharray:"4 10",fill:"none"})]}),(0,t.jsx)("div",{className:"brand-mark",children:(0,t.jsx)("img",{src:"/navbar/logo-dark.svg",alt:"JMR Textile",style:{height:40,width:"auto"}})}),(0,t.jsxs)("div",{className:"copy-section",children:[(0,t.jsx)("div",{className:"eyebrow",children:"ESPACE DE GESTION"}),(0,t.jsx)("h2",{children:"La précision d'un atelier, orchestrée depuis un seul tableau de bord."}),(0,t.jsx)("p",{children:"Commandes, collections et clients : pilotez l'ensemble de l'activité JMR Textile avec la même rigueur que celle apportée à chaque pièce cousue à Madagascar."})]}),(0,t.jsxs)("div",{className:"panel-footer",children:[(0,t.jsx)("span",{children:"Sécurisé"}),(0,t.jsx)("span",{children:"Temps réel"}),(0,t.jsx)("span",{children:"© 2026"})]})]}),(0,t.jsxs)("div",{className:"form-side",children:[(0,t.jsxs)("div",{className:"form-badge",children:[(0,t.jsxs)("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,t.jsx)("rect",{x:"1",y:"8",width:"2.5",height:"5",rx:"0.5",fill:"#e5ad46"}),(0,t.jsx)("rect",{x:"4.5",y:"5",width:"2.5",height:"8",rx:"0.5",fill:"#e5ad46"}),(0,t.jsx)("rect",{x:"8",y:"2.5",width:"2.5",height:"10.5",rx:"0.5",fill:"#e5ad46"}),(0,t.jsx)("rect",{x:"11.5",y:"0.5",width:"2",height:"12.5",rx:"0.5",fill:"#e5ad46"})]}),"Administration"]}),(0,t.jsx)(i.default,{href:"/",className:"back-link",children:"← Retour au site"}),(0,t.jsx)("h3",{children:"Espace de gestion"}),(0,t.jsx)("div",{className:"subtitle",children:"CONNEXION SÉCURISÉE"}),(0,t.jsxs)("form",{onSubmit:f,children:[(0,t.jsxs)("div",{className:"form-group",children:[(0,t.jsx)("label",{htmlFor:"email",children:"Adresse email"}),(0,t.jsx)("input",{id:"email",type:"email",placeholder:"admin@jmr-textile.com",value:e,onChange:e=>n(e.target.value),required:!0,autoComplete:"email"})]}),(0,t.jsxs)("div",{className:"form-group",children:[(0,t.jsx)("label",{htmlFor:"password",children:"Mot de passe"}),(0,t.jsx)("input",{id:"password",type:"password",placeholder:"••••••••",value:l,onChange:e=>d(e.target.value),required:!0,autoComplete:"current-password"})]}),c&&(0,t.jsx)("div",{className:"error-box",children:c}),(0,t.jsx)("button",{type:"submit",className:"submit-btn",disabled:x,children:x?"Connexion en cours...":"Se connecter"})]}),(0,t.jsx)("div",{className:"form-footer-note",children:"Accès réservé aux administrateurs autorisés."})]})]})]}):(0,t.jsxs)("div",{style:{minHeight:"100vh",background:"#1e2a38",display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,t.jsx)("div",{style:{width:40,height:40,border:"3px solid #e5ad46",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),(0,t.jsx)("style",{children:"@keyframes spin { to { transform: rotate(360deg); } }"})]})}e.s(["default",()=>n])}]);