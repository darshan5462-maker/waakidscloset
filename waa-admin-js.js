var PK='waa_v5_prods',CK='waa_v5_cats',ORDK='waa_v5_orders';
var ADMIN_EMAIL='admin@waakidscloset.in',ADMIN_PASS='waa@2025';
var loggedIn=false,pendImgs=[],editImgs=[],editingId=null;
var DCATS=[
  {id:'c1',name:'Girls Wear',emoji:'👗',desc:'Adorable dresses & frocks'},
  {id:'c2',name:'Boys Wear',emoji:'👕',desc:'Tees, shirts & cool outfits'},
  {id:'c3',name:'Newborn',emoji:'🍼',desc:'0–12 months gentle clothing'},
  {id:'c4',name:'Party Wear',emoji:'🎉',desc:'Special occasion outfits'},
  {id:'c5',name:'Nightwear',emoji:'😴',desc:'Pyjamas & sleepwear'},
  {id:'c6',name:'Accessories',emoji:'👟',desc:'Footwear, hairbands & more'},
  {id:'c7',name:'Sets & Combos',emoji:'👔',desc:'Matching sets & value packs'},
  {id:'c8',name:'Winter Wear',emoji:'🧥',desc:'Jackets, hoodies & woolens'},
  {id:'c9',name:'Ethnic Wear',emoji:'🥻',desc:'Kurtas, lehengas & traditional'},
  {id:'c10',name:'Sports Wear',emoji:'⚽',desc:'Active & outdoor clothing'},
  {id:'c11',name:'School Wear',emoji:'🎒',desc:'Uniforms & essentials'},
  {id:'c12',name:'Footwear',emoji:'👠',desc:'Shoes, sandals & socks'},
  {id:'c13',name:'Educational Kits',emoji:'📚',desc:'Creative & learning kits'},
  {id:'c14',name:'Tops & T-Shirts',emoji:'👚',desc:'Casual tops & tees'},
  {id:'c15',name:'Bottoms',emoji:'👖',desc:'Pants, shorts & leggings'},
  {id:'c16',name:'Dresses & Frocks',emoji:'👒',desc:'Beautiful dresses for girls'},
  {id:'c17',name:'Traditional Wear',emoji:'🏮',desc:'Cultural & festive outfits'},
  {id:'c18',name:'Baby Essentials',emoji:'🧸',desc:'Onesies, bibs & must-haves'},
  {id:'c19',name:'Swimwear',emoji:'🏊',desc:'Swimsuits & beach wear'},
  {id:'c20',name:'Rainwear',emoji:'🌧️',desc:'Raincoats & waterproof wear'}
];

function gP(){try{var d=localStorage.getItem(PK);return d?JSON.parse(d):[]}catch(e){return[]}}
function sP(v){localStorage.setItem(PK,JSON.stringify(v))}
function gC(){try{var d=localStorage.getItem(CK);return d?JSON.parse(d):DCATS.slice()}catch(e){return DCATS.slice()}}
function sC(v){localStorage.setItem(CK,JSON.stringify(v))}
function gOrders(){try{var d=localStorage.getItem(ORDK);return d?JSON.parse(d):[]}catch(e){return[]}}
function sOrders(v){localStorage.setItem(ORDK,JSON.stringify(v))}

function toast(msg,icon){var t=document.createElement('div');t.style.cssText='position:fixed;bottom:1.5rem;right:1.5rem;background:#1a1635;border:2px solid var(--pk);border-radius:12px;padding:.75rem 1.2rem;font-weight:700;font-size:.85rem;z-index:9999;color:var(--tx)';t.textContent=(icon||'')+' '+msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2500)}

