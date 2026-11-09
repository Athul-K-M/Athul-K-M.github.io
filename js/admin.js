import { supabase, configured } from "./supabase-client.js";
const $ = id => document.getElementById(id);
const say = msg => $("notice").textContent = msg;
const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
if (!configured) { $("loginForm").classList.add("hidden"); say("First configure js/config.js and run supabase/schema.sql. See README.md."); }

$("loginForm").addEventListener("submit", async e => {
 e.preventDefault(); if(!supabase)return; say("Signing in…");
 const {error}=await supabase.auth.signInWithPassword({email:$("email").value,password:$("password").value});
 if(error){say(error.message);return;} await refresh();
});
$("logout").onclick=async()=>{await supabase.auth.signOut();await refresh();};
supabase?.auth.onAuthStateChange(()=>setTimeout(refresh,0));
async function refresh(){
 if(!supabase)return;
 const {data:{session}}=await supabase.auth.getSession();
 $("loginPanel").classList.toggle("hidden",!!session);$("dashboard").classList.toggle("hidden",!session);
 if(session){$("userEmail").textContent=session.user.email;say("Signed in. Changes are saved to Supabase.");await loadLists();}
}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{
 document.querySelectorAll("[data-tab]").forEach(x=>x.classList.toggle("selected",x===b));
 ["certificates","skills","achievements"].forEach(t=>$(t+"Panel").classList.toggle("hidden",t!==b.dataset.tab));
});
async function upload(file,folder){
 if(!file)return null;
 if(!["application/pdf","image/png","image/jpeg","image/webp"].includes(file.type))throw Error("Allowed files: PDF, PNG, JPG or WebP.");
 if(file.size>10*1024*1024)throw Error("Maximum file size is 10 MB.");
 const path=folder+"/"+crypto.randomUUID()+"-"+file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
 const {error}=await supabase.storage.from("portfolio-files").upload(path,file,{contentType:file.type});
 if(error)throw error;
 return supabase.storage.from("portfolio-files").getPublicUrl(path).data.publicUrl;
}
async function save(table,id,record){const q=id?supabase.from(table).update(record).eq("id",id):supabase.from(table).insert(record);const {error}=await q;if(error)throw error;await loadLists();say("Saved successfully.");}
async function del(table,id){if(!confirm("Delete this item?"))return;const {error}=await supabase.from(table).delete().eq("id",id);if(error)say(error.message);else{say("Deleted.");await loadLists();}}
function render(id,rows,table,title,sub){$(id).innerHTML=(rows||[]).map(r=>`<div class="entry"><div><b>${esc(r[title])}</b><small>${esc(sub(r))}</small></div><div><button class="edit" data-edit="${r.id}">Edit</button> <button class="delete" data-del="${r.id}">Delete</button></div></div>`).join("")||'<p class="muted">No entries yet.</p>';
 $(id).querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>del(table,b.dataset.del));
 $(id).querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(table,b.dataset.edit,rows));
}
async function loadLists(){
 const [c,s,a]=await Promise.all([supabase.from("certificates").select("*").order("created_at",{ascending:false}),supabase.from("skills").select("*").order("sort_order"),supabase.from("achievements").select("*").order("created_at",{ascending:false})]);
 if(c.error||s.error||a.error){say((c.error||s.error||a.error).message);return;}
 render("certList",c.data,"certificates","title",r=>r.issuer+" · "+(r.completed_on||""));
 render("skillList",s.data,"skills","name",r=>r.category);
 render("achievementList",a.data,"achievements","title",r=>r.event_date||"");
}
function edit(table,id,rows){
 const r=rows.find(x=>x.id===id);if(!r)return;
 if(table==="certificates"){
  $("certId").value=r.id;$("certTitle").value=r.title;$("certIssuer").value=r.issuer;$("certDate").value=r.completed_on||"";$("certDuration").value=r.duration||"";$("certScore").value=r.score||"";$("certCredits").value=r.credits||"";$("certDescription").value=r.description||"";$("certVerification").value=r.verification_url||"";
 } else if(table==="skills"){
  $("skillId").value=r.id;$("skillName").value=r.name;$("skillCategory").value=r.category;$("skillDescription").value=r.description||"";
 } else {
  $("achievementId").value=r.id;$("achievementTitle").value=r.title;$("achievementDate").value=r.event_date||"";$("achievementDescription").value=r.description||"";
 }
 window.scrollTo({top:0,behavior:"smooth"});
}
$("certForm").onsubmit=async e=>{e.preventDefault();try{const file=await upload($("certFile").files[0],"certificates");const rec={title:$("certTitle").value.trim(),issuer:$("certIssuer").value.trim(),completed_on:$("certDate").value.trim()||null,duration:$("certDuration").value.trim()||null,score:$("certScore").value.trim()||null,credits:$("certCredits").value.trim()||null,description:$("certDescription").value.trim()||null,verification_url:$("certVerification").value.trim()||null,is_published:true};if(file)rec.file_url=file;await save("certificates",$("certId").value,rec);e.target.reset();$("certId").value="";}catch(x){say(x.message);}};
$("skillForm").onsubmit=async e=>{e.preventDefault();try{await save("skills",$("skillId").value,{name:$("skillName").value.trim(),category:$("skillCategory").value,description:$("skillDescription").value.trim()||null,is_published:true});e.target.reset();$("skillId").value="";}catch(x){say(x.message);}};
$("achievementForm").onsubmit=async e=>{e.preventDefault();try{const file=await upload($("achievementFile").files[0],"achievements");const rec={title:$("achievementTitle").value.trim(),event_date:$("achievementDate").value||null,description:$("achievementDescription").value.trim()||null,is_published:true};if(file)rec.file_url=file;await save("achievements",$("achievementId").value,rec);e.target.reset();$("achievementId").value="";}catch(x){say(x.message);}};
$("clearCert").onclick=()=>{$("certForm").reset();$("certId").value="";};$("clearSkill").onclick=()=>{$("skillForm").reset();$("skillId").value="";};$("clearAchievement").onclick=()=>{$("achievementForm").reset();$("achievementId").value="";};
refresh();
