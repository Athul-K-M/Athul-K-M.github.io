import { supabase, configured } from "./supabase-client.js";
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
if (configured) {
  const [skills, certs, achievements] = await Promise.all([
    supabase.from("skills").select("*").eq("is_published", true).order("sort_order"),
    supabase.from("certificates").select("*").eq("is_published", true).order("created_at", {ascending:false}),
    supabase.from("achievements").select("*").eq("is_published", true).order("created_at", {ascending:false})
  ]);
  if (skills.data?.length) document.querySelector("#skills .skills-grid").innerHTML = skills.data.map(x =>
    `<div class="skill-card"><h3>${esc(x.name)}</h3><p>${esc(x.description || x.category)}</p></div>`).join("");
  if (certs.data?.length) document.getElementById("certificatesGrid").innerHTML = certs.data.map(x =>
    `<article class="certificate-card"><p class="card-kicker">${esc(x.issuer)}${x.completed_on ? " · "+esc(x.completed_on):""}</p><h3>${esc(x.title)}</h3><p class="card-meta">${esc(x.duration||"")}${x.score ? " · Score: "+esc(x.score):""}${x.credits ? " · "+esc(x.credits)+" credits":""}</p><p class="card-description">${esc(x.description||"")}</p><a class="btn btn-primary" href="${esc(x.file_url||x.verification_url||"#")}" target="_blank" rel="noopener">View Certificate ↗</a></article>`).join("");
  if (achievements.data?.length) document.getElementById("achievementsGrid").innerHTML = achievements.data.map(x =>
    `<article class="achievement-card"><p class="card-kicker">${esc(x.event_date||"Achievement")}</p><h3>${esc(x.title)}</h3><p class="card-description">${esc(x.description||"")}</p>${x.file_url?`<a class="btn btn-secondary" href="${esc(x.file_url)}" target="_blank" rel="noopener">View attachment ↗</a>`:""}</article>`).join("");
}