function doLogin(){
  var email=document.getElementById('loginEmail').value.trim();
  var pwd=document.getElementById('loginPass').value;
  var err=document.getElementById('loginErr');
  if(typeof firebase!=='undefined'&&firebase.auth){
    firebase.auth().signInWithEmailAndPassword(email,pwd)
      .then(function(){showAdmin(email)})
      .catch(function(){tryLocal(email,pwd,err)});
  } else {tryLocal(email,pwd,err)}
}
function tryLocal(email,pwd,err){
  if(email===ADMIN_EMAIL&&pwd===ADMIN_PASS){showAdmin(email)}
  else{err.classList.add('show')}
}
function showAdmin(email){
  loggedIn=true;
  document.getElementById('loginPage').style.display='none';
  document.getElementById('adminPage').style.display='block';
  var name=email.split('@')[0];
  var av=document.getElementById('adminAv');var nm=document.getElementById('adminName');
  if(av)av.textContent=name[0].toUpperCase();if(nm)nm.textContent=name;
  sessionStorage.setItem('waa_adm_logged','1');sessionStorage.setItem('waa_adm_email',email);
  populateCatSelect();renderDashStats();updateOrderBadge();startAutoSync();
}
function doLogout(){
  sessionStorage.removeItem('waa_adm_logged');
  document.getElementById('adminPage').style.display='none';
  document.getElementById('loginPage').style.display='flex';
}

function admTab(sec,btn){
  document.querySelectorAll('.asec').forEach(function(s){s.classList.remove('on')});
  var t=document.getElementById('as-'+sec);if(t)t.classList.add('on');
  document.querySelectorAll('.adm-tab').forEach(function(t){t.classList.remove('on')});
  if(btn)btn.classList.add('on');
  else{var mt=document.querySelector('.adm-tab[data-sec="'+sec+'"]');if(mt)mt.classList.add('on')}
  if(sec==='products')renderAdmProd();
  if(sec==='dashboard')renderDashStats();
  if(sec==='categories')renderCatT();
  if(sec==='orders')renderOrders();
  if(sec==='customers')renderCustomers();
  if(sec==='add-product'){pendImgs=[];editImgs=[];var ip=document.getElementById('img-prev');if(ip)ip.innerHTML=''}
}
function updateOrderBadge(){var o=gOrders();var b=document.getElementById('ordBadge');if(b)b.textContent=o.length||''}

function renderDashStats(){
  var prods=gP(),orders=gOrders();
  var active=prods.filter(function(p){return p.status==='Active'});
  var el=function(id){return document.getElementById(id)};
  if(el('d-tot-ord'))el('d-tot-ord').textContent=orders.length;
  if(el('d-prods'))el('d-prods').textContent=active.length;
  var rev=orders.reduce(function(s,o){return s+(o.amount||0)},0);
  if(el('d-rev'))el('d-rev').textContent=rev>=100000?'₹'+(rev/100000).toFixed(1)+'L':'₹'+rev.toLocaleString();
  var counts={Pending:0,Paid:0,Shipped:0,Delivered:0};
  orders.forEach(function(o){if(counts[o.status]!==undefined)counts[o.status]++});
  ['Pending','Paid','Shipped','Delivered'].forEach(function(s){var id='ds-'+s.toLowerCase();if(el(id))el(id).textContent=counts[s]});
  var tbody=el('d-orders-t');
  if(tbody)tbody.innerHTML=orders.slice(0,5).map(function(o){
    var sm={Paid:'sp-pa',Pending:'sp-p',Shipped:'sp-sh',Delivered:'sp-de',Cancelled:'sp-oo'};
    return '<tr><td style="font-family:monospace;font-size:.72rem;color:var(--am)">'+(o.orderId||'#'+o.id)+'</td><td style="font-weight:700">'+(o.customer||'Customer')+'</td><td style="font-weight:800">₹'+(o.amount||0).toLocaleString()+'</td><td><span class="sp '+(sm[o.status]||'sp-p')+'">'+(o.status||'Pending')+'</span></td></tr>';
  }).join('');
  var topDiv=el('d-top-p');
  if(topDiv){var top=active.slice(0,4);topDiv.innerHTML=top.map(function(p){var img=p.images&&p.images[0]?'<img src="'+p.images[0]+'" style="width:40px;height:44px;object-fit:cover;border-radius:8px">':'<div style="width:40px;height:44px;background:var(--pk-l);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.4rem">'+(p.emoji||'👗')+'</div>';return'<div style="display:flex;gap:.75rem;align-items:center;margin-bottom:.75rem;padding-bottom:.75rem;border-bottom:1px solid var(--br)">'+img+'<div><div style="font-size:.83rem;font-weight:800">'+p.name+'</div><div style="font-size:.72rem;color:var(--gn);font-weight:700">₹'+p.price.toLocaleString()+'</div></div></div>';}).join('')||'<div style="color:var(--mu)">No products yet</div>'}
  updateOrderBadge();
}

