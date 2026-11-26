(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[9802],{35484:(e,s,i)=>{"use strict";i.d(s,{A:()=>r});let r=(0,i(99537).A)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]])},64585:(e,s,i)=>{"use strict";i.r(s),i.d(s,{default:()=>u});var r=i(95155),a=i(12115),t=i(98500),o=i.n(t),n=i(8776),c=i(97320),l=i(65377),d=i(35484);let p=Object.fromEntries(n.zC.map((e,s)=>[e,s]));function m(e){if(!e)return"—";try{return new Date(e).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}catch{return e}}function x(e){if(!e)return"";try{return new Date(e).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}catch{return""}}function u(){let e,[s,i]=(0,a.useState)(""),[t,u]=(0,a.useState)(""),[h,g]=(0,a.useState)(null),[b,f]=(0,a.useState)(!1),[j,y]=(0,a.useState)(null),[N,w]=(0,a.useState)(!1),k=async e=>{e.preventDefault(),f(!0),y(null),g(null),w(!1);try{let e=await n.G.suiviCommande(s,t);g(e.data.data)}catch(e){y(e instanceof Error?e.message:"Erreur")}finally{f(!1),w(!0)}},A=h?p[h.statut_production]??0:0,z=h?Math.round((A+1)/n.zC.length*100):0,E=h?((e=[]).push({date:x(h.date_commande),step:"Commande",title:"Commande enregistr\xe9e",desc:`${h.quantite} pi\xe8ce(s) — ${h.designation||"Confection textile"}.`,tag:"EFFECTU\xc9",tone:"success"}),"Livr\xe9e"===h.statut_production?e.push({date:x(h.date_livraison_reelle??h.date_livraison_prevue),step:"Livraison",title:"Commande livr\xe9e",desc:`Livr\xe9e le ${m(h.date_livraison_reelle??h.date_livraison_prevue)}.`,tag:"EFFECTU\xc9",tone:"success"}):e.push({date:"",step:h.statut_production,title:`\xc9tape actuelle : ${h.statut_production}`,desc:h.pieces_produites>0?`${h.pieces_produites} / ${h.quantite} pi\xe8ces produites.`:"Votre commande avance. Vous serez inform\xe9 de chaque \xe9tape.",tag:"EN COURS",tone:"current"}),h.en_retard&&e.push({date:"",step:"Atelier",title:"L\xe9ger retard signal\xe9",desc:"Cette commande accuse un l\xe9ger retard. Notre \xe9quipe vous contacte.",tag:"INFORMATION",tone:"warning"}),e):[];return(0,r.jsxs)("div",{className:"min-h-screen bg-[#1e2a38] text-[#EAA100]",children:[(0,r.jsx)("style",{children:v}),(0,r.jsx)("header",{className:"border-b border-[#EAA100]/10",children:(0,r.jsxs)("div",{className:"mx-auto max-w-3xl px-6 py-6 flex items-center justify-between",children:[(0,r.jsx)(o(),{href:"/",className:"font-headline text-2xl text-[#EAA100]",children:"JMR Atelier"}),(0,r.jsx)(o(),{href:"/",className:"text-caption font-bold uppercase tracking-[0.2em] text-[#EAA100]/60 hover:text-[#EAA100]",children:"← Retour au site"})]})}),(0,r.jsxs)("main",{className:"mx-auto max-w-3xl px-6 py-14",children:[(0,r.jsx)("h1",{className:"font-headline text-4xl text-[#EAA100] text-center",children:"Suivi de commande"}),(0,r.jsx)("p",{className:"text-center text-sm text-[#EAA100]/60 mt-3",children:"Retrouvez l'\xe9tat d'avancement de votre commande en indiquant son num\xe9ro et votre email."}),(0,r.jsxs)("form",{onSubmit:k,className:"mt-10 space-y-4",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("label",{className:"text-caption font-bold uppercase tracking-[0.2em] text-[#EAA100]/50",children:"Num\xe9ro de commande"}),(0,r.jsx)("input",{value:s,onChange:e=>i(e.target.value),placeholder:"ex : CMD-AB12CD34",required:!0,className:"mt-2 w-full rounded-xl border border-[#EAA100]/20 bg-[#161D30] px-4 py-3 text-sm text-[#EAA100] placeholder:text-[#EAA100]/30 focus:border-[#EAA100] focus:outline-none"})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("label",{className:"text-caption font-bold uppercase tracking-[0.2em] text-[#EAA100]/50",children:"Email utilis\xe9 lors de la commande"}),(0,r.jsx)("input",{type:"email",value:t,onChange:e=>u(e.target.value),placeholder:"vous@exemple.com",required:!0,className:"mt-2 w-full rounded-xl border border-[#EAA100]/20 bg-[#161D30] px-4 py-3 text-sm text-[#EAA100] placeholder:text-[#EAA100]/30 focus:border-[#EAA100] focus:outline-none"})]}),(0,r.jsxs)("button",{type:"submit",disabled:b,className:"mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#EAA100] px-6 py-3 text-label font-bold uppercase tracking-[0.2em] text-[#1B2436] hover:brightness-105 disabled:opacity-50",children:[b?(0,r.jsx)(c.A,{className:"h-4 w-4 animate-spin"}):(0,r.jsx)(l.A,{className:"h-4 w-4"}),"Suivre ma commande"]})]}),j&&(0,r.jsxs)("div",{className:"mt-8 flex items-start gap-3 rounded-xl border border-[#e05252]/30 bg-[#e05252]/10 p-4 text-sm text-[#e05252]",children:[(0,r.jsx)(d.A,{className:"h-5 w-5 shrink-0"}),(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"font-bold",children:"Commande introuvable"}),(0,r.jsx)("p",{className:"text-[#e05252]/80 text-xs mt-1",children:"V\xe9rifiez le num\xe9ro et l'email saisis. Pour toute question, contactez-nous \xe0 contact@jmrtextile.com."})]})]}),N&&!j&&!b&&!h&&(0,r.jsx)("div",{className:"mt-8 text-center text-sm text-[#EAA100]/50",children:"Aucune commande ne correspond \xe0 ces informations."})]}),h&&(0,r.jsx)("div",{className:"suivi-scope",children:(0,r.jsxs)("main",{className:"suivi-main",children:[(0,r.jsxs)("div",{className:"breadcrumb",children:[(0,r.jsx)(o(),{href:"/",children:"Accueil"}),(0,r.jsx)("span",{children:"›"}),(0,r.jsxs)("span",{className:"breadcrumb-current",children:["Commande #",h.numero]})]}),(0,r.jsxs)("section",{className:"page-head",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"eyebrow",children:"Suivi de commande"}),(0,r.jsx)("h1",{children:h.designation||"Confection textile"}),(0,r.jsxs)("p",{className:"order-description",children:[h.quantite," pi\xe8ce(s)"]}),(0,r.jsxs)("p",{className:"order-ref",children:["R\xe9f\xe9rence #",h.numero]})]}),(0,r.jsxs)("span",{className:"status",children:[(0,r.jsx)("span",{className:"status-dot"}),h.statut_production]})]}),(0,r.jsxs)("div",{className:"layout",children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("section",{className:"card progress-card",children:[(0,r.jsxs)("div",{className:"progress-head",children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"progress-label",children:"\xc9tape actuelle"}),(0,r.jsx)("p",{className:"progress-current",children:h.statut_production})]}),(0,r.jsxs)("div",{className:"progress-percent",children:[z,"%"]})]}),(0,r.jsxs)("div",{className:"stepper",children:[(0,r.jsx)("div",{className:"stepper-track"}),(0,r.jsx)("div",{className:"stepper-progress",style:{width:`${Math.max(8,(A+1)/n.zC.length*100)}%`}}),n.zC.map((e,s)=>{let i=s<A,a=s===A;return(0,r.jsxs)("div",{className:`step${i?" done":""}${a?" current":""}`,children:[(0,r.jsx)("span",{className:"step-circle",children:i?(0,r.jsx)("svg",{width:"11",height:"11",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"3",strokeLinecap:"round",strokeLinejoin:"round",children:(0,r.jsx)("path",{d:"m5 12 4 4L19 6"})}):null}),(0,r.jsx)("span",{className:"step-name",children:e}),(0,r.jsx)("span",{className:"step-date",children:a?"En cours":i?"Fait":""})]},e)})]}),(0,r.jsxs)("div",{className:"last-update",children:[(0,r.jsx)("div",{className:"update-icon",children:(0,r.jsxs)("svg",{width:"17",height:"17",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.7",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("path",{d:"M12 8v4l3 2"}),(0,r.jsx)("circle",{cx:"12",cy:"12",r:"9"})]})}),(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"update-label",children:"DERNI\xc8RE MISE \xc0 JOUR"}),(0,r.jsxs)("p",{className:"update-title",children:["Commande ",h.numero," — ",h.statut_production]}),(0,r.jsxs)("p",{className:"update-text",children:[h.pieces_produites," / ",h.quantite," pi\xe8ces produites.",h.date_livraison_prevue?` Livraison estim\xe9e : ${m(h.date_livraison_prevue)}.`:""]})]})]})]}),h.en_retard&&(0,r.jsxs)("section",{className:"card action-card",children:[(0,r.jsx)("div",{className:"card-header",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("h2",{className:"card-title",children:"Action requise"}),(0,r.jsx)("p",{className:"card-subtitle",children:"Votre intervention est n\xe9cessaire"})]})}),(0,r.jsxs)("div",{className:"action-body",children:[(0,r.jsx)("p",{className:"action-label",children:"Probl\xe8me signal\xe9"}),(0,r.jsx)("h3",{className:"action-title",children:"Retard de production"}),(0,r.jsx)("p",{className:"action-text",children:"Cette commande accuse un l\xe9ger retard. Notre \xe9quipe vous contacte directement."}),(0,r.jsx)(o(),{href:"/contact",className:"btn btn-primary",children:"Contacter l'atelier"})]})]}),(0,r.jsxs)("section",{className:"card",children:[(0,r.jsx)("div",{className:"card-header",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("h2",{className:"card-title",children:"Historique de la commande"}),(0,r.jsx)("p",{className:"card-subtitle",children:"Toutes les mises \xe0 jour communiqu\xe9es par l'atelier"})]})}),(0,r.jsx)("div",{className:"timeline",children:E.map((e,s)=>(0,r.jsxs)("article",{className:`timeline-item ${e.tone}`,children:[(0,r.jsx)("div",{className:"timeline-date",children:e.date}),(0,r.jsx)("div",{className:"timeline-marker",children:(0,r.jsx)("span",{className:"timeline-dot"})}),(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{className:"timeline-step",children:e.step}),(0,r.jsx)("h3",{className:"timeline-title",children:e.title}),(0,r.jsx)("p",{className:"timeline-description",children:e.desc}),(0,r.jsxs)("div",{className:"timeline-meta",children:[(0,r.jsx)("span",{className:`timeline-tag tag-${"success"===e.tone?"success":(e.tone,"warning")}`,children:e.tag}),(0,r.jsx)("span",{children:"Atelier JMR Textile"})]})]})]},s))})]})]}),(0,r.jsxs)("aside",{children:[(0,r.jsxs)("section",{className:"card",children:[(0,r.jsx)("div",{className:"card-header",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("h2",{className:"card-title",children:"Commande"}),(0,r.jsx)("p",{className:"card-subtitle",children:"Informations g\xe9n\xe9rales"})]})}),(0,r.jsxs)("div",{className:"info-body",children:[(0,r.jsxs)("div",{className:"info-row",children:[(0,r.jsx)("span",{className:"info-label",children:"R\xe9f\xe9rence"}),(0,r.jsxs)("span",{className:"info-value",children:["#",h.numero]})]}),(0,r.jsxs)("div",{className:"info-row",children:[(0,r.jsx)("span",{className:"info-label",children:"Quantit\xe9"}),(0,r.jsxs)("span",{className:"info-value",children:[h.quantite," pi\xe8ces"]})]}),(0,r.jsxs)("div",{className:"info-row",children:[(0,r.jsx)("span",{className:"info-label",children:"Produit"}),(0,r.jsx)("span",{className:"info-value",children:h.designation||"—"})]}),(0,r.jsxs)("div",{className:"info-row",children:[(0,r.jsx)("span",{className:"info-label",children:"Statut"}),(0,r.jsx)("span",{className:"info-value",children:h.statut_production})]})]})]}),(0,r.jsxs)("section",{className:"card",children:[(0,r.jsx)("div",{className:"card-header",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("h2",{className:"card-title",children:"Livraison"}),(0,r.jsx)("p",{className:"card-subtitle",children:"Estimation actuelle"})]})}),(0,r.jsxs)("div",{className:"delivery-body",children:[(0,r.jsx)("p",{className:"delivery-date",children:m(h.date_livraison_reelle??h.date_livraison_prevue)}),(0,r.jsx)("div",{className:"delivery-line"}),(0,r.jsx)("p",{className:"delivery-text",children:"Cette date peut \xe9voluer selon l'avancement. Vous serez inform\xe9 automatiquement."})]})]}),(0,r.jsxs)("section",{className:"card",children:[(0,r.jsx)("div",{className:"card-header",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("h2",{className:"card-title",children:"Besoin d'aide ?"}),(0,r.jsx)("p",{className:"card-subtitle",children:"Une question sur cette commande ?"})]})}),(0,r.jsxs)("div",{className:"response-body",children:[(0,r.jsx)("p",{className:"response-text",children:"Contactez directement l'\xe9quipe JMR Textile."}),(0,r.jsx)(o(),{href:"/contact",className:"btn btn-secondary",children:"Contacter l'atelier"})]})]})]})]})]})})]})}let v=`
.suivi-scope{
  --navy-950:#161D30;
  --navy-900:#1E2A38;
  --navy-850:#1e2a38;
  --navy-border:#2b3852;
  --gold:#EAA100;
  --gold-bright:#EAA100;
  --cream:#FFF8EC;
  --slate:#8b93a7;
  --slate-dim:#8B94A3;
  --green:#5cb87d;
  --orange:#e08b52;
  --red:#e05252;
  --serif:var(--font-brand),Georgia,serif;
  --sans:var(--font-inter),-apple-system,BlinkMacSystemFont,sans-serif;
  background:var(--navy-950);
  color:var(--cream);
  font-family:var(--sans);
  line-height:1.5;
  border-top:1px solid var(--navy-border);
}
.suivi-scope button{cursor:pointer;}
.suivi-scope a{color:inherit;text-decoration:none;}
.suivi-main{width:min(1120px,calc(100% - 80px));margin:0 auto;padding:38px 0 80px;}
.suivi-scope .breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:22px;color:var(--slate-dim);font-size:13px;}
.suivi-scope .breadcrumb a:hover{color:var(--cream);}
.suivi-scope .breadcrumb-current{color:var(--slate);}
.suivi-scope .page-head{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;padding-bottom:26px;border-bottom:1px solid var(--navy-border);}
.suivi-scope .eyebrow{margin:0 0 6px;color:var(--gold-bright);font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;}
.suivi-scope h1{margin:0;font-family:var(--serif);font-size:36px;line-height:1.15;font-weight:600;color:var(--cream);}
.suivi-scope .order-description{margin:8px 0 0;color:var(--slate);font-size:14px;}
.suivi-scope .order-ref{margin-top:8px;color:var(--slate-dim);font-family:monospace;font-size:12px;}
.suivi-scope .status{display:inline-flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;color:var(--gold-bright);background:rgba(234, 161, 0,.14);font-size:12px;font-weight:600;white-space:nowrap;}
.suivi-scope .status-dot{width:7px;height:7px;border-radius:50%;background:currentColor;}
.suivi-scope .layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(280px,.8fr);gap:24px;margin-top:28px;}
.suivi-scope .card{background:var(--navy-850);border:1px solid var(--navy-border);border-radius:11px;margin-top:24px;}
.suivi-scope .card:first-child{margin-top:0;}
.suivi-scope aside .card{margin-top:20px;}
.suivi-scope aside .card:first-child{margin-top:0;}
.suivi-scope .card-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px 17px;border-bottom:1px solid var(--navy-border);}
.suivi-scope .card-title{margin:0;font-family:var(--serif);font-size:19px;font-weight:500;color:var(--cream);}
.suivi-scope .card-subtitle{margin:4px 0 0;color:var(--slate-dim);font-size:12px;}
.suivi-scope .progress-card{padding:25px 24px 27px;}
.suivi-scope .progress-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;}
.suivi-scope .progress-label{margin:0;color:var(--slate);font-size:13px;}
.suivi-scope .progress-current{margin:4px 0 0;color:var(--cream);font-family:var(--serif);font-size:22px;}
.suivi-scope .progress-percent{color:var(--gold-bright);font-family:var(--serif);font-size:25px;}
.suivi-scope .stepper{position:relative;display:grid;grid-template-columns:repeat(6,1fr);gap:0;}
.suivi-scope .stepper-track{position:absolute;left:12px;right:12px;top:10px;height:2px;background:var(--navy-border);}
.suivi-scope .stepper-progress{position:absolute;left:12px;top:10px;height:2px;background:var(--gold);}
.suivi-scope .step{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;}
.suivi-scope .step-circle{width:21px;height:21px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--navy-850);border:2px solid var(--navy-border);color:var(--navy-950);}
.suivi-scope .step.done .step-circle{background:var(--gold);border-color:var(--gold);}
.suivi-scope .step.current .step-circle{border-color:var(--gold);box-shadow:0 0 0 5px rgba(234, 161, 0,.15);}
.suivi-scope .step-name{max-width:105px;margin-top:11px;color:var(--slate-dim);font-size:11.5px;line-height:1.35;}
.suivi-scope .step.done .step-name,.suivi-scope .step.current .step-name{color:var(--cream);}
.suivi-scope .step-date{margin-top:3px;color:var(--slate-dim);font-size:10px;}
.suivi-scope .step.current .step-date{color:var(--gold-bright);}
.suivi-scope .last-update{display:flex;gap:13px;margin-top:30px;padding-top:18px;border-top:1px dashed var(--navy-border);}
.suivi-scope .update-icon{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:50%;color:var(--gold-bright);background:rgba(234, 161, 0,.1);}
.suivi-scope .update-label{margin:0 0 2px;color:var(--slate-dim);font-size:11px;}
.suivi-scope .update-title{margin:0;color:var(--cream);font-size:14px;font-weight:500;}
.suivi-scope .update-text{margin:4px 0 0;color:var(--slate);font-size:13px;}
.suivi-scope .action-card{border-color:rgba(234, 161, 0,.45);background:linear-gradient(135deg,rgba(234, 161, 0,.08),transparent 55%),var(--navy-850);}
.suivi-scope .action-body{padding:20px 22px 22px;}
.suivi-scope .action-label{margin:0 0 3px;color:var(--orange);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;}
.suivi-scope .action-title{margin:0;font-family:var(--serif);font-size:17px;font-weight:500;color:var(--cream);}
.suivi-scope .action-text{margin:14px 0 18px;color:var(--slate);font-size:13px;line-height:1.6;}
.suivi-scope .btn{border:0;border-radius:7px;padding:10px 14px;font-size:13px;font-weight:600;display:inline-flex;align-items:center;gap:8px;}
.suivi-scope .btn-primary{background:var(--gold);color:#1B2436;}
.suivi-scope .btn-primary:hover{background:var(--gold-bright);}
.suivi-scope .btn-secondary{background:transparent;border:1px solid var(--navy-border);color:var(--cream);}
.suivi-scope .btn-secondary:hover{border-color:var(--gold);color:var(--gold-bright);}
.suivi-scope .timeline{padding:7px 22px 20px;}
.suivi-scope .timeline-item{position:relative;display:grid;grid-template-columns:70px 20px 1fr;gap:13px;padding:17px 0;border-bottom:1px solid var(--navy-border);}
.suivi-scope .timeline-item:last-child{border-bottom:0;}
.suivi-scope .timeline-date{padding-top:2px;color:var(--slate-dim);font-size:11px;text-align:right;}
.suivi-scope .timeline-marker{position:relative;display:flex;justify-content:center;}
.suivi-scope .timeline-marker::before{content:"";position:absolute;top:15px;bottom:-35px;width:1px;background:var(--navy-border);}
.suivi-scope .timeline-item:last-child .timeline-marker::before{display:none;}
.suivi-scope .timeline-dot{position:relative;z-index:2;width:9px;height:9px;margin-top:4px;border-radius:50%;background:var(--slate-dim);border:2px solid var(--navy-850);box-shadow:0 0 0 1px var(--navy-border);}
.suivi-scope .timeline-item.success .timeline-dot{background:var(--green);}
.suivi-scope .timeline-item.current .timeline-dot{background:var(--gold);box-shadow:0 0 0 1px var(--gold),0 0 0 5px rgba(234, 161, 0,.12);}
.suivi-scope .timeline-item.warning .timeline-dot{background:var(--orange);}
.suivi-scope .timeline-step{margin:0 0 3px;color:var(--slate-dim);font-size:11px;text-transform:uppercase;letter-spacing:.035em;}
.suivi-scope .timeline-title{margin:0;color:var(--cream);font-size:14px;font-weight:500;}
.suivi-scope .timeline-description{margin:5px 0 0;color:var(--slate);font-size:13px;line-height:1.55;}
.suivi-scope .timeline-meta{display:flex;align-items:center;gap:9px;margin-top:8px;color:var(--slate-dim);font-size:10.5px;}
.suivi-scope .timeline-tag{padding:3px 7px;border-radius:5px;font-size:10px;}
.suivi-scope .tag-success{color:var(--green);background:rgba(92,184,125,.1);}
.suivi-scope .tag-warning{color:var(--orange);background:rgba(224,139,82,.1);}
.suivi-scope .info-body{padding:19px 22px;}
.suivi-scope .info-row{display:flex;justify-content:space-between;gap:15px;padding:11px 0;border-bottom:1px solid var(--navy-border);}
.suivi-scope .info-row:last-child{border-bottom:0;}
.suivi-scope .info-label{color:var(--slate-dim);font-size:12px;}
.suivi-scope .info-value{color:var(--cream);font-size:12.5px;font-weight:500;text-align:right;}
.suivi-scope .delivery-body{padding:20px 22px;}
.suivi-scope .delivery-date{margin:0;color:var(--gold-bright);font-family:var(--serif);font-size:23px;}
.suivi-scope .delivery-line{height:1px;margin:12px 0 14px;background:repeating-linear-gradient(to right,var(--gold) 0 6px,transparent 6px 13px);opacity:.5;}
.suivi-scope .delivery-text{margin:0;color:var(--slate);font-size:12px;}
.suivi-scope .response-body{padding:20px 22px 22px;}
.suivi-scope .response-text{margin:0 0 15px;color:var(--slate);font-size:13px;}
@media (max-width: 850px){
  .suivi-main{width:min(100% - 40px,700px);}
  .suivi-scope .layout{grid-template-columns:1fr;}
  .suivi-scope .stepper{grid-template-columns:repeat(3,1fr);gap:26px 8px;}
  .suivi-scope .stepper-track,.suivi-scope .stepper-progress{display:none;}
}
@media (max-width: 560px){
  .suivi-main{width:calc(100% - 30px);padding-top:25px;}
  .suivi-scope .page-head{flex-direction:column;gap:15px;}
  .suivi-scope h1{font-size:29px;}
  .suivi-scope .stepper{grid-template-columns:repeat(2,1fr);gap:27px 8px;}
  .suivi-scope .timeline-item{grid-template-columns:52px 15px 1fr;gap:8px;}
  .suivi-scope .card-header{padding-left:17px;padding-right:17px;}
  .suivi-scope .info-body,.suivi-scope .delivery-body,.suivi-scope .response-body,.suivi-scope .action-body{padding-left:17px;padding-right:17px;}
}
`},65377:(e,s,i)=>{"use strict";i.d(s,{A:()=>r});let r=(0,i(99537).A)("search",[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]])},94549:(e,s,i)=>{Promise.resolve().then(i.bind(i,64585))},97320:(e,s,i)=>{"use strict";i.d(s,{A:()=>r});let r=(0,i(99537).A)("loader",[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]])},99537:(e,s,i)=>{"use strict";i.d(s,{A:()=>l});var r=i(12115);let a=(...e)=>e.filter((e,s,i)=>!!e&&""!==e.trim()&&i.indexOf(e)===s).join(" ").trim(),t=e=>{let s=e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,i)=>i?i.toUpperCase():s.toLowerCase());return s.charAt(0).toUpperCase()+s.slice(1)};var o={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};let n=(0,r.createContext)({}),c=(0,r.forwardRef)(({color:e,size:s,strokeWidth:i,absoluteStrokeWidth:t,className:c="",children:l,iconNode:d,...p},m)=>{let{size:x=24,strokeWidth:u=2,absoluteStrokeWidth:v=!1,color:h="currentColor",className:g=""}=(0,r.useContext)(n)??{},b=t??v?24*Number(i??u)/Number(s??x):i??u;return(0,r.createElement)("svg",{ref:m,...o,width:s??x??o.width,height:s??x??o.height,stroke:e??h,strokeWidth:b,className:a("lucide",g,c),...!l&&!(e=>{for(let s in e)if(s.startsWith("aria-")||"role"===s||"title"===s)return!0;return!1})(p)&&{"aria-hidden":"true"},...p},[...d.map(([e,s])=>(0,r.createElement)(e,s)),...Array.isArray(l)?l:[l]])}),l=(e,s)=>{let i=(0,r.forwardRef)(({className:i,...o},n)=>(0,r.createElement)(c,{ref:n,iconNode:s,className:a(`lucide-${t(e).replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase()}`,`lucide-${e}`,i),...o}));return i.displayName=t(e),i}}},e=>{e.O(0,[8500,8776,8441,3794,7358],()=>e(e.s=94549)),_N_E=e.O()}]);