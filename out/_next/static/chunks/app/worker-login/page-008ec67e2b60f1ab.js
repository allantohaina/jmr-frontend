(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9825],{1036:(e,t,o)=>{"use strict";o.d(t,{WW:()=>n});class r{constructor(e=5,t=9e5){this.requests=new Map,this.maxRequests=e,this.windowMs=t}check(e){let t=Date.now(),o=this.requests.get(e);if(!o||t>o.resetTime){let o=t+this.windowMs;return this.requests.set(e,{count:1,resetTime:o}),{allowed:!0,resetTime:o,remaining:this.maxRequests-1}}if(o.count>=this.maxRequests)return{allowed:!1,resetTime:o.resetTime,remaining:0};let r=o.count+1;return this.requests.set(e,{...o,count:r}),{allowed:!0,resetTime:o.resetTime,remaining:this.maxRequests-r}}cleanup(){let e=Date.now();for(let[t,o]of this.requests.entries())e>o.resetTime&&this.requests.delete(t)}}let n=new r(5,9e5),i=new r(3,36e5),s=new r(2,36e5);"u">typeof setInterval&&setInterval(()=>{n.cleanup(),i.cleanup(),s.cleanup()},36e5)},54494:(e,t,o)=>{"use strict";o.d(t,{JM:()=>a,Co:()=>s,R2:()=>r.R2,m$:()=>i.authenticateWithForm,Z2:()=>n.Z2,gf:()=>n.gf,nJ:()=>r.nJ,JR:()=>i.signOutClient,Qk:()=>n.Qk});var r=o(8776),n=o(92822),i=o(91274);let s=[],a={validationRequired:"Validation client requise avant de continuer.",lockedVersion:"Version signee verrouillee pour le client. Les corrections passent par une nouvelle version signee."};o(1036)},59302:(e,t,o)=>{Promise.resolve().then(o.bind(o,81770))},81770:(e,t,o)=>{"use strict";o.r(t),o.d(t,{default:()=>c});var r=o(95155),n=o(12115),i=o(98500),s=o.n(i),a=o(54494),l=o(1036),d=o(9583);function c(){let[e,t]=(0,n.useState)(""),[o,i]=(0,n.useState)(""),[c,p]=(0,n.useState)(""),[m,u]=(0,n.useState)(!1),[g,x]=(0,n.useState)(!1);function h(){let e=new URLSearchParams(window.location.search);return(0,a.Z2)(e.get("next"))??null}(0,n.useEffect)(()=>{x(!0),(0,a.gf)()&&(window.location.href=h()||"/atelier")},[]);let f=async t=>{if(t.preventDefault(),p(""),!l.WW.check("worker-login").allowed)return void p("Trop de tentatives. Veuillez r\xe9essayer plus tard.");u(!0);try{let t=new FormData;t.append("intent","login"),t.append("email",e),t.append("password",o);let r=h();r&&t.append("next",r);let n=await (0,a.m$)(t);n?.user?.role==="worker"||n?.user?.role==="admin"?window.location.href=r||"/atelier":p("Acc\xe8s non autoris\xe9. Vous devez \xeatre op\xe9rateur.")}catch(e){p("Email ou mot de passe incorrect.")}finally{u(!1)}};return g?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("style",{children:`
        

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg-deep: #1e2a38;
          --bg-panel: #161D30;
          --gold: #EAA100;
          --gold-light: #EAA100;
          --text-cream: #FFF8EC;
          --text-muted: #8b93a7;
        }

        .worker-login-root {
          min-height: 100vh;
          background: var(--bg-deep);
          font-family: var(--font-inter), system-ui, sans-serif;
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
          font-family: var(--font-brand), Georgia, serif;
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
          background: rgba(59, 155, 143, 0.1);
          border: 1px solid rgba(59, 155, 143, 0.2);
          border-radius: 24px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 500;
          color: var(--gold);
          margin-bottom: 24px;
          width: fit-content;
          letter-spacing: 1px;
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
          font-family: var(--font-brand), Georgia, serif;
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
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-group input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(234, 161, 0, 0.12);
          animation: stitchPulse 0.6s ease;
        }

        .form-group input::placeholder {
          color: rgba(139, 147, 167, 0.5);
        }

        @keyframes stitchPulse {
          0% { box-shadow: 0 0 0 0 rgba(234, 161, 0, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(234, 161, 0, 0.08); }
          100% { box-shadow: 0 0 0 3px rgba(234, 161, 0, 0.12); }
        }

        .error-box {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.25);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #F3A3A6;
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
          font-family: var(--font-inter), system-ui, sans-serif;
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
          .worker-login-root {
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
      `}),(0,r.jsxs)("div",{className:"worker-login-root",children:[(0,r.jsx)(d.AuthBar,{}),(0,r.jsxs)("div",{className:"panel",children:[(0,r.jsxs)("svg",{className:"thread-bg",viewBox:"0 0 600 900",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,r.jsx)("path",{d:"M50 100 Q200 200 150 400 Q100 600 250 800",stroke:"#EAA100",strokeWidth:"1.5",strokeDasharray:"8 6",fill:"none"}),(0,r.jsx)("path",{d:"M120 50 Q300 180 220 450 Q140 720 300 850",stroke:"#EAA100",strokeWidth:"1",strokeDasharray:"6 8",fill:"none"}),(0,r.jsx)("path",{d:"M400 30 Q320 250 380 480 Q440 700 350 880",stroke:"#EAA100",strokeWidth:"1",strokeDasharray:"10 5",fill:"none"}),(0,r.jsx)("path",{d:"M500 120 Q420 300 480 520 Q540 740 430 870",stroke:"#EAA100",strokeWidth:"1.2",strokeDasharray:"5 9",fill:"none"}),(0,r.jsx)("path",{d:"M80 200 Q250 320 180 560 Q110 800 280 900",stroke:"#EAA100",strokeWidth:"0.8",strokeDasharray:"4 10",fill:"none"})]}),(0,r.jsx)("div",{className:"brand-mark",children:(0,r.jsx)("img",{src:"/navbar/logo-dark.svg",alt:"JMR Textile",style:{height:40,width:"auto"}})}),(0,r.jsxs)("div",{className:"copy-section",children:[(0,r.jsx)("div",{className:"eyebrow",children:"ESPACE ATELIER"}),(0,r.jsx)("h2",{children:"La pr\xe9cision d'un atelier, au service de chaque op\xe9rateur."}),(0,r.jsx)("p",{children:"Commandes, tissage et finition : acc\xe9dez \xe0 votre espace de production avec la m\xeame exigence que celle transmise \xe0 chaque pi\xe8ce cousue \xe0 Madagascar."})]}),(0,r.jsxs)("div",{className:"panel-footer",children:[(0,r.jsx)("span",{children:"S\xe9curis\xe9"}),(0,r.jsx)("span",{children:"Production"}),(0,r.jsx)("span",{children:"\xa9 2026"})]})]}),(0,r.jsxs)("div",{className:"form-side",children:[(0,r.jsxs)("div",{className:"form-badge",children:[(0,r.jsxs)("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("path",{d:"M12 20h9"}),(0,r.jsx)("path",{d:"M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"})]}),"Atelier"]}),(0,r.jsx)(s(),{href:"/",className:"back-link",children:"← Retour au site"}),(0,r.jsx)("h3",{children:"Espace atelier"}),(0,r.jsx)("div",{className:"subtitle",children:"CONNEXION S\xc9CURIS\xc9E"}),(0,r.jsxs)("form",{onSubmit:f,children:[(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"email",children:"Adresse email"}),(0,r.jsx)("input",{id:"email",type:"email",placeholder:"votre@email.com",value:e,onChange:e=>t(e.target.value),required:!0,autoComplete:"email"})]}),(0,r.jsxs)("div",{className:"form-group",children:[(0,r.jsx)("label",{htmlFor:"password",children:"Mot de passe"}),(0,r.jsx)("input",{id:"password",type:"password",placeholder:"••••••••",value:o,onChange:e=>i(e.target.value),required:!0,autoComplete:"current-password"})]}),c&&(0,r.jsx)("div",{className:"error-box",children:c}),(0,r.jsx)("button",{type:"submit",className:"submit-btn",disabled:m,children:m?"Connexion en cours...":"Se connecter"})]}),(0,r.jsx)("div",{className:"form-footer-note",children:"Acc\xe8s r\xe9serv\xe9 aux op\xe9rateurs de production"})]})]})]}):(0,r.jsxs)("div",{style:{minHeight:"100vh",background:"#1e2a38",display:"flex",alignItems:"center",justifyContent:"center"},children:[(0,r.jsx)("div",{style:{width:40,height:40,border:"3px solid #EAA100",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),(0,r.jsx)("style",{children:"@keyframes spin { to { transform: rotate(360deg); } }"})]})}},91274:(e,t,o)=>{"use strict";o.r(t),o.d(t,{authenticateWithForm:()=>s,getToken:()=>n.gf,getUser:()=>n.wz,signOutClient:()=>a});var r=o(8776),n=o(92822);function i(e,t){let o=e.get(t);return"string"==typeof o?o.trim():""}async function s(e){let t,o,s="signup"===e.get("intent")?"signup":"login",a=i(e,"email"),l=i(e,"password"),d=i(e,"next");if(!a||!l)throw Error("Veuillez renseigner votre e-mail et votre mot de passe.");if("signup"===s){let o=i(e,"confirm_password");if(o&&o!==l)throw Error("Les mots de passe ne correspondent pas.");let n=i(e,"first_name")||"User",s=i(e,"last_name")||"New",d=i(e,"birth_date"),c=i(e,"age"),p=c?Number(c):void 0,m=i(e,"phone"),u=i(e,"country"),g=i(e,"address");try{t=(await r.R2.register({email:a,password:l,first_name:n,last_name:s,birth_date:d||void 0,age:Number.isFinite(p)?p:void 0,phone:m||void 0,country:u||void 0,address:g||void 0})).data}catch(e){throw console.error("Registration failed:",e),e}}else t=(await r.R2.login(a,l)).data;!function(e,t=!1){(0,n.AM)(n.sn,e.token),(0,n.kR)(n.wf),e.refresh_token&&(0,n.AM)(n.wf,e.refresh_token),(0,n.AM)(n.cv,JSON.stringify(e.user)),(0,n.kR)(n.Il);let o=String(Date.now());(0,n.AM)(n.fT,o),"u">typeof document&&(document.cookie=`${encodeURIComponent(n.fT)}=${encodeURIComponent(o)}; Path=/; Max-Age=172800; SameSite=Lax`,document.cookie=`${encodeURIComponent(n.sn)}=${encodeURIComponent(e.token)}; Path=/; Max-Age=172800; SameSite=Lax`,e.refresh_token&&(document.cookie=`${encodeURIComponent(n.wf)}=${encodeURIComponent(e.refresh_token)}; Path=/; Max-Age=172800; SameSite=Lax`),document.cookie=`${encodeURIComponent(n.cv)}=${encodeURIComponent(JSON.stringify(e.user))}; Path=/; Max-Age=172800; SameSite=Lax`)}(t,"on"===e.get("remember"));let c=t.user?.role,p=(o=(0,n.Z2)(d))||("signup"===s?"/?success=signup#acces-client":"/?success=login#acces-client");return"login"===s&&((0,n.Z2)(d)?p=(0,n.Z2)(d):"admin"===c?p="/backoffice":"worker"===c&&(p="/atelier")),{redirectTo:p,user:t.user}}async function a(){let e=(0,n.gf)(),t=(0,n.G)();if(e)try{await r.R2.logout(t??void 0,e)}catch(e){console.error("Logout failed:",e)}if((0,n.kR)(n.sn),(0,n.kR)(n.wf),(0,n.kR)(n.cv),(0,n.kR)(n.Il),(0,n.kR)(n.fT),"u">typeof document){let e="Max-Age=0; Path=/; SameSite=Lax";document.cookie=`${encodeURIComponent(n.sn)}=; ${e}`,document.cookie=`${encodeURIComponent(n.wf)}=; ${e}`,document.cookie=`${encodeURIComponent(n.cv)}=; ${e}`,document.cookie=`${encodeURIComponent(n.fT)}=; ${e}`,document.cookie=`jmr_token=; ${e}`,document.cookie=`jmr_refresh_token=; ${e}`,document.cookie=`jmr_user=; ${e}`,document.cookie=`jmr_last_activity=; ${e}`}}}},e=>{e.O(0,[8500,8776,9583,8441,3794,7358],()=>e(e.s=59302)),_N_E=e.O()}]);