function renderAdmProd(q){
  var tbody=document.getElementById('prod-t');if(!tbody)return;
  var prods=gP();if(q){var ql=q.toLowerCase();prods=prods.filter(function(p){return(p.name||'').toLowerCase().includes(ql)})}
  var stMap={Active:'sp-pa',Draft:'sp-p','Out of Stock':'sp-oo'};
  tbody.innerHTML=prods.length?prods.map(function(p){
    var img=p.images&&p.images[0]?'<img src="'+p.images[0]+'" style="width:44px;height:48px;object-fit:cover;border-radius:8px">':'<div style="width:44px;height:48px;background:var(--pk-l);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.6rem">'+(p.emoji||'👗')+'</div>';
    return'<tr><td>'+img+'</td><td style="font-weight:700">'+p.name+'</td><td style="font-size:.78rem;color:var(--mu)">'+p.cat+'</td><td style="font-weight:800">₹'+p.price.toLocaleString()+'</td><td><span class="sp '+(stMap[p.status]||'sp-p')+'">'+p.status+'</span></td><td><button class="btn-pk-sm" onclick="editProd(\''+p.id+'\')">Edit</button> <button class="abt-o" onclick="delProd(\''+p.id+'\')" style="margin-left:.3rem">Del</button></td></tr>';
  }).join(''):'<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--mu)">No products yet</td></tr>';
}

function editProd(id){
  var p=gP().find(function(x){return x.id===id});if(!p)return;
  editingId=id;var e=function(i){return document.getElementById(i)};
  ['name','brand','desc','price','orig','sizes','colors','emoji','mt','md'].forEach(function(k){var el=e('p-'+k);if(el)el.value=p[k===('price')?'price':k===('orig')?'origPrice':k===('mt')?'metaTitle':k===('md')?'metaDesc':k]||''});
  if(e('p-price'))e('p-price').value=p.price||'';
  if(e('p-orig'))e('p-orig').value=p.origPrice||'';
  if(e('p-mt'))e('p-mt').value=p.metaTitle||'';
  if(e('p-md'))e('p-md').value=p.metaDesc||'';
  if(e('p-status'))e('p-status').value=p.status||'Active';
  if(e('p-featured'))e('p-featured').value=p.featured||'no';
  if(e('p-age'))e('p-age').value=p.age||'';
  if(e('p-badge'))e('p-badge').value=p.badge||'';
  if(e('p-cat'))e('p-cat').value=p.cat||'';
  editImgs=p.images||[];pendImgs=[];
  var prev=e('img-prev');if(prev)prev.innerHTML=editImgs.map(function(src,i){return'<div style="position:relative"><img class="pv-img" src="'+src+'"><button onclick="removeEditImg('+i+')" style="position:absolute;top:-4px;right:-4px;background:var(--rd);border:none;border-radius:50%;width:16px;height:16px;color:#fff;font-size:.6rem;cursor:pointer">✕</button></div>'}).join('');
  if(e('save-txt'))e('save-txt').textContent='💾 Update Product';
  if(e('cancel-btn'))e('cancel-btn').style.display='block';
  if(e('add-prod-bc'))e('add-prod-bc').textContent='Edit Product';
  updateColorPreview();
  admTab('add-product',document.querySelector('[data-sec="add-product"]'));
}
function removeEditImg(i){editImgs.splice(i,1);editProd(editingId)}
function cancelEdit(){
  editingId=null;editImgs=[];pendImgs=[];
  var e=function(i){return document.getElementById(i)};
  ['p-name','p-brand','p-desc','p-price','p-orig','p-sizes','p-colors','p-emoji','p-mt','p-md'].forEach(function(id){if(e(id))e(id).value=''});
  if(e('save-txt'))e('save-txt').textContent='💾 Save Product';
  if(e('cancel-btn'))e('cancel-btn').style.display='none';
  if(e('add-prod-bc'))e('add-prod-bc').textContent='Add Product';
  if(e('img-prev'))e('img-prev').innerHTML='';
  if(e('color-preview'))e('color-preview').innerHTML='';
}
function saveProd(){
  var e=function(i){return document.getElementById(i)};
  var name=e('p-name')&&e('p-name').value.trim();
  var price=parseFloat(e('p-price')&&e('p-price').value)||0;
  if(!name||!price){toast('Name and price required','⚠️');return}
  var prods=gP(),id=editingId||('p'+Date.now()),allImgs=editImgs.concat(pendImgs);
  var prod={id:id,name:name,cat:e('p-cat')&&e('p-cat').value||'',brand:e('p-brand')&&e('p-brand').value.trim()||'',desc:e('p-desc')&&e('p-desc').value.trim()||'',price:price,origPrice:parseFloat(e('p-orig')&&e('p-orig').value)||0,sizes:e('p-sizes')&&e('p-sizes').value.trim()||'',colors:e('p-colors')&&e('p-colors').value.trim()||'',age:e('p-age')&&e('p-age').value||'',emoji:e('p-emoji')&&e('p-emoji').value||'👗',badge:e('p-badge')&&e('p-badge').value||'',status:e('p-status')&&e('p-status').value||'Active',featured:e('p-featured')&&e('p-featured').value||'no',metaTitle:e('p-mt')&&e('p-mt').value.trim()||'',metaDesc:e('p-md')&&e('p-md').value.trim()||'',images:allImgs,createdAt:Date.now()};
  if(editingId){var idx=prods.findIndex(function(x){return x.id===editingId});if(idx>=0)prods[idx]=prod;else prods.unshift(prod)}
  else prods.unshift(prod);
  sP(prods);fbSaveProd(prod);
  var msg=e('save-msg');if(msg){msg.style.display='block';msg.style.background='rgba(78,203,113,.15)';msg.style.color='var(--gn)';msg.textContent='✅ Product saved!';setTimeout(function(){msg.style.display='none'},2500)}
  toast((editingId?'Updated':'Saved')+': '+name,'✅');cancelEdit();renderDashStats();
}
function saveDraft(){var s=document.getElementById('p-status');if(s)s.value='Draft';saveProd()}
function delProd(id){if(!confirm('Delete this product?'))return;sP(gP().filter(function(p){return p.id!==id}));renderAdmProd();renderDashStats();toast('Deleted','🗑️')}

