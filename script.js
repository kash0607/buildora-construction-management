const materials=[
{id:1,name:"Cement",category:"Construction",unit:"Bag",cost:420,reorder:50},
{id:2,name:"Steel Rod 12mm",category:"Steel",unit:"Piece",cost:680,reorder:100},
{id:3,name:"Bricks",category:"Masonry",unit:"Piece",cost:9,reorder:5000},
{id:4,name:"River Sand",category:"Aggregate",unit:"Ton",cost:1800,reorder:10},
{id:5,name:"PVC Pipe 4 inch",category:"Plumbing",unit:"Piece",cost:350,reorder:30}
];
let inventory=[
{material:1,project:"Green Valley Residency",qty:82,updated:"08 Sep 2026"},
{material:2,project:"Green Valley Residency",qty:140,updated:"08 Sep 2026"},
{material:3,project:"Metro Heights",qty:4200,updated:"07 Sep 2026"},
{material:4,project:"Metro Heights",qty:7,updated:"08 Sep 2026"},
{material:5,project:"Skyline Villas",qty:0,updated:"06 Sep 2026"}
];
let requests=[
{id:"MR-1001",material:1,qty:100,project:"Green Valley Residency",status:"Pending"},
{id:"MR-1002",material:4,qty:15,project:"Metro Heights",status:"Approved"}
];
let movements=[
{date:"08 Sep 2026",material:1,type:"Stock In",qty:50,ref:"GRN-2041"},
{date:"08 Sep 2026",material:4,type:"Stock Out",qty:3,ref:"ISS-1188"},
{date:"07 Sep 2026",material:3,type:"Stock In",qty:2000,ref:"GRN-2038"},
{date:"06 Sep 2026",material:5,type:"Stock Out",qty:20,ref:"ISS-1172"}
];

const matName=id=>materials.find(m=>m.id===id)?.name||"Unknown";
function status(m,i){if(i.qty===0)return ["Out of Stock","out"];if(i.qty<=m.reorder)return ["Low Stock","low"];return ["In Stock","in"]}

function render(){
 const q=document.getElementById("search").value.toLowerCase();
 document.getElementById("totalMaterials").textContent=materials.length;
 document.getElementById("totalStock").textContent=inventory.reduce((a,b)=>a+b.qty,0).toLocaleString();
 document.getElementById("lowStock").textContent=inventory.filter(i=>{let m=materials.find(x=>x.id===i.material);return i.qty>0&&i.qty<=m.reorder}).length;
 document.getElementById("outStock").textContent=inventory.filter(i=>i.qty===0).length;
 document.getElementById("materialTable").innerHTML=materials.filter(m=>m.name.toLowerCase().includes(q)).map(m=>`<tr><td><b>${m.name}</b></td><td>${m.category}</td><td>${m.unit}</td><td>₹${m.cost.toLocaleString()}</td><td>${m.reorder}</td><td><button onclick="openRequestModal(${m.id})">Request</button></td></tr>`).join("");
 document.getElementById("inventoryTable").innerHTML=inventory.map(i=>{let m=materials.find(x=>x.id===i.material);let [s,c]=status(m,i);return `<tr><td><b>${m.name}</b></td><td>${i.project}</td><td>${i.qty} ${m.unit}</td><td><span class="badge ${c}">${s}</span></td><td>${i.updated}</td><td><button onclick="stockMovement(${i.material})">Add Stock</button></td></tr>`}).join("");
 document.getElementById("requestTable").innerHTML=requests.map(r=>`<tr><td>${r.id}</td><td>${matName(r.material)}</td><td>${r.qty}</td><td>${r.project}</td><td>${r.status}</td></tr>`).join("");
 document.getElementById("movementTable").innerHTML=movements.map(x=>`<tr><td>${x.date}</td><td>${matName(x.material)}</td><td class="${x.type==="Stock In"?"add":"issue"}">${x.type}</td><td>${x.qty}</td><td>${x.ref}</td></tr>`).join("");
}
function openRequestModal(id){document.getElementById("modal").style.display="flex";document.getElementById("reqMaterial").innerHTML=materials.map(m=>`<option value="${m.id}" ${m.id===id?"selected":""}>${m.name}</option>`).join("")}
function closeModal(){document.getElementById("modal").style.display="none"}
function createRequest(e){e.preventDefault();requests.unshift({id:"MR-"+(1000+requests.length+1),material:+reqMaterial.value,qty:+reqQty.value,project:reqProject.value,status:"Pending"});e.target.reset();closeModal();render();document.getElementById("requests").scrollIntoView({behavior:"smooth"})}
function stockMovement(id){let qty=prompt("Enter stock quantity to add:");if(!qty||isNaN(qty)||+qty<=0)return;let i=inventory.find(x=>x.material===id);i.qty+=+qty;i.updated="08 Sep 2026";movements.unshift({date:"08 Sep 2026",material:id,type:"Stock In",qty:+qty,ref:"MANUAL"});render()}
render();
