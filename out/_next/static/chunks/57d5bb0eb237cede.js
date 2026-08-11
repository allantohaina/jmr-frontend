(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,14739,e=>{"use strict";var t=e.i(43476),a=e.i(71645),r=e.i(18566),i=e.i(22016),d=e.i(34461),n=e.i(7767);function s(e){if(!e)return"—";try{return new Date(e).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}catch{return e}}function o(e){if(null==e)return"—";let t="string"==typeof e?parseFloat(e):e;return isNaN(t)?String(e):t.toLocaleString("fr-MA")+" Ar"}function l(e){return String(e).substring(0,8)}let c={draft:"Brouillon",pending:"En attente",accepted:"Acceptée",refused:"Refusée",expired:"Expirée",production:"En production",completed:"Terminée"},p=["Envoyé","Accepté","Production","Livraison","Terminé"];function x(){let e=(0,r.useRouter)(),x=(0,r.useSearchParams)().get("id"),[m,u]=(0,a.useState)(null),[h,v]=(0,a.useState)([]),[f,b]=(0,a.useState)([]),[j,y]=(0,a.useState)([]),[N,k]=(0,a.useState)([]),[w,z]=(0,a.useState)(!0),[S,_]=(0,a.useState)(null),[A,P]=(0,a.useState)(new Set);(0,a.useEffect)(()=>{if(!(0,d.getUser)())return void e.replace(`/mon-profil?next=/mon-profil/devis/detail?id=${x}`);if(!x){_("Aucun ID de devis fourni."),z(!1);return}(async()=>{try{if(!(0,d.getToken)())return void e.replace(`/mon-profil?next=/mon-profil/devis/detail?id=${x}`);let[t,a]=await Promise.all([n.authAPI.get(`/quotes/${x}`),n.authAPI.get("/commandes/")]);u(t.data??t);let r=(a.data??a).filter(e=>e.cotation_id===x);v(r),r.length>0&&P(new Set([r[0].id]));try{let[e,t,a]=await Promise.all([n.checkpointsAPI.list(x).catch(()=>({data:[]})),n.addonsAPI.list(x).catch(()=>({data:[],total_validated:0})),n.paymentsAPI.list(x).catch(()=>({data:[],total_verified:0}))]);b(e.data??[]),y(t.data??[]),k(a.data??[])}catch{}}catch(e){_("Impossible de charger les données du devis.")}finally{z(!1)}})()},[x,e]);let q=(0,a.useCallback)(e=>{P(t=>{let a=new Set(t);return a.has(e)?a.delete(e):a.add(e),a})},[]),T=m&&["accepted","production","completed"].includes(m.status??""),$=m&&Number(m.amount??0)>0,C=[{id:"cp1",title:"Prototype validé",desc:"Le modèle final a été approuvé avant lancement de la série.",meta:"Validé par vous le "+s(m?.created_at),state:"done"},{id:"cp2",title:"Premier lot — contrôle qualité",desc:"L&apos;atelier a terminé le contrôle qualité du premier lot et attend votre retour.",meta:"",state:"action"},{id:"cp3",title:"Lot complet avant expédition",desc:"Vérification finale des pièces avant mise en livraison.",meta:"À venir",state:"upcoming"}],I=[{id:"a1",title:"Bouton doré supplémentaire",desc:"Ajout d&apos;un second bouton en laiton doré.",price:15e3,status:"included"},{id:"a2",title:"Broderie motif floral",desc:"Petit motif brodé main sur la poche.",price:42e3,status:"pending"}],B=[{id:"fb1",avatar:"A",name:"Atelier JMR",date:s(m?.updated_at),text:"Le prototype est prêt, nous attendons votre validation pour lancer la série."}],E=f.length>0?f.map(e=>({id:e.id,title:e.title,desc:e.description??"",meta:e.validated_at?`Valid\xe9 par ${e.validated_by??"—"} le ${s(e.validated_at)}`:"upcoming"===e.status?"À venir":"",state:"done"===e.status?"done":"upcoming"===e.status?"upcoming":"action"})):C,L=j.length>0?j.map(e=>({id:e.id,title:e.title,desc:e.description??"",price:Number(e.price??0),status:e.status})):I,R=N.find(e=>"deposit"===e.phase),D=N.find(e=>"balance"===e.phase);if(w)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:g}),(0,t.jsx)("div",{style:{minHeight:"100vh",background:"var(--bg-deep)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,t.jsx)("div",{style:{color:"var(--gold)",fontSize:18},children:"Chargement…"})})]});if(S)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:g}),(0,t.jsxs)("div",{style:{minHeight:"100vh",background:"var(--bg-deep)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,color:"var(--text-cream)"},children:[(0,t.jsx)("div",{style:{color:"var(--warn)",fontSize:18},children:S}),(0,t.jsx)(i.default,{href:"/mon-profil/devis",style:{color:"var(--gold)",textDecoration:"underline",fontSize:16},children:"← Retour à mes devis"})]})]});if(!m)return null;let M="draft"===m.status||"pending"===m.status,W=L.reduce((e,t)=>e+("included"===t.status?t.price:0),0);return I.filter(e=>"pending"===e.status).length,(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:g}),(0,t.jsxs)("div",{style:{minHeight:"100vh",background:"var(--bg-deep)",color:"var(--text-cream)"},children:[(0,t.jsx)("header",{style:{borderBottom:"1px solid var(--card-border)",padding:"16px 24px"},children:(0,t.jsxs)(i.default,{href:"/",style:{display:"inline-flex",alignItems:"center",gap:10,textDecoration:"none"},children:[(0,t.jsx)("img",{src:"/navbar/logo-dark.svg",alt:"JMR Textile",style:{height:28,width:"auto"}}),(0,t.jsx)("span",{style:{color:"var(--gold)",fontSize:18,fontWeight:700,letterSpacing:1},children:"JMR TEXTILE"})]})}),(0,t.jsxs)("nav",{style:{maxWidth:960,margin:"0 auto",padding:"16px 24px 0",fontSize:13,color:"var(--text-muted)"},children:[(0,t.jsx)(i.default,{href:"/mon-profil",style:{color:"var(--text-muted)",textDecoration:"none"},children:"Tableau de bord"}),(0,t.jsx)("span",{style:{margin:"0 8px"},children:"/"}),(0,t.jsx)(i.default,{href:"/mon-profil/devis",style:{color:"var(--text-muted)",textDecoration:"none"},children:"Mes devis"}),(0,t.jsx)("span",{style:{margin:"0 8px"},children:"/"}),(0,t.jsxs)("span",{style:{color:"var(--text-cream)"},children:["Devis #",l(m.id)]})]}),(0,t.jsxs)("main",{style:{maxWidth:960,margin:"0 auto",padding:"24px"},children:[(0,t.jsxs)("div",{style:{marginBottom:24},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"},children:[(0,t.jsx)("span",{style:{fontSize:12,textTransform:"uppercase",letterSpacing:2,color:"var(--gold-dim)"},children:"Suivi de devis"}),(0,t.jsxs)("span",{style:{fontSize:13,color:"var(--text-muted)"},children:["#",l(m.id)]})]}),(0,t.jsx)("h1",{style:{fontSize:28,fontWeight:700,margin:"8px 0 4px"},children:m.name||m.category}),(0,t.jsx)("span",{className:"status-pill","data-status":m.status,children:c[m.status??""]??m.status})]}),T&&(0,t.jsxs)("div",{className:"quote-confirm",children:[(0,t.jsxs)("div",{className:"quote-confirm-top",children:[(0,t.jsx)("span",{className:"quote-confirm-icon",children:"✓"}),(0,t.jsx)("span",{children:"Prix validé — commande définitive"})]}),(0,t.jsxs)("div",{className:"quote-figures",children:[(0,t.jsxs)("figure",{children:[(0,t.jsx)("b",{children:o(m.amount)}),(0,t.jsx)("span",{children:"Montant total chiffré"})]}),(0,t.jsxs)("figure",{children:[(0,t.jsx)("b",{children:s(m.date_livraison_prevue)}),(0,t.jsx)("span",{children:"Date de rendu estimée"})]}),(0,t.jsxs)("figure",{children:[(0,t.jsx)("b",{children:s(m.validated_at??null)}),(0,t.jsxs)("span",{children:["Validé par ",m.validated_by??"—"]})]})]}),(0,t.jsxs)("div",{className:"quote-confirm-note",children:["Chiffré par l'atelier le ",(0,t.jsx)("b",{children:s(m.created_at)}),", puis validé par vos soins le lendemain. L'acompte de la ",(0,t.jsx)("b",{children:"tranche 1"})," a déclenché le lancement de la production."]})]}),$&&(0,t.jsxs)("div",{className:"panel",style:{marginBottom:24},children:[(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Paiement"}),(0,t.jsx)("span",{className:"hint",children:"2 tranches"})]}),(0,t.jsxs)("div",{className:"payment-grid",children:[(0,t.jsxs)("div",{className:"payment-card",children:[(0,t.jsxs)("div",{className:"payment-top",children:[(0,t.jsx)("span",{className:"payment-tag",children:"Tranche 1 · Acompte (50%)"}),(0,t.jsx)("span",{className:`payment-status ${R?.status==="verified"?"paid":"waiting"}`,children:R?.status==="verified"?"Payé":R?.status==="submitted"?"En attente":"À créer"})]}),(0,t.jsx)("div",{className:"payment-amount",children:o(R?.amount??m.deposit_amount??Number(m.amount??0)/2)}),(0,t.jsx)("div",{className:"payment-desc",children:R?.status==="verified"?`R\xe9gl\xe9 le ${s(R.reviewed_at??R.created_at)}`:R?"En attente de vérification par l'atelier":"Sera créée automatiquement après validation du devis"})]}),(0,t.jsxs)("div",{className:"payment-card",children:[(0,t.jsxs)("div",{className:"payment-top",children:[(0,t.jsx)("span",{className:"payment-tag",children:"Tranche 2 · Solde (50%)"}),(0,t.jsx)("span",{className:`payment-status ${D?.status==="verified"?"paid":"waiting"}`,children:D?.status==="verified"?"Payé":"En attente"})]}),(0,t.jsx)("div",{className:"payment-amount",children:o(D?.amount??m.balance_amount??Number(m.amount??0)/2)}),(0,t.jsx)("div",{className:"payment-desc",children:D?.status==="verified"?`R\xe9gl\xe9 le ${s(D.reviewed_at??D.created_at)}`:"Exigible à la livraison finale du dernier lot"})]})]})]}),M&&(0,t.jsxs)("div",{className:"action-bar",children:[(0,t.jsxs)("div",{style:{flex:1},children:[(0,t.jsx)("div",{style:{fontWeight:600,marginBottom:4},children:"En attente de validation"}),(0,t.jsx)("div",{style:{fontSize:13,color:"var(--text-muted)"},children:"Vous pouvez modifier ou envoyer cette demande de devis."})]}),(0,t.jsxs)("div",{style:{display:"flex",gap:10},children:[(0,t.jsx)(i.default,{href:`/mon-profil/devis/edit?id=${m.id}`,className:"btn-outline",children:"Modifier"}),(0,t.jsx)("button",{className:"btn-gold",onClick:async()=>{try{await n.authAPI.put(`/quotes/${m.id}`,{status:"pending"}),u({...m,status:"pending"})}catch{}},children:"Envoyer"})]})]}),(0,t.jsxs)("section",{style:{marginTop:32},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"baseline",gap:10,marginBottom:16},children:[(0,t.jsx)("h2",{style:{fontSize:18,fontWeight:600},children:"Commandes liées à ce devis"}),(0,t.jsxs)("span",{style:{fontSize:13,color:"var(--text-muted)"},children:[h.length," commande",h.length>1?"s":""]})]}),0===h.length&&(0,t.jsx)("div",{style:{color:"var(--text-muted)",fontSize:14,padding:"32px 0"},children:"Aucune commande associée à ce devis."}),(0,t.jsx)("div",{className:"order-list",children:h.map(e=>{let a=A.has(e.id),r=function(e){if(!e)return 0;if("Livrée"===e)return 5;let t=n.STATUTS_PRODUCTION.indexOf(e);return t>=0&&t<4?t+1:0}(e.statut_production),i=[...e.notes?[{type:"info",text:e.notes}]:[]],d=(m?.notifications??[]).filter(e=>"delay"===e.type||"error"===e.type),l=(m?.notifications??[]).filter(e=>"info"===e.type);return(0,t.jsxs)("div",{className:"order-card",children:[(0,t.jsxs)("button",{className:"order-summary",onClick:()=>q(e.id),children:[(0,t.jsxs)("div",{className:"order-summary-left",children:[(0,t.jsx)("div",{className:"order-icon",children:"📋"}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"order-title",children:["Commande #",e.numero]}),(0,t.jsxs)("div",{className:"order-sub",children:[e.quantite," pièces · créée le ",s(e.date_commande)]})]})]}),(0,t.jsxs)("div",{className:"order-summary-right",children:[i.length>0&&(0,t.jsx)("span",{className:"alert-badge",children:i.length}),(0,t.jsx)("div",{className:"mini-progress",children:[0,1,2,3,4].map(e=>(0,t.jsx)("div",{className:`mini-step ${e<r?"done":e===r?"current":""}`},e))}),(0,t.jsx)("div",{className:`chevron ${a?"open":""}`,children:"›"})]})]}),a&&(0,t.jsxs)("div",{className:"order-body",children:[(0,t.jsx)("div",{className:"stepper",children:p.map((e,a)=>{let i="pending";return a<r?i="done":a===r&&(i="current"),(0,t.jsxs)("div",{className:`step ${i}`,children:[(0,t.jsxs)("div",{className:"step-dot",children:["done"===i&&(0,t.jsx)("span",{className:"step-check",children:"✓"}),"current"===i&&(0,t.jsx)("span",{className:"step-pulse"})]}),(0,t.jsx)("div",{className:"step-label",children:e}),a<p.length-1&&(0,t.jsx)("div",{className:`step-line ${a<r?"done":""}`})]},a)})}),(0,t.jsxs)("div",{className:"panel",style:{marginBottom:20},children:[(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Étapes à valider"}),(0,t.jsxs)("span",{className:"hint",children:[E.filter(e=>"action"===e.state).length," en attente de votre validation"]})]}),(0,t.jsx)("div",{className:"checkpoint-list",children:E.map(e=>(0,t.jsxs)("div",{className:`checkpoint-item ${e.state}`,children:[(0,t.jsxs)("div",{className:"cp-marker",children:["done"===e.state&&"✓","action"===e.state&&(0,t.jsx)("span",{className:"dot-pulse"})]}),(0,t.jsxs)("div",{className:"cp-body",children:[(0,t.jsx)("div",{className:"cp-title",children:e.title}),(0,t.jsx)("div",{className:"cp-desc",children:e.desc}),e.meta&&(0,t.jsx)("div",{className:"cp-meta",children:e.meta}),"action"===e.state&&(0,t.jsxs)("div",{className:"cp-actions",children:[(0,t.jsx)("button",{className:"btn-sm-gold",children:"Valider cette étape"}),(0,t.jsx)("button",{className:"btn-sm-outline",children:"Signaler un problème"})]})]})]},e.id))})]}),(0,t.jsxs)("div",{className:"highlights-grid",children:[(0,t.jsxs)("div",{className:"highlight-panel warn",children:[(0,t.jsx)("div",{className:"highlight-head",children:"⚠ Points d'attention"}),0===d.length?(0,t.jsx)("div",{className:"highlight-empty",children:"Aucun point d'attention"}):(0,t.jsx)("ul",{children:d.map((e,a)=>(0,t.jsx)("li",{children:e.message},a))})]}),(0,t.jsxs)("div",{className:"highlight-panel good",children:[(0,t.jsx)("div",{className:"highlight-head",children:"✓ Avancées"}),0===l.length&&0===i.length?(0,t.jsx)("div",{className:"highlight-empty",children:"Aucune avancée signalée"}):(0,t.jsxs)("ul",{children:[l.map((e,a)=>(0,t.jsx)("li",{children:e.message},`q-${a}`)),i.map((e,a)=>(0,t.jsx)("li",{children:e.text},`c-${a}`))]})]})]}),(0,t.jsxs)("div",{className:"panel",style:{marginBottom:20},children:[(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Ajouts demandés"}),(0,t.jsxs)("span",{className:"hint",children:["+",W.toLocaleString("fr-MG")," Ar au total"]})]}),(0,t.jsxs)("div",{children:[L.map(e=>(0,t.jsxs)("div",{className:"addon-item",children:[(0,t.jsxs)("div",{className:"addon-left",children:[(0,t.jsx)("b",{children:e.title}),(0,t.jsx)("p",{children:e.desc})]}),(0,t.jsxs)("div",{className:"addon-right",children:[(0,t.jsxs)("span",{className:"addon-price",children:["+",e.price.toLocaleString("fr-MG")," Ar"]}),(0,t.jsx)("span",{className:`addon-status ${e.status}`,children:"included"===e.status?"Inclus au total":"En attente de chiffrage"})]})]},e.id)),(0,t.jsxs)("div",{className:"addon-total",children:[(0,t.jsx)("span",{children:"Total des ajouts validés, ajouté au solde de livraison"}),(0,t.jsxs)("b",{children:["+",W.toLocaleString("fr-MG")," Ar"]})]}),(0,t.jsx)("button",{className:"addon-add-btn",children:"+ Demander un ajout"})]})]}),(0,t.jsxs)("div",{className:"panel",style:{marginBottom:20},children:[(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Retour de l'atelier"}),(0,t.jsxs)("span",{className:"hint",children:[B.length," message",B.length>1?"s":""]})]}),(0,t.jsx)("div",{children:B.map(e=>(0,t.jsxs)("div",{className:"feedback-item",children:[(0,t.jsx)("div",{className:"fb-avatar",children:e.avatar}),(0,t.jsxs)("div",{className:"fb-body",children:[(0,t.jsxs)("div",{className:"fb-top",children:[(0,t.jsx)("span",{className:"fb-name",children:e.name}),(0,t.jsx)("span",{className:"fb-date",children:e.date})]}),(0,t.jsx)("p",{className:"fb-text",children:e.text})]})]},e.id))})]}),(0,t.jsxs)("div",{className:"comparison-table",children:[(0,t.jsxs)("div",{className:"comp-header",children:[(0,t.jsx)("div",{children:"Devis"}),(0,t.jsx)("div",{children:"Bon de commande"}),(0,t.jsx)("div",{children:"Livraison"})]}),(0,t.jsxs)("div",{className:"comp-row",children:[(0,t.jsxs)("div",{children:[e.quantite," pièces"]}),(0,t.jsxs)("div",{children:[e.quantite," pièces"]}),(0,t.jsxs)("div",{children:[e.pieces_produites??"—"," pièces"]})]}),(0,t.jsxs)("div",{className:"comp-row",children:[(0,t.jsx)("div",{children:o(e.prix_unitaire)}),(0,t.jsx)("div",{children:o(e.prix_unitaire)}),(0,t.jsx)("div",{children:o(e.total)})]}),(0,t.jsxs)("div",{className:"comp-row",children:[(0,t.jsx)("div",{children:s(m.created_at)}),(0,t.jsx)("div",{children:s(e.date_commande)}),(0,t.jsx)("div",{children:s(e.date_livraison_prevue)})]})]})]})]},e.id)})})]})]}),(0,t.jsx)("footer",{style:{textAlign:"center",padding:"32px 24px",color:"var(--text-faint)",fontSize:13,borderTop:"1px solid var(--card-border)"},children:"JMR Textile © 2026"})]})]})}function m(){return(0,t.jsx)(a.Suspense,{fallback:(0,t.jsx)("div",{style:{minHeight:"100vh",background:"#1e2a38",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,t.jsx)("div",{style:{color:"#e5ad46",fontSize:18},children:"Chargement…"})}),children:(0,t.jsx)(x,{})})}let g=`
  :root {
    --bg-deep: #1e2a38;
    --bg-panel: #141e2e;
    --card: #1b263c;
    --card-border: #2a3a4a;
    --gold: #e5ad46;
    --gold-light: #eccc90;
    --gold-dim: #8c7038;
    --text-cream: #f3efe4;
    --text-muted: #8b93a7;
    --text-faint: #5c6478;
    --input-bg: #141e2e;
    --warn: #e08b52;
    --good: #5cb87d;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .status-pill {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .status-pill[data-status="draft"] { background: rgba(139,147,167,0.2); color: var(--text-muted); }
  .status-pill[data-status="pending"] { background: rgba(229,173,70,0.15); color: var(--gold); }
  .status-pill[data-status="accepted"] { background: rgba(92,184,125,0.15); color: var(--good); }
  .status-pill[data-status="refused"] { background: rgba(224,139,82,0.15); color: var(--warn); }
  .status-pill[data-status="expired"] { background: rgba(92,100,120,0.2); color: var(--text-faint); }
  .status-pill[data-status="production"] { background: rgba(229,173,70,0.15); color: var(--gold); }
  .status-pill[data-status="completed"] { background: rgba(92,184,125,0.15); color: var(--good); }

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(229,173,70,0.08);
    border: 1px solid rgba(229,173,70,0.2);
    border-radius: 12px;
    padding: 16px 20px;
    gap: 16px;
    flex-wrap: wrap;
  }

  .btn-outline {
    padding: 8px 18px;
    border: 1px solid var(--card-border);
    border-radius: 8px;
    color: var(--text-cream);
    background: transparent;
    font-size: 14px;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }
  .btn-outline:hover { border-color: var(--text-muted); }

  .btn-gold {
    padding: 8px 18px;
    border: 1px solid var(--gold);
    border-radius: 8px;
    background: var(--gold);
    color: var(--bg-deep);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
  }
  .btn-gold:hover { background: var(--gold-light); }

  .order-list { display: flex; flex-direction: column; gap: 12px; }

  .order-card {
    background: var(--card);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    overflow: hidden;
  }

  .order-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 16px 20px;
    background: transparent;
    border: none;
    color: var(--text-cream);
    cursor: pointer;
    text-align: left;
  }
  .order-summary:hover { background: rgba(255,255,255,0.02); }

  .order-summary-left { display: flex; align-items: center; gap: 14px; }
  .order-icon { font-size: 24px; }
  .order-title { font-weight: 600; font-size: 15px; }
  .order-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

  .order-summary-right { display: flex; align-items: center; gap: 14px; }

  .alert-badge {
    background: var(--warn);
    color: var(--bg-deep);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 999px;
  }

  .mini-progress { display: flex; gap: 4px; }
  .mini-step {
    width: 18px;
    height: 4px;
    border-radius: 2px;
    background: var(--card-border);
  }
  .mini-step.done { background: var(--gold-dim); }
  .mini-step.current {
    background: var(--gold-light);
    box-shadow: 0 0 6px var(--gold-light);
  }

  .chevron {
    font-size: 20px;
    color: var(--text-muted);
    transition: transform 0.2s;
  }
  .chevron.open { transform: rotate(90deg); }

  .order-body { padding: 0 20px 20px; }

  /* Stepper */
  .stepper {
    display: flex;
    align-items: flex-start;
    position: relative;
    margin-bottom: 24px;
    padding-top: 8px;
  }
  .step {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .step-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }
  .step.pending .step-dot { background: var(--card-border); }
  .step.done .step-dot { background: var(--good); }
  .step.current .step-dot { background: var(--gold); }

  .step-check { font-size: 11px; color: #fff; font-weight: 700; }
  .step-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bg-deep);
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }

  .step-label {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 6px;
    text-align: center;
  }
  .step.done .step-label { color: var(--good); }
  .step.current .step-label { color: var(--gold); font-weight: 600; }

  .step-line {
    position: absolute;
    top: 10px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: var(--card-border);
    z-index: 0;
  }
  .step-line.done { background: var(--good); }
  .step:last-child .step-line { display: none; }

  /* Panel */
  .panel {
    background: var(--bg-panel);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 16px 20px;
  }
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .panel-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-cream);
  }
  .hint {
    font-size: 12px;
    color: var(--text-muted);
  }

  /* Highlights */
  .highlights-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
  .highlight-panel {
    background: var(--bg-panel);
    border-radius: 10px;
    padding: 14px 16px;
    border: 1px solid var(--card-border);
  }
  .highlight-panel.warn { border-left: 3px solid var(--warn); }
  .highlight-panel.good { border-left: 3px solid var(--good); }
  .highlight-head {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--text-cream);
  }
  .highlight-empty {
    font-size: 12px;
    color: var(--text-faint);
  }
  .highlight-panel ul {
    list-style: none;
    padding: 0;
  }
  .highlight-panel li {
    font-size: 12px;
    color: var(--text-muted);
    padding: 3px 0;
  }

  /* Quote Confirm Panel */
  .quote-confirm {
    background: rgba(92,184,125,0.08);
    border: 1px solid rgba(92,184,125,0.25);
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 24px;
  }
  .quote-confirm-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    font-size: 15px;
    font-weight: 600;
    color: var(--good);
  }
  .quote-confirm-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--good);
    color: var(--bg-deep);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
  }
  .quote-figures {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 14px;
  }
  .quote-figures figure {
    text-align: center;
  }
  .quote-figures figure b {
    display: block;
    font-size: 16px;
    color: var(--text-cream);
    margin-bottom: 4px;
  }
  .quote-figures figure span {
    font-size: 11px;
    color: var(--text-muted);
  }
  .quote-confirm-note {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.6;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;
    padding: 10px 14px;
  }
  .quote-confirm-note b { color: var(--text-cream); }

  /* Payment Grid */
  .payment-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .payment-card {
    background: var(--card);
    border: 1px solid var(--card-border);
    border-radius: 10px;
    padding: 14px 16px;
  }
  .payment-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  .payment-tag {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-cream);
  }
  .payment-status {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
  }
  .payment-status.paid { background: rgba(92,184,125,0.15); color: var(--good); }
  .payment-status.waiting { background: rgba(229,173,70,0.15); color: var(--gold); }
  .payment-amount {
    font-size: 18px;
    font-weight: 700;
    color: var(--gold);
    margin-bottom: 4px;
  }
  .payment-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* Checkpoints */
  .checkpoint-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .checkpoint-item {
    display: flex;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--card);
    border: 1px solid var(--card-border);
  }
  .checkpoint-item.done { border-left: 3px solid var(--good); }
  .checkpoint-item.action { border-left: 3px solid var(--gold); }
  .checkpoint-item.upcoming { border-left: 3px solid var(--card-border); opacity: 0.7; }
  .cp-marker {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 700;
  }
  .checkpoint-item.done .cp-marker { background: var(--good); color: #fff; }
  .checkpoint-item.action .cp-marker { background: var(--gold); color: var(--bg-deep); }
  .checkpoint-item.upcoming .cp-marker { background: var(--card-border); color: var(--text-faint); }
  .cp-body { flex: 1; min-width: 0; }
  .cp-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-cream);
    margin-bottom: 3px;
  }
  .cp-desc {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
    margin-bottom: 6px;
  }
  .cp-meta {
    font-size: 11px;
    color: var(--text-faint);
  }
  .cp-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .btn-sm-gold {
    padding: 5px 14px;
    border: 1px solid var(--gold);
    border-radius: 6px;
    background: var(--gold);
    color: var(--bg-deep);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-sm-gold:hover { background: var(--gold-light); }
  .btn-sm-outline {
    padding: 5px 14px;
    border: 1px solid var(--card-border);
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    font-size: 12px;
    cursor: pointer;
  }
  .btn-sm-outline:hover { border-color: var(--text-muted); }
  .dot-pulse {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gold);
    animation: pulse 1.5s infinite;
    display: inline-block;
  }

  /* Addons */
  .addon-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 10px 0;
    border-bottom: 1px solid var(--card-border);
  }
  .addon-item:last-of-type { border-bottom: none; }
  .addon-left b {
    font-size: 13px;
    color: var(--text-cream);
    display: block;
    margin-bottom: 2px;
  }
  .addon-left p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
  }
  .addon-right {
    text-align: right;
    flex-shrink: 0;
  }
  .addon-price {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--gold);
    margin-bottom: 2px;
  }
  .addon-status {
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 999px;
    display: inline-block;
  }
  .addon-status.included { background: rgba(92,184,125,0.15); color: var(--good); }
  .addon-status.pending { background: rgba(229,173,70,0.15); color: var(--gold); }
  .addon-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 8px;
    border-top: 1px solid var(--card-border);
    margin-top: 8px;
  }
  .addon-total span {
    font-size: 12px;
    color: var(--text-muted);
  }
  .addon-total b {
    font-size: 14px;
    color: var(--gold);
  }
  .addon-add-btn {
    width: 100%;
    padding: 10px;
    border: 1px dashed var(--card-border);
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    cursor: pointer;
    margin-top: 8px;
  }
  .addon-add-btn:hover { border-color: var(--gold-dim); color: var(--gold-dim); }

  /* Feedback with avatars */
  .feedback-item {
    display: flex;
    gap: 14px;
    padding: 10px 0;
    border-bottom: 1px solid var(--card-border);
  }
  .feedback-item:last-child { border-bottom: none; }
  .fb-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gold-dim);
    color: var(--text-cream);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .fb-body { flex: 1; min-width: 0; }
  .fb-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }
  .fb-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-cream);
  }
  .fb-date {
    font-size: 11px;
    color: var(--text-faint);
  }
  .fb-text {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
  }

  /* Comparison table */
  .comparison-table {
    background: var(--bg-panel);
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--card-border);
  }
  .comp-header {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    background: rgba(229,173,70,0.08);
    font-size: 12px;
    font-weight: 600;
    color: var(--gold-dim);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .comp-header > div,
  .comp-row > div {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--text-cream);
  }
  .comp-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid var(--card-border);
  }
  .comp-row:nth-child(odd) {
    background: rgba(255,255,255,0.015);
  }
`;e.s(["default",()=>m])}]);