(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,14739,e=>{"use strict";var t=e.i(43476),a=e.i(71645),r=e.i(18566),i=e.i(22016),s=e.i(34461),n=e.i(7767);function o(e){if(!e)return"—";try{return new Date(e).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}catch{return e}}function d(e){if(null==e)return"—";let t="string"==typeof e?parseFloat(e):e;return isNaN(t)?String(e):t.toLocaleString("fr-MA")+" Ar"}function l(e){return String(e).substring(0,8)}let c={draft:"Brouillon",pending:"En attente",accepted:"Acceptée",refused:"Refusée",expired:"Expirée",production:"En production",completed:"Terminée"},p=["Envoyé","Accepté","Production","Livraison","Terminé"];function x(){let e=(0,r.useRouter)(),x=(0,r.useSearchParams)().get("id"),[g,m]=(0,a.useState)(null),[u,f]=(0,a.useState)([]),[v,b]=(0,a.useState)([]),[j,w]=(0,a.useState)([]),[y,k]=(0,a.useState)([]),[N,z]=(0,a.useState)(!0),[L,A]=(0,a.useState)(null),[M,S]=(0,a.useState)(new Set),[_,q]=(0,a.useState)(!1),[C,B]=(0,a.useState)(!1),[P,$]=(0,a.useState)(!1);(0,a.useEffect)(()=>{if(!(0,s.getUser)())return void e.replace(`/mon-profil?next=/mon-profil/devis/detail?id=${x}`);if(!x){A("Aucun ID de devis fourni."),z(!1);return}(async()=>{try{if(!(0,s.getToken)())return void e.replace(`/mon-profil?next=/mon-profil/devis/detail?id=${x}`);let[t,a]=await Promise.all([n.authAPI.get(`/quotes/${x}`),n.authAPI.get("/commandes/")]);m(t.data??t);let r=(a.data??a).filter(e=>e.cotation_id===x);f(r),r.length>0&&S(new Set([r[0].id]));try{let[e,t,a]=await Promise.all([n.checkpointsAPI.list(x).catch(()=>({data:[]})),n.addonsAPI.list(x).catch(()=>({data:[],total_validated:0})),n.paymentsAPI.list(x).catch(()=>({data:[],total_verified:0}))]);b(e.data??[]),w(t.data??[]),k(a.data??[])}catch{}}catch{A("Impossible de charger les données du devis.")}finally{z(!1)}})()},[x,e]);let T=(0,a.useCallback)(e=>{S(t=>{let a=new Set(t);return a.has(e)?a.delete(e):a.add(e),a})},[]),W=g&&["accepted","production","completed"].includes(g.status??""),E=g&&Number(g.amount??0)>0,V=g?.status==="draft"||g?.status==="pending",H=[{id:"cp1",title:"Prototype validé",desc:"Le modèle final a été approuvé avant lancement de la série.",meta:"Validé par vous le "+o(g?.created_at),state:"done"},{id:"cp2",title:"Premier lot — contrôle qualité",desc:"L'atelier a terminé le contrôle qualité du premier lot et attend votre retour.",meta:"",state:"action"},{id:"cp3",title:"Lot complet avant expédition",desc:"Vérification finale des pièces avant mise en livraison.",meta:"À venir",state:"upcoming"}],I=v.length>0?v.map(e=>({id:e.id,title:e.title,desc:e.description??"",meta:e.validated_at?`Valid\xe9 par ${e.validated_by??"—"} le ${o(e.validated_at)}`:"upcoming"===e.status?"À venir":"",state:"done"===e.status?"done":"upcoming"===e.status?"upcoming":"action"})):H,R=j.length>0?j.map(e=>({id:e.id,title:e.title,desc:e.description??"",price:Number(e.price??0),status:e.status})):[{id:"a1",title:"Bouton doré supplémentaire",desc:"Ajout d'un second bouton en laiton doré.",price:15e3,status:"included"},{id:"a2",title:"Broderie motif floral",desc:"Petit motif brodé main sur la poche.",price:42e3,status:"pending"}],D=y.find(e=>"deposit"===e.phase),Z=y.find(e=>"balance"===e.phase);if(N)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:h}),(0,t.jsx)("div",{className:"loading-screen",children:(0,t.jsx)("div",{className:"loading-text",children:"Chargement…"})})]});if(L)return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:h}),(0,t.jsxs)("div",{className:"loading-screen",children:[(0,t.jsx)("div",{className:"error-text",children:L}),(0,t.jsx)(i.default,{href:"/mon-profil/devis",className:"back-link",children:"← Retour à mes devis"})]})]});if(!g)return null;let F=R.reduce((e,t)=>e+("included"===t.status?t.price:0),0);R.filter(e=>"pending"===e.status).length;let O=Z?.amount??g.balance_amount??Number(g.amount??0)/2;return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("style",{children:h}),(0,t.jsxs)("div",{className:"page",children:[(0,t.jsx)("header",{className:"site-header",children:(0,t.jsx)("div",{className:"container site-nav",children:(0,t.jsxs)(i.default,{href:"/",className:"logo",children:[(0,t.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",children:[(0,t.jsx)("path",{d:"M6 6L18 18M18 6L6 18",stroke:"#e5ad46",strokeWidth:"1.6",strokeLinecap:"round"}),(0,t.jsx)("circle",{cx:"6",cy:"6",r:"1.6",fill:"#e5ad46"}),(0,t.jsx)("circle",{cx:"6",cy:"18",r:"1.6",fill:"#e5ad46"})]}),"JMR TEXTILE"]})})}),(0,t.jsxs)("main",{className:"container",children:[(0,t.jsxs)("div",{className:"breadcrumb",children:[(0,t.jsx)(i.default,{href:"/mon-profil",children:"Tableau de bord"})," / ",(0,t.jsx)(i.default,{href:"/mon-profil/devis",children:"Mes devis"})," / ",(0,t.jsxs)("span",{children:["Devis #",l(g.id)]})]}),(0,t.jsxs)("div",{className:"page-head",children:[(0,t.jsxs)("div",{className:"head-left",children:[(0,t.jsx)("div",{className:"eyebrow",children:"Suivi de devis"}),(0,t.jsx)("h1",{children:g.name||g.category||"Devis"}),(0,t.jsxs)("div",{className:"ref",children:["Réf. ",(0,t.jsxs)("b",{children:["#",l(g.id)]})," · envoyé le ",o(g.created_at)]})]}),(0,t.jsxs)("span",{className:`status-pill-lg ${g.status}`,children:[(0,t.jsx)("span",{className:"dot"}),c[g.status??""]??g.status]})]}),V&&(0,t.jsxs)("div",{className:"action-bar",children:[(0,t.jsxs)("div",{className:"msg",children:[(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.6",children:(0,t.jsx)("path",{d:"M12 8V13M12 16H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"})}),"Ce devis est encore ",(0,t.jsx)("b",{children:"en brouillon"})," — vous pouvez le modifier avant de l'envoyer."]}),(0,t.jsxs)("div",{className:"action-buttons",children:[(0,t.jsxs)(i.default,{href:`/mon-profil/devis/edit?id=${g.id}`,className:"btn-outline",children:[(0,t.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",children:[(0,t.jsx)("path",{d:"M11 4H6A2 2 0 004 6V18A2 2 0 006 20H18A2 2 0 0020 18V13"}),(0,t.jsx)("path",{d:"M18.5 2.5A2.1 2.1 0 0121.5 5.5L12 15L8 16L9 12L18.5 2.5Z"})]}),"Modifier"]}),(0,t.jsxs)("button",{className:"btn-gold",onClick:async()=>{try{await n.authAPI.put(`/quotes/${g.id}`,{status:"pending"}),m({...g,status:"pending"})}catch{}},children:[(0,t.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",children:[(0,t.jsx)("path",{d:"M22 2L11 13"}),(0,t.jsx)("path",{d:"M22 2L15 22L11 13L2 9L22 2Z"})]}),"Envoyer le devis"]})]})]}),W&&(0,t.jsxs)("div",{className:"quote-confirm",children:[(0,t.jsxs)("div",{className:"quote-confirm-top",children:[(0,t.jsx)("span",{className:"icon-box",children:(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",strokeWidth:"2",children:(0,t.jsx)("path",{d:"M4 12L9 17L20 6"})})}),(0,t.jsx)("span",{children:"Prix validé — commande définitive"})]}),(0,t.jsxs)("div",{className:"quote-figures",children:[(0,t.jsxs)("div",{className:"quote-figure",children:[(0,t.jsx)("b",{children:d(g.amount)}),(0,t.jsx)("span",{children:"Montant total chiffré"})]}),(0,t.jsxs)("div",{className:"quote-figure",children:[(0,t.jsx)("b",{children:o(g.date_livraison_prevue)}),(0,t.jsx)("span",{children:"Date de rendu estimée"})]}),(0,t.jsxs)("div",{className:"quote-figure",children:[(0,t.jsx)("b",{children:o(g.validated_at??g.created_at)}),(0,t.jsxs)("span",{children:["Validé par ",g.validated_by??"—"]})]})]}),(0,t.jsxs)("div",{className:"quote-confirm-note",children:["Chiffré par l'atelier le ",(0,t.jsx)("b",{children:o(g.created_at)}),", puis validé par vos soins. L'acompte de la ",(0,t.jsx)("b",{children:"tranche 1"})," a déclenché le lancement de la production."]})]}),E&&(0,t.jsxs)("div",{className:"panel",children:[(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Paiement"}),(0,t.jsx)("span",{className:"hint",children:"2 tranches"})]}),(0,t.jsxs)("div",{className:"payment-grid",children:[(0,t.jsxs)("div",{className:"payment-card",children:[(0,t.jsxs)("div",{className:"payment-card-top",children:[(0,t.jsx)("span",{className:"payment-tag",children:"Tranche 1 · Acompte (50%)"}),(0,t.jsx)("span",{className:`payment-status ${D?.status==="verified"?"paid":"waiting"}`,children:D?.status==="verified"?"Payé":D?.status==="submitted"?"En attente":"À créer"})]}),(0,t.jsx)("div",{className:"payment-amount",children:d(D?.amount??g.deposit_amount??Number(g.amount??0)/2)}),(0,t.jsx)("div",{className:"payment-desc",children:D?.status==="verified"?`R\xe9gl\xe9 le ${o(D.reviewed_at??D.created_at)}`:D?"En attente de vérification par l'atelier":"Sera créée automatiquement après validation du devis"})]}),(0,t.jsxs)("div",{className:"payment-card",children:[(0,t.jsxs)("div",{className:"payment-card-top",children:[(0,t.jsx)("span",{className:"payment-tag",children:"Tranche 2 · Solde"}),(0,t.jsx)("span",{className:`payment-status ${Z?.status==="verified"?"paid":"waiting"}`,children:Z?.status==="verified"?"Payé":"En attente"})]}),(0,t.jsx)("div",{className:"payment-amount",children:d(Z?.amount??O)}),(0,t.jsx)("div",{className:"payment-desc",children:Z?.status==="verified"?`R\xe9gl\xe9 le ${o(Z.reviewed_at??Z.created_at)}`:F>0?`Solde de base + ${d(F)} d'ajouts valid\xe9s`:"Exigible à la livraison finale du dernier lot"})]})]})]}),(0,t.jsxs)("div",{className:"section-head",children:[(0,t.jsx)("h2",{children:"Commandes liées à ce devis"}),(0,t.jsxs)("span",{className:"hint",children:[u.length," commande",u.length>1?"s":""]})]}),0===u.length&&(0,t.jsx)("div",{className:"empty-msg",children:"Aucune commande associée à ce devis."}),u.map(e=>{let a=M.has(e.id),r=function(e){if(!e)return 0;if("Livrée"===e)return 5;let t=n.STATUTS_PRODUCTION.indexOf(e);return t>=0&&t<4?t+1:0}(e.statut_production),i=[...e.notes?[{type:"info",text:e.notes}]:[]],s=(g?.notifications??[]).filter(e=>"delay"===e.type||"error"===e.type),l=(g?.notifications??[]).filter(e=>"info"===e.type);return(0,t.jsxs)("div",{className:`order-card ${a?"open":""}`,children:[(0,t.jsxs)("div",{className:"order-summary",onClick:()=>T(e.id),children:[(0,t.jsxs)("div",{className:"order-summary-left",children:[(0,t.jsx)("span",{className:"order-icon",children:(0,t.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",strokeWidth:"1.6",children:[(0,t.jsx)("rect",{x:"4",y:"7",width:"16",height:"13",rx:"1.5"}),(0,t.jsx)("path",{d:"M8 7V5A2 2 0 0110 3H14A2 2 0 0116 5V7"})]})}),(0,t.jsxs)("div",{children:[(0,t.jsxs)("div",{className:"order-title",children:["Commande #",e.numero]}),(0,t.jsxs)("div",{className:"order-sub",children:[e.quantite," pièces · créée le ",o(e.date_commande)]})]})]}),(0,t.jsxs)("div",{className:"order-summary-right",children:[i.length>0&&(0,t.jsxs)("span",{className:"alert-count",children:[(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:(0,t.jsx)("path",{d:"M12 8V13M12 16.5H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"})}),i.length," alerte",i.length>1?"s":""]}),(0,t.jsxs)("div",{className:"mini-progress",children:[(0,t.jsx)("div",{className:"segs",children:[0,1,2,3,4].map(e=>(0,t.jsx)("span",{className:`seg ${e<r?"filled":e===r?"current":""}`},e))}),(0,t.jsx)("span",{className:"stage-label",children:p[r]??"—"})]}),(0,t.jsx)("svg",{className:`order-chevron ${a?"open":""}`,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:(0,t.jsx)("path",{d:"M6 9L12 15L18 9"})})]})]}),a&&(0,t.jsxs)("div",{className:"order-body",children:[(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Avancement"}),(0,t.jsxs)("span",{className:"hint",children:["Mis à jour le ",o(e.updated_at??e.date_commande)]})]}),(0,t.jsxs)("div",{className:"stepper",children:[(0,t.jsx)("div",{className:"stepper-line"}),(0,t.jsx)("div",{className:"stepper-line-fill",style:{width:`${Math.min(100,r/4*100)}%`}}),p.map((e,a)=>{let i="upcoming";return a<r?i="done":a===r&&(i="current"),(0,t.jsxs)("div",{className:`step ${i}`,children:[(0,t.jsxs)("div",{className:"step-dot",children:["done"===i&&(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",strokeWidth:"2.4",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M4 12L9 17L20 6"})}),"current"===i&&(0,t.jsx)("span",{className:"pulse"})]}),(0,t.jsx)("div",{className:"step-label",children:e})]},a)})]}),(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Étapes à valider"}),(0,t.jsxs)("span",{className:"hint",children:[I.filter(e=>"action"===e.state).length," en attente"]})]}),(0,t.jsx)("div",{className:"checkpoint-list",children:I.map(e=>(0,t.jsxs)("div",{className:`checkpoint-item ${e.state}`,children:[(0,t.jsxs)("div",{className:"cp-marker",children:["done"===e.state&&(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",strokeWidth:"2.6",strokeLinecap:"round",strokeLinejoin:"round",children:(0,t.jsx)("path",{d:"M4 12L9 17L20 6"})}),"action"===e.state&&(0,t.jsx)("span",{className:"dot-pulse"})]}),(0,t.jsxs)("div",{className:"cp-body",children:[(0,t.jsx)("div",{className:"cp-title",children:e.title}),(0,t.jsx)("div",{className:"cp-desc",children:e.desc}),e.meta&&(0,t.jsx)("div",{className:"cp-meta",children:e.meta}),"action"===e.state&&(0,t.jsxs)("div",{className:"cp-actions",children:[(0,t.jsxs)("button",{className:"btn-sm-gold",children:[(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",children:(0,t.jsx)("path",{d:"M4 12L9 17L20 6"})}),"Valider"]}),(0,t.jsxs)("button",{className:"btn-sm-outline",children:[(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:(0,t.jsx)("path",{d:"M12 8V13M12 16.5H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"})}),"Signaler"]})]})]})]},e.id))}),(0,t.jsxs)("div",{className:"highlights-grid",children:[(0,t.jsxs)("div",{className:"hl-panel warn",children:[(0,t.jsxs)("div",{className:"hl-head",children:[(0,t.jsx)("span",{className:"icon-box",children:(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",strokeWidth:"1.8",children:(0,t.jsx)("path",{d:"M12 9V13M12 16.5H12.01M10.3 3.9L2.8 17A2 2 0 004.5 20H19.5A2 2 0 0021.2 17L13.7 3.9A2 2 0 0010.3 3.9Z"})})}),(0,t.jsx)("h4",{children:"Points d'attention"}),(0,t.jsx)("span",{children:s.length||0})]}),0===s.length?(0,t.jsx)("div",{className:"hl-empty",children:"Aucun point d'attention"}):(0,t.jsx)("ul",{children:s.map((e,a)=>(0,t.jsx)("li",{children:e.message},a))})]}),(0,t.jsxs)("div",{className:"hl-panel good",children:[(0,t.jsxs)("div",{className:"hl-head",children:[(0,t.jsx)("span",{className:"icon-box",children:(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",strokeWidth:"1.8",children:(0,t.jsx)("path",{d:"M4 12L9 17L20 6"})})}),(0,t.jsx)("h4",{children:"Avancées"}),(0,t.jsx)("span",{children:l.length||0})]}),0===l.length&&0===i.length?(0,t.jsx)("div",{className:"hl-empty",children:"Aucune avancée signalée"}):(0,t.jsxs)("ul",{children:[l.map((e,a)=>(0,t.jsx)("li",{children:e.message},`q-${a}`)),i.map((e,a)=>(0,t.jsx)("li",{children:e.text},`c-${a}`))]})]})]}),(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Ajouts demandés"}),(0,t.jsxs)("span",{className:"hint",children:["+",F.toLocaleString("fr-MA")," Ar au total"]})]}),(0,t.jsxs)("div",{className:"addon-section",children:[R.map(e=>(0,t.jsxs)("div",{className:"addon-item",children:[(0,t.jsxs)("div",{className:"addon-left",children:[(0,t.jsx)("b",{children:e.title}),(0,t.jsx)("p",{children:e.desc})]}),(0,t.jsxs)("div",{className:"addon-right",children:[(0,t.jsxs)("span",{className:"addon-price",children:["+",e.price.toLocaleString("fr-MA")," Ar"]}),(0,t.jsx)("span",{className:`addon-status ${e.status}`,children:"included"===e.status?"Inclus au total":"En attente de chiffrage"})]})]},e.id)),(0,t.jsxs)("div",{className:"addon-total",children:[(0,t.jsx)("span",{children:"Total des ajouts validés, ajouté au solde"}),(0,t.jsxs)("b",{children:["+",F.toLocaleString("fr-MA")," Ar"]})]}),(0,t.jsxs)("button",{className:"addon-add-btn",onClick:()=>$(!P),children:[(0,t.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",children:(0,t.jsx)("path",{d:"M12 5V19M5 12H19"})}),"Demander un ajout"]}),P&&(0,t.jsxs)("div",{className:"addon-form",children:[(0,t.jsx)("label",{children:"Décrivez ce que vous souhaitez ajouter ou modifier"}),(0,t.jsx)("textarea",{placeholder:"Ex. : Ajouter un motif brodé sur la manche gauche…"}),(0,t.jsx)("p",{className:"hint-sm",children:"L'atelier vous répondra avec un chiffrage avant de l'intégrer à la commande."}),(0,t.jsxs)("button",{className:"btn-sm-gold",children:[(0,t.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.4",children:[(0,t.jsx)("path",{d:"M22 2L11 13"}),(0,t.jsx)("path",{d:"M22 2L15 22L11 13L2 9L22 2Z"})]}),"Envoyer"]})]})]}),(0,t.jsxs)("div",{className:"panel-header",children:[(0,t.jsx)("h3",{children:"Comparatif devis · commande · livraison"}),(0,t.jsx)("span",{className:"hint",children:"Se complète automatiquement"})]}),(0,t.jsxs)("table",{className:"compare-table",children:[(0,t.jsx)("thead",{children:(0,t.jsxs)("tr",{children:[(0,t.jsx)("th",{}),(0,t.jsx)("th",{children:"Devis"}),(0,t.jsx)("th",{className:"col-active",children:"Bon de commande"}),(0,t.jsx)("th",{children:"Livraison"})]})}),(0,t.jsxs)("tbody",{children:[(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{children:"Quantité"}),(0,t.jsxs)("td",{children:[e.quantite," pièces"]}),(0,t.jsxs)("td",{className:"col-active",children:[e.quantite," pièces"]}),(0,t.jsxs)("td",{children:[e.pieces_produites??"—"," pièces"]})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{children:"Prix unitaire"}),(0,t.jsx)("td",{children:d(e.prix_unitaire)}),(0,t.jsx)("td",{className:"col-active",children:d(e.prix_unitaire)}),(0,t.jsx)("td",{children:d(e.total)})]}),(0,t.jsxs)("tr",{children:[(0,t.jsx)("td",{children:"Statut"}),(0,t.jsx)("td",{children:c[g.status??""]??g.status}),(0,t.jsx)("td",{className:"col-active",children:e.statut_production??"—"}),(0,t.jsx)("td",{children:e.date_livraison_reelle?o(e.date_livraison_reelle):"Non livré"})]})]})]})]})]},e.id)})]}),(0,t.jsx)("footer",{className:"site-footer",children:"JMR Textile © 2026 — Suivi mis à jour automatiquement par l'atelier"})]})]})}function g(){return(0,t.jsx)(a.Suspense,{fallback:(0,t.jsx)("div",{className:"loading-screen",children:(0,t.jsx)("div",{className:"loading-text",children:"Chargement…"})}),children:(0,t.jsx)(x,{})})}let h=`
:root {
  --bg-deep:#131c2b;
  --bg-panel:#0f1826;
  --card:#1b263c;
  --card-border:#2b3852;
  --input-bg:#141e30;
  --gold:#d9a548;
  --gold-light:#f0c674;
  --gold-dim:#8c7038;
  --text-cream:#f3efe4;
  --text-muted:#8b93a7;
  --text-faint:#5c6478;
  --warn:#e08b52;
  --good:#5cb87d;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg-deep);font-family:'Inter',system-ui,sans-serif;color:var(--text-cream);-webkit-font-smoothing:antialiased;}
a{color:inherit;}
.container{max-width:1100px;margin:0 auto;padding:0 40px;}
@media(max-width:760px){.container{padding:0 20px;}}

.loading-screen{min-height:100vh;background:var(--bg-deep);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;}
.loading-text{color:var(--gold);font-size:18px;}
.error-text{color:var(--warn);font-size:18px;}
.back-link{color:var(--gold);text-decoration:underline;font-size:16px;}

.site-header{border-bottom:1px solid rgba(255,255,255,0.06);}
.site-nav{display:flex;align-items:center;justify-content:space-between;padding:20px 0;}
.logo{display:flex;align-items:center;gap:10px;font-weight:600;font-size:20px;letter-spacing:0.08em;color:var(--gold-light);text-decoration:none;}
.logo svg{width:26px;height:26px;}

.breadcrumb{display:flex;align-items:center;gap:8px;padding:28px 0 0;font-size:12px;color:var(--text-faint);}
.breadcrumb a{color:var(--text-muted);text-decoration:none;}
.breadcrumb a:hover{color:var(--gold-light);}

.page-head{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:20px;padding:18px 0 36px;}
.head-left .eyebrow{font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:var(--gold-dim);margin-bottom:12px;display:flex;align-items:center;gap:10px;}
.head-left .eyebrow::before{content:"";width:22px;height:1px;background:var(--gold-dim);}
.head-left h1{font-weight:500;font-size:clamp(26px,3.4vw,34px);margin:0 0 10px;color:var(--gold-light);}
.head-left .ref{font-size:12px;color:var(--text-faint);}
.head-left .ref b{color:var(--text-muted);font-weight:500;}

.status-pill-lg{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:100px;background:var(--input-bg);border:1px solid var(--card-border);font-size:11.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);font-weight:600;}
.status-pill-lg .dot{width:8px;height:8px;border-radius:50%;background:var(--text-muted);}
.status-pill-lg.accepted .dot{background:var(--good);}
.status-pill-lg.production .dot{background:var(--gold);}
.status-pill-lg.completed .dot{background:var(--good);}
.status-pill-lg.draft .dot{background:var(--text-faint);}
.status-pill-lg.pending .dot{background:var(--gold);}

.action-bar{background:linear-gradient(135deg,rgba(217,165,72,0.08),rgba(217,165,72,0.02));border:1px solid rgba(217,165,72,0.22);border-radius:12px;padding:18px 24px;margin-bottom:36px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;}
.msg{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-muted);}
.msg svg{width:16px;height:16px;color:var(--gold-light);flex-shrink:0;}
.msg b{color:var(--text-cream);}
.action-buttons{display:flex;gap:10px;flex-wrap:wrap;}

.btn-gold{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:8px;border:none;background:linear-gradient(180deg,var(--gold-light),var(--gold));color:#1a1204;font-weight:700;font-size:11.5px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:filter .2s,transform .2s;white-space:nowrap;}
.btn-gold:hover{filter:brightness(1.06);transform:translateY(-1px);}
.btn-gold svg{width:14px;height:14px;}

.btn-outline{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:8px;border:1px solid var(--card-border);background:transparent;color:var(--text-muted);font-weight:600;font-size:11.5px;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;transition:all .2s;white-space:nowrap;text-decoration:none;}
.btn-outline:hover{border-color:var(--gold-dim);color:var(--gold-light);}
.btn-outline svg{width:14px;height:14px;}

.quote-confirm{background:rgba(92,184,125,0.09);border:1px solid rgba(92,184,125,0.28);border-radius:12px;padding:26px 28px;margin-bottom:24px;}
.quote-confirm-top{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.quote-confirm-top .icon-box{width:30px;height:30px;border-radius:8px;background:rgba(92,184,125,0.18);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.quote-confirm-top .icon-box svg{width:15px;height:15px;stroke:var(--good);}
.quote-confirm-top span{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:var(--good);font-weight:700;}
.quote-figures{display:flex;flex-wrap:wrap;gap:36px;margin-bottom:14px;}
.quote-figure b{display:block;font-weight:500;font-size:26px;color:var(--text-cream);}
.quote-figure span{font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);}
.quote-confirm-note{font-size:12.5px;color:var(--text-muted);line-height:1.6;}
.quote-confirm-note b{color:var(--text-cream);}

.panel{background:var(--card);border:1px solid var(--card-border);border-radius:12px;padding:30px 30px 18px;margin-bottom:24px;}
.panel-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;margin-bottom:24px;}
.panel-header h3{font-weight:500;font-size:19px;margin:0;color:var(--gold-light);}
.panel-header .hint{font-size:12px;color:var(--text-faint);}

.payment-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
@media(max-width:700px){.payment-grid{grid-template-columns:1fr;}}
.payment-card{background:var(--input-bg);border:1px solid var(--card-border);border-radius:10px;padding:22px;}
.payment-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.payment-tag{font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);font-weight:600;}
.payment-status{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:700;padding:4px 10px;border-radius:100px;letter-spacing:0.03em;}
.payment-status.paid{background:rgba(92,184,125,0.09);color:var(--good);border:1px solid rgba(92,184,125,0.28);}
.payment-status.waiting{background:var(--input-bg);color:var(--text-faint);border:1px solid var(--card-border);}
.payment-amount{font-weight:500;font-size:24px;color:var(--gold-light);margin-bottom:6px;}
.payment-desc{font-size:12px;color:var(--text-faint);}

.section-head{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin:8px 0 18px;}
.section-head h2{font-weight:500;font-size:21px;margin:0;color:var(--gold-light);}
.section-head .hint{font-size:12px;color:var(--text-faint);}
.empty-msg{color:var(--text-muted);font-size:14px;padding:32px 0;}

.order-card{background:var(--card);border:1px solid var(--card-border);border-radius:12px;margin-bottom:16px;overflow:hidden;}
.order-summary{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;cursor:pointer;flex-wrap:wrap;background:transparent;border:none;color:var(--text-cream);text-align:left;width:100%;}
.order-summary:hover{background:rgba(255,255,255,0.02);}
.order-summary-left{display:flex;align-items:center;gap:14px;min-width:0;}
.order-icon{width:38px;height:38px;border-radius:9px;background:rgba(217,165,72,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.order-icon svg{width:18px;height:18px;stroke:var(--gold-light);}
.order-title{font-size:14.5px;font-weight:700;color:var(--text-cream);}
.order-sub{font-size:11px;color:var(--text-faint);margin-top:3px;}
.order-summary-right{display:flex;align-items:center;gap:22px;flex-wrap:wrap;}
.alert-count{display:inline-flex;align-items:center;gap:5px;font-size:10.5px;color:var(--warn);font-weight:700;background:rgba(224,139,82,0.09);border:1px solid rgba(224,139,82,0.28);padding:5px 10px;border-radius:100px;}
.alert-count svg{width:11px;height:11px;}
.mini-progress{display:flex;align-items:center;gap:9px;}
.mini-progress .segs{display:flex;gap:3px;}
.mini-progress .seg{width:16px;height:4px;border-radius:2px;background:var(--card-border);}
.mini-progress .seg.filled{background:var(--gold-dim);}
.mini-progress .seg.current{background:var(--gold-light);box-shadow:0 0 6px rgba(240,198,116,0.5);}
.stage-label{font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-faint);font-weight:600;white-space:nowrap;}
.order-chevron{width:16px;height:16px;color:var(--text-faint);transition:transform .25s;flex-shrink:0;}
.order-chevron.open{transform:rotate(180deg);}

.order-body{padding:6px 24px 26px;border-top:1px solid rgba(255,255,255,0.06);}

.stepper{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:30px;position:relative;margin-bottom:24px;}
.step{display:flex;flex-direction:column;align-items:center;text-align:center;flex:1;position:relative;z-index:2;}
.step-dot{width:30px;height:30px;border-radius:50%;background:var(--input-bg);border:2px solid var(--card-border);display:flex;align-items:center;justify-content:center;margin-bottom:12px;}
.step.done .step-dot{background:var(--gold-dim);border-color:var(--gold-dim);}
.step.done .step-dot svg{width:13px;height:13px;stroke:#0f1826;}
.step.current .step-dot{background:var(--gold);border-color:var(--gold-light);box-shadow:0 0 0 5px rgba(217,165,72,0.15);}
.step.current .step-dot .pulse{width:8px;height:8px;border-radius:50%;background:#1a1204;animation:pulse 1.5s infinite;}
.step-label{font-size:10.5px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-faint);font-weight:600;}
.step.done .step-label,.step.current .step-label{color:var(--text-cream);}
.stepper-line{position:absolute;top:15px;left:5%;right:5%;height:2px;background:var(--card-border);z-index:1;}
.stepper-line-fill{position:absolute;top:15px;left:5%;height:2px;background:var(--gold-dim);z-index:1;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.3);}}

.checkpoint-list{display:flex;flex-direction:column;}
.checkpoint-item{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.06);}
.checkpoint-item:last-child{border-bottom:none;}
.cp-marker{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
.checkpoint-item.done .cp-marker{background:var(--gold-dim);}
.checkpoint-item.done .cp-marker svg{width:12px;height:12px;stroke:#0f1826;}
.checkpoint-item.action .cp-marker{background:rgba(224,139,82,0.18);border:1px solid rgba(224,139,82,0.28);}
.checkpoint-item.action .cp-marker .dot-pulse{width:7px;height:7px;border-radius:50%;background:var(--warn);animation:pulse 1.5s infinite;}
.checkpoint-item.upcoming .cp-marker{background:var(--input-bg);border:1px dashed var(--card-border);}
.checkpoint-item.upcoming{opacity:0.55;}
.cp-body{flex:1;min-width:0;}
.cp-title{font-size:13.5px;font-weight:700;color:var(--text-cream);margin-bottom:3px;}
.cp-desc{font-size:12.5px;color:var(--text-muted);line-height:1.5;margin-bottom:2px;}
.cp-meta{font-size:11px;color:var(--text-faint);}
.cp-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;}
.btn-sm-gold{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:7px;border:none;background:linear-gradient(180deg,var(--gold-light),var(--gold));color:#1a1204;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.btn-sm-gold:hover{filter:brightness(1.07);}
.btn-sm-gold svg{width:12px;height:12px;}
.btn-sm-outline{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:7px;border:1px solid var(--card-border);background:transparent;color:var(--text-muted);font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;transition:all .2s;}
.btn-sm-outline:hover{border-color:var(--warn);color:var(--warn);}
.btn-sm-outline svg{width:12px;height:12px;}

.highlights-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;}
@media(max-width:800px){.highlights-grid{grid-template-columns:1fr;}}
.hl-panel{border-radius:12px;padding:26px;border:1px solid;}
.hl-panel.warn{background:rgba(224,139,82,0.09);border-color:rgba(224,139,82,0.28);}
.hl-panel.good{background:rgba(92,184,125,0.09);border-color:rgba(92,184,125,0.28);}
.hl-head{display:flex;align-items:center;gap:10px;margin-bottom:18px;}
.hl-head .icon-box{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.hl-panel.warn .icon-box{background:rgba(224,139,82,0.18);}
.hl-panel.good .icon-box{background:rgba(92,184,125,0.18);}
.hl-head .icon-box svg{width:16px;height:16px;}
.hl-panel.warn .icon-box svg{stroke:var(--warn);}
.hl-panel.good .icon-box svg{stroke:var(--good);}
.hl-head h4{font-weight:500;font-size:17px;margin:0;}
.hl-panel.warn h4{color:var(--warn);}
.hl-panel.good h4{color:var(--good);}
.hl-head span{font-size:11px;color:var(--text-faint);margin-left:auto;}
.hl-empty{font-size:12px;color:var(--text-faint);}
.hl-panel ul{list-style:none;padding:0;}
.hl-panel li{font-size:12px;color:var(--text-muted);padding:3px 0;}

.addon-section{margin-top:8px;}
.addon-item{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 0;border-bottom:1px solid rgba(255,255,255,0.06);flex-wrap:wrap;}
.addon-item:last-child{border-bottom:none;}
.addon-left b{display:block;font-size:13.5px;color:var(--text-cream);font-weight:600;margin-bottom:3px;}
.addon-left p{margin:0;font-size:12px;color:var(--text-faint);}
.addon-right{display:flex;align-items:center;gap:14px;flex-shrink:0;}
.addon-price{font-size:13px;color:var(--gold-light);font-weight:500;}
.addon-status{font-size:10px;letter-spacing:0.05em;text-transform:uppercase;font-weight:700;padding:4px 10px;border-radius:100px;white-space:nowrap;}
.addon-status.included{background:rgba(92,184,125,0.09);color:var(--good);border:1px solid rgba(92,184,125,0.28);}
.addon-status.pending{background:rgba(224,139,82,0.09);color:var(--warn);border:1px solid rgba(224,139,82,0.28);}
.addon-total{display:flex;justify-content:space-between;align-items:center;padding-top:16px;margin-top:6px;border-top:1px solid var(--card-border);font-size:12.5px;color:var(--text-muted);}
.addon-total b{color:var(--gold-light);font-size:14px;}
.addon-add-btn{width:100%;margin-top:16px;padding:12px;border-radius:8px;border:1px dashed var(--card-border);background:transparent;color:var(--text-muted);font-size:11.5px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all .2s;}
.addon-add-btn:hover{border-color:var(--gold-dim);color:var(--gold-light);}
.addon-add-btn svg{width:13px;height:13px;}
.addon-form{display:block;margin-top:14px;padding:18px;background:var(--input-bg);border:1px solid var(--card-border);border-radius:9px;}
.addon-form label{font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted);font-weight:600;display:block;margin-bottom:8px;}
.addon-form textarea{width:100%;background:var(--card);border:1px solid var(--card-border);border-radius:7px;padding:11px 13px;font-family:inherit;font-size:13px;color:var(--text-cream);resize:vertical;min-height:70px;outline:none;margin-bottom:12px;}
.addon-form textarea:focus{border-color:var(--gold-dim);}
.hint-sm{font-size:11px;color:var(--text-faint);margin-bottom:14px;}

.compare-table{width:100%;border-collapse:collapse;}
.compare-table th{text-align:left;font-size:10.5px;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-faint);font-weight:600;padding:0 16px 14px 0;border-bottom:1px solid var(--card-border);}
.compare-table td{padding:14px 16px 14px 0;font-size:13.5px;color:var(--text-cream);border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:top;}
.compare-table td:first-child{color:var(--text-faint);font-size:11.5px;letter-spacing:0.04em;text-transform:uppercase;font-weight:600;padding-top:16px;}
.compare-table tr:last-child td{border-bottom:none;}
.col-active{color:var(--gold-light) !important;font-weight:600;}

.site-footer{padding:36px 0 70px;text-align:center;font-size:12px;color:var(--text-faint);border-top:1px solid rgba(255,255,255,0.06);margin-top:40px;}
`;e.s(["default",()=>g])}]);