function handleImgSel(event){
  Array.from(event.target.files||[]).forEach(function(file){
    var reader=new FileReader();
    reader.onload=function(e){
      var img=new Image();img.onload=function(){
        var canvas=document.createElement('canvas'),MAX=800,ratio=Math.min(MAX/img.width,MAX/img.height,1);
        canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);
        canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
        var compressed=canvas.toDataURL('image/jpeg',0.8);pendImgs.push(compressed);
        var prev=document.getElementById('img-prev');if(prev){var div=document.createElement('div');div.style.position='relative';var imgEl=document.createElement('img');imgEl.className='pv-img';imgEl.src=compressed;var btn=document.createElement('button');btn.style.cssText='position:absolute;top:-4px;right:-4px;background:var(--rd);border:none;border-radius:50%;width:16px;height:16px;color:#fff;font-size:.6rem;cursor:pointer';btn.textContent='✕';btn.onclick=function(){pendImgs.splice(pendImgs.indexOf(compressed),1);div.remove()};div.appendChild(imgEl);div.appendChild(btn);prev.appendChild(div)}
      };img.src=e.target.result;
    };reader.readAsDataURL(file);
  });
}
function updateColorPreview(){var inp=document.getElementById('p-colors'),prev=document.getElementById('color-preview');if(!inp||!prev)return;var colors=inp.value.split(',').map(function(c){return c.trim()}).filter(Boolean);prev.innerHTML=colors.map(function(col){return'<div class="cp-dot" style="background:'+col+'" title="'+col+'"></div>'}).join('')}

