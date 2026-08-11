(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,9818,e=>{"use strict";var r=e.i(43476),t=e.i(71645),i=e.i(22016);e.i(47624);var o=e.i(21140),a=e.i(51617),n=e.i(12732);function s(){let[e,s]=(0,t.useState)(""),[l,d]=(0,t.useState)(""),[p,c]=(0,t.useState)(""),[h,x]=(0,t.useState)(!1),[f,m]=(0,t.useState)(!1);(0,t.useEffect)(()=>{m(!0),(0,o.getToken)()&&(window.location.href="/atelier")},[]);let u=async r=>{if(r.preventDefault(),c(""),!a.loginRateLimiter.check("worker-login").allowed)return void c("Trop de tentatives. Veuillez réessayer plus tard.");x(!0);try{let r=new FormData;r.append("intent","login"),r.append("email",e),r.append("password",l);let t=await (0,o.authenticateWithForm)(r);t?.user?.role==="worker"?window.location.href="/atelier":c("Accès non autorisé. Vous devez être opérateur.")}catch(e){c("Email ou mot de passe incorrect.")}finally{x(!1)}};return f?(0,r.jsxs)("div",{style:{margin:0,padding:0},children:[(0,r.jsx)(n.AuthBar,{initialTheme:"dark"}),(0,r.jsx)("style",{dangerouslySetInnerHTML:{__html:`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap');
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes stitch { 0% { background-position: 0 0; } 100% { background-position: 20px 0; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .worker-login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #1e2a38;
          color: #f3efe4;
        }
        .panel {
          position: relative;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #141e2e;
          border-right: 1px solid #2a3a4a;
          overflow: hidden;
        }
        .thread-decoration {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.15;
          pointer-events: none;
        }
        .brand-mark {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 80px;
        }
        .brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #e5ad46, #cb8b3c);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-text {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #f3efe4;
        }
        .copy-section {
          position: relative;
          z-index: 2;
          max-width: 480px;
        }
        .eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #e5ad46;
          margin-bottom: 24px;
          text-transform: uppercase;
        }
        .copy-section h1 {
          font-family: 'Fraunces', serif;
          font-size: 36px;
          font-weight: 500;
          line-height: 1.3;
          color: #f3efe4;
          margin-bottom: 24px;
        }
        .copy-section p {
          font-size: 15px;
          line-height: 1.7;
          color: #8b93a7;
        }
        .panel-footer {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 32px;
          padding-top: 40px;
          border-top: 1px solid #2a3a4a;
        }
        .panel-footer span {
          font-size: 12px;
          color: #5c6478;
        }
        .form-side {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #1e2a38;
        }
        .form-header {
          margin-bottom: 40px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(59, 155, 143, 0.1);
          border: 1px solid rgba(59, 155, 143, 0.2);
          font-size: 12px;
          font-weight: 600;
          color: #e5ad46;
          margin-bottom: 24px;
          letter-spacing: 1px;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 32px;
          font-size: 13px;
          color: #8b93a7;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #e5ad46;
        }
        .form-header h2 {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 500;
          color: #f3efe4;
          margin-bottom: 8px;
        }
        .form-header .subtitle {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #5c6478;
          text-transform: uppercase;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #8b93a7;
          margin-bottom: 8px;
        }
        .input-wrapper {
          position: relative;
        }
        .input-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            #e5ad46,
            #e5ad46 4px,
            transparent 4px,
            transparent 8px
          );
          transition: width 0.4s ease;
        }
        .input-wrapper:focus-within::after {
          width: 100%;
          animation: stitch 0.8s linear infinite;
        }
        .form-group input {
          width: 100%;
          padding: 16px;
          background: #141e2e;
          border: 1px solid #2a3a4a;
          border-radius: 8px;
          color: #f3efe4;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s;
          outline: none;
        }
        .form-group input::placeholder {
          color: #5c6478;
        }
        .form-group input:focus {
          border-color: #e5ad46;
        }
        .error-box {
          padding: 16px;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          border-radius: 8px;
          color: #dc3545;
          font-size: 13px;
          margin-bottom: 24px;
        }
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #e5ad46, #cb8b3c);
          border: none;
          border-radius: 8px;
          color: #f3efe4;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .form-footer {
          margin-top: 32px;
          font-size: 12px;
          color: #5c6478;
          text-align: center;
        }
        @media (max-width: 900px) {
          .worker-login-container {
            grid-template-columns: 1fr;
          }
          .panel {
            display: none;
          }
        }
      `}}),(0,r.jsxs)("div",{className:"worker-login-container",children:[(0,r.jsxs)("div",{className:"panel",children:[(0,r.jsxs)("svg",{className:"thread-decoration",viewBox:"0 0 600 800",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,r.jsx)("path",{d:"M-50 200 Q150 150 250 250 T550 350",stroke:"#e5ad46",strokeWidth:"1",strokeDasharray:"8 12",fill:"none"}),(0,r.jsx)("path",{d:"M-50 300 Q200 250 300 350 T600 400",stroke:"#cb8b3c",strokeWidth:"1",strokeDasharray:"6 10",fill:"none"}),(0,r.jsx)("path",{d:"M-50 400 Q100 350 200 450 T500 500",stroke:"#e5ad46",strokeWidth:"1.5",strokeDasharray:"10 14",fill:"none"}),(0,r.jsx)("path",{d:"M-50 500 Q250 450 350 550 T650 600",stroke:"#cb8b3c",strokeWidth:"1",strokeDasharray:"4 8",fill:"none"}),(0,r.jsx)("path",{d:"M-50 150 Q300 100 400 200 T700 300",stroke:"#eccc90",strokeWidth:"0.8",strokeDasharray:"6 10",fill:"none"}),(0,r.jsx)("path",{d:"M-50 600 Q150 550 250 650 T550 750",stroke:"#e5ad46",strokeWidth:"1",strokeDasharray:"8 12",fill:"none"})]}),(0,r.jsx)("div",{className:"brand-mark",children:(0,r.jsx)("img",{src:"/navbar/logo-dark.svg",alt:"JMR Textile",style:{height:40,width:"auto"}})}),(0,r.jsxs)("div",{className:"copy-section",children:[(0,r.jsx)("p",{className:"eyebrow",children:"ESPACE ATELIER"}),(0,r.jsx)("h1",{children:"La précision d'un atelier, au service de chaque opérateur."}),(0,r.jsx)("p",{children:"Commandes, tissage et finition : accédez à votre espace de production avec la même exigence que celle transmise à chaque pièce cousue à Madagascar."})]}),(0,r.jsxs)("div",{className:"panel-footer",children:[(0,r.jsx)("span",{children:"Sécurisé"}),(0,r.jsx)("span",{children:"Production"}),(0,r.jsx)("span",{children:"© 2026"})]})]}),(0,r.jsxs)("div",{className:"form-side",children:[(0,r.jsxs)("div",{className:"form-header",children:[(0,r.jsxs)("div",{className:"badge",children:[(0,r.jsxs)("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("path",{d:"M12 20h9"}),(0,r.jsx)("path",{d:"M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"})]}),"Atelier"]}),(0,r.jsx)(i.default,{href:"/",className:"back-link",children:"← Retour au site"}),(0,r.jsx)("h2",{children:"Espace atelier"}),(0,r.jsx)("p",{className:"subtitle",children:"CONNEXION SÉCURISÉE"})]}),(0,r.jsxs)("form",{onSubmit:u,children:[(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"email",children:"Email"}),(0,r.jsx)("div",{className:"input-wrapper",children:(0,r.jsx)("input",{id:"email",type:"email",placeholder:"votre@email.com",value:e,onChange:e=>s(e.target.value),required:!0})})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"password",children:"Mot de passe"}),(0,r.jsx)("div",{className:"input-wrapper",children:(0,r.jsx)("input",{id:"password",type:"password",placeholder:"••••••••",value:l,onChange:e=>d(e.target.value),required:!0})})]}),p&&(0,r.jsx)("div",{className:"error-box",children:p}),(0,r.jsx)("button",{type:"submit",className:"submit-btn",disabled:h,children:h?"Connexion en cours...":"Se connecter"})]}),(0,r.jsx)("p",{className:"form-footer",children:"Accès réservé aux opérateurs de production"})]})]})]}):(0,r.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",background:"#1e2a38"},children:(0,r.jsx)("div",{style:{width:40,height:40,border:"3px solid #2a3a4a",borderTop:"3px solid #e5ad46",borderRadius:"50%",animation:"spin 1s linear infinite"}})})}e.s(["default",()=>s])}]);