function populateCatSelect(){var sel=document.getElementById('p-cat');if(!sel)return;var cats=gC();sel.innerHTML='<option value="">Select Category</option>'+cats.map(function(c){return'<option value="'+c.name+'">'+c.emoji+' '+c.name+'</option>'}).join('')}
function saveCat(){
  var name=(document.getElementById('c-name')||{}).value;if(!name||!name.trim()){toast('Name required','⚠️');return}
  name=name.trim();var emoji=((document.getElementById('c-emoji')||{}).value||'').trim()||'📦';var desc=((document.getElementById('c-desc')||{}).value||'').trim();
  var cats=gC();if(cats.find(function(c){return c.name.toLowerCase()===name.toLowerCase()})){toast('Already exists','⚠️');return}
  cats.push({id:'c'+Date.now(),name:name,emoji:emoji,desc:desc,slug:name.toLowerCase().replace(/\s+/g,'-')});
  sC(cats);populateCatSelect();renderCatT();
  document.getElementById('c-name').value='';document.getElementById('c-emoji').value='';document.getElementById('c-desc').value='';
  toast('Added: '+name,'✅');
}
function delCat(id){if(!confirm('Delete?'))return;sC(gC().filter(function(c){return c.id!==id}));populateCatSelect();renderCatT();toast('Deleted','🗑️')}
function renderCatT(){var tbody=document.getElementById('cat-t');if(!tbody)return;var cats=gC(),prods=gP();tbody.innerHTML=cats.map(function(cat){var count=prods.filter(function(p){return p.cat===cat.name}).length;return'<tr><td style="font-size:1.3rem">'+cat.emoji+'</td><td style="font-weight:700">'+cat.name+'</td><td>'+count+'</td><td><button class="abt-o" onclick="delCat(\''+cat.id+'\')">Delete</button></td></tr>'}).join('')}

function renderOrders(){
  var t=document.getElementById('real-orders-t');if(!t)return;
  var orders=gOrders();
  var sf=(document.getElementById('ord-status-fil')||{}).value||'';
  var q=((document.getElementById('ord-search')||{}).value||'').toLowerCase().trim();
  if(sf)orders=orders.filter(function(o){return(o.status||'').toLowerCase()===sf.toLowerCase()});
  if(q)orders=orders.filter(function(o){return(o.orderId||'').toLowerCase().includes(q)||(o.customer||'').toLowerCase().includes(q)||(o.phone||'').toLowerCase().includes(q)});
  if(!orders.length){t.innerHTML='<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--mu)">📦 No orders found</td></tr>';return}
  var sm={Paid:'sp-pa',Pending:'sp-p',Shipped:'sp-sh',Delivered:'sp-de',Cancelled:'sp-oo'};
  t.innerHTML=orders.map(function(o){
    var opts=['Pending','Paid','Shipped','Delivered','Cancelled'].map(function(s){return'<option'+(o.status===s?' selected':'')+'>'+s+'</option>'}).join('');
    var ph=(o.phone||'').replace(/[^0-9]/g,'');if(ph.length===10)ph='91'+ph;
    var hasPhone=ph.length>=10,oid=o.orderId||('#'+o.id),amt=String(o.amount||0);
    var waBtn=hasPhone?'<div style="display:flex;flex-direction:column;gap:2px"><button class="wa-btn" style="background:#25D366;color:#fff" data-ph="'+ph+'" data-oid="'+oid+'" data-st="Confirmed" data-amt="'+amt+'">✅ Confirmed</button><button class="wa-btn" style="background:#5bb8ff;color:#fff" data-ph="'+ph+'" data-oid="'+oid+'" data-st="Shipped" data-amt="'+amt+'">🚚 Shipped</button><button class="wa-btn" style="background:#4ecb71;color:#fff" data-ph="'+ph+'" data-oid="'+oid+'" data-st="Delivered" data-amt="'+amt+'">🎉 Delivered</button><button class="wa-btn" style="background:#ff5252;color:#fff" data-ph="'+ph+'" data-oid="'+oid+'" data-st="Cancelled" data-amt="'+amt+'">❌ Cancelled</button></div>':'No phone';
    var src=o.cartItems||o.itemList||[];
    var items=src.length?src.map(function(it){var line='<div style="padding:.2rem 0;border-bottom:1px solid var(--br)"><b style="font-size:.75rem">'+it.name+'</b>';if(it.qty>1)line+=' <span style="background:var(--pp);color:#fff;border-radius:4px;padding:0 .3rem;font-size:.65rem">x'+it.qty+'</span>';if(it.size)line+='<br><span style="color:var(--am);font-size:.7rem">Size: <b>'+it.size+'</b></span>';if(it.color)line+='<br><span style="color:var(--am);font-size:.7rem">Color: <b>'+it.color+'</b></span>';return line+'</div>'}).join(''):(o.items||0)+' item(s)';
    return'<tr><td style="font-family:monospace;font-size:.72rem;color:var(--am)">'+(o.orderId||'#'+o.id)+'</td><td style="font-weight:700">'+(o.customer||'—')+'</td><td style="font-size:.73rem;color:var(--mu)">'+(o.phone||'—')+'</td><td style="font-size:.7rem;color:var(--mu);max-width:140px">'+(o.address||o.city||'—')+'</td><td style="font-size:.72rem;max-width:200px">'+items+'</td><td style="font-weight:800">₹'+(o.amount||0).toLocaleString()+'</td><td style="color:var(--mu);font-size:.73rem">'+(o.date||'—')+'</td><td><span class="sp '+(sm[o.status]||'sp-p')+'">'+(o.status||'Pending')+'</span></td><td><select class="as-sel" style="font-size:.72rem;padding:.2rem .4rem" onchange="updOrderStatus(\''+o.id+'\',this.value)">'+opts+'</select></td><td>'+waBtn+'</td></tr>';
  }).join('');
}
function updOrderStatus(id,status){var orders=gOrders();var o=orders.find(function(x){return x.id===id});if(o){o.status=status;sOrders(orders);renderDashStats();toast('Updated: '+status,'✅');fbSaveOrder(o)}}
function exportOrdersCSV(){
  var orders=gOrders();if(!orders.length){toast('No orders','❌');return}
  var rows=['Order ID,Customer,Phone,Address,Items,Amount,Date,Status'];
  orders.forEach(function(o){var items=(o.cartItems||o.itemList||[]).map(function(i){return i.name+(i.size?'['+i.size+']':'')+'x'+(i.qty||1)}).join('|');rows.push([o.orderId||'',o.customer||'',o.phone||'',(o.address||o.city||'').replace(/,/g,' '),'"'+(items||o.items||0)+'"',o.amount||0,o.date||'',o.status||''].join(','))});
  var blob=new Blob([rows.join('\n')],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='waa-orders.csv';a.click();
}
document.addEventListener('click',function(e){
  var btn=e.target.closest('.wa-btn');if(!btn)return;
  var ph=btn.dataset.ph,oid=btn.dataset.oid,st=btn.dataset.st,amt=btn.dataset.amt;
  var row=btn.closest('tr');var cust=row?(row.cells[1]&&row.cells[1].textContent.trim()):'Customer';
  var msg = buildWAMsg(cust, oid, st, amt);
  window.open('https://wa.me/'+ph+'?text='+encodeURIComponent(msg),'_blank');
});

function buildWAMsg(cust, oid, st, amt) {
  var store = 'WAA Kids Closet';
  var msgs = {
    'Confirmed':
      '🎉 *Order Confirmed!*

'
      +'Hello *'+cust+'*! 😊

'
      +'Your order has been successfully *confirmed* and is being prepared with love! 💕

'
      +'📦 *Order ID:* '+oid+'
'
      +'💰 *Amount:* ₹'+amt+'
'
      +'🏪 *Store:* '+store+'

'
      +'We are carefully packing your items and will dispatch them soon! 🛍️

'
      +'✨ Thank you for shopping with us!
'
      +'📞 Need help? Call: +91 93800 13093

'
      +'_WAA Kids Closet — We-Are-Affordable_ 👑',

    'Shipped':
      '🚚 *Your Order is on the Way!*

'
      +'Hello *'+cust+'*! 🎀

'
      +'Great news! Your order has been *shipped* and is heading your way! 📦✈️

'
      +'📋 *Order ID:* '+oid+'
'
      +'💰 *Amount:* ₹'+amt+'
'
      +'🕐 *Expected Delivery:* 3–7 Working Days

'
      +'Your little one's new outfit is on its way! 👗👕🍼

'
      +'📍 Track your order by contacting us anytime.
'
      +'📞 Support: +91 93800 13093

'
      +'_WAA Kids Closet — We-Are-Affordable_ 👑',

    'Delivered':
      '🎉 *Order Delivered Successfully!*

'
      +'Hello *'+cust+'*! 🥳

'
      +'Your order has been *delivered*! We hope your little one loves their new outfit! 💕👧👦

'
      +'📦 *Order ID:* '+oid+'
'
      +'💰 *Amount Paid:* ₹'+amt+'

'
      +'💬 We'd love to hear your feedback! A quick review helps other moms discover us. 🌟

'
      +'🛍️ Shop again at: *waakidscloset.vercel.app*
'
      +'📸 Follow us: *@waa_kids_closet*
'
      +'📞 Contact: +91 93800 13093

'
      +'Thank you for being part of the WAA family! 💛

'
      +'_WAA Kids Closet — We-Are-Affordable_ 👑',

    'Cancelled':
      '❌ *Order Cancellation Notice*

'
      +'Hello *'+cust+'*,

'
      +'We're sorry to inform you that your order has been *cancelled*. 😔

'
      +'📦 *Order ID:* '+oid+'
'
      +'💰 *Amount:* ₹'+amt+'

'
      +'If you did not request this cancellation or if you have any questions, please contact us immediately.

'
      +'📞 *Call/WhatsApp:* +91 93800 13093
'
      +'🛍️ *Shop again:* waakidscloset.vercel.app

'
      +'We hope to serve you again soon! 💕

'
      +'_WAA Kids Closet — We-Are-Affordable_ 👑'
  };
  return msgs[st] || (
    '👋 Hello *'+cust+'*!

'
    +'Update on your order *'+oid+'*:
'
    +'📦 Status: *'+st+'*
'
    +'💰 Amount: ₹'+amt+'

'
    +'Thank you for shopping at *WAA Kids Closet*! 🛍️
'
    +'📞 +91 93800 13093

'
    +'_WAA Kids Closet — We-Are-Affordable_ 👑'
  );
}

function renderCustomers(){
  var tbody=document.getElementById('cust-t');if(!tbody)return;
  var orders=gOrders();var map={};
  orders.forEach(function(o){var k=o.phone||o.customer||'unknown';if(!map[k])map[k]={name:o.customer||'Customer',phone:o.phone||'N/A',city:o.city||'',orders:0,total:0,last:o.date||''};map[k].orders++;map[k].total+=o.amount||0;map[k].last=o.date||map[k].last});
  var custs=Object.values(map).sort(function(a,b){return b.total-a.total});
  tbody.innerHTML=custs.length?custs.map(function(cu){return'<tr><td style="font-weight:700">'+cu.name+'</td><td style="font-size:.76rem;color:var(--mu)">'+cu.phone+'</td><td>'+cu.city+'</td><td>'+cu.orders+'</td><td style="font-weight:800;color:var(--aa)">₹'+cu.total.toLocaleString()+'</td><td style="color:var(--mu);font-size:.75rem">'+cu.last+'</td></tr>'}).join(''):'<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--mu)">No customer data yet</td></tr>';
}

function fbSaveProd(prod){try{if(typeof firebase!=='undefined'&&firebase.database)firebase.database().ref('products/'+prod.id).set(prod)}catch(e){}}
function fbSaveOrder(order){try{if(typeof firebase!=='undefined'&&firebase.database)firebase.database().ref('orders/'+order.id).set(order)}catch(e){}}
function startAutoSync(){
  try{
    if(typeof firebase==='undefined'||!firebase.database)return;
    firebase.database().ref('products').on('value',function(snap){var data=snap.val();if(data){var prods=Object.values(data);var local=gP();prods.forEach(function(p){if(!local.find(function(x){return x.id===p.id}))local.push(p)});sP(local);renderDashStats()}});
    firebase.database().ref('orders').on('value',function(snap){var data=snap.val();if(data){var orders=Object.values(data).sort(function(a,b){return(b.createdAt||0)-(a.createdAt||0)});sOrders(orders);renderDashStats();updateOrderBadge()}});
  }catch(e){}
}

document.addEventListener('DOMContentLoaded',function(){
  var cp=document.getElementById('p-colors');if(cp)cp.addEventListener('input',updateColorPreview);
  // Update dashboard time
  function updateTime(){var t=document.getElementById('dash-time');if(t){var now=new Date();t.textContent=now.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}}
  updateTime();
  if(sessionStorage.getItem('waa_adm_logged')==='1'){showAdmin(sessionStorage.getItem('waa_adm_email')||ADMIN_EMAIL)}
});
