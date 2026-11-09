import { supabase, configured } from "./supabase-client.js";

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

if (configured) {
  try {
    const [skills, certs, achievements] = await Promise.all([
      supabase
        .from("skills")
        .select("*")
        .eq("is_published", true)
        .order("sort_order"),

      supabase
        .from("certificates")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),

      supabase
        .from("achievements")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
    ]);

    if (skills.error) console.error("Skills error:", skills.error);
    if (certs.error) console.error("Certificates error:", certs.error);
    if (achievements.error) console.error("Achievements error:", achievements.error);

    // Display skills
    if (skills.data?.length) {
      const skillsGrid = document.querySelector("#skills .skills-grid");

      if (skillsGrid) {
        skillsGrid.innerHTML = skills.data.map((x) => `
          <div class="skill-card">
            <h3>${esc(x.name)}</h3>
            <p>${esc(x.description || x.category)}</p>
          </div>
        `).join("");
      }
    }

    // Display certificates
    if (certs.data?.length) {
      const certificatesGrid = document.getElementById("certificatesGrid");

      if (certificatesGrid) {
        certificatesGrid.innerHTML = certs.data.map((x) => {
          const certificateUrl = x.file_url || x.verification_url;

          return `
            <article class="certificate-card">
              <p class="card-kicker">
                ${esc(x.issuer)}${x.completed_on ? " · " + esc(x.completed_on) : ""}
              </p>

              <h3>${esc(x.title)}</h3>

              <p class="card-meta">
                ${esc(x.duration || "")}
                ${x.score ? " · Score: " + esc(x.score) : ""}
                ${x.credits ? " · " + esc(x.credits) + " credits" : ""}
              </p>

              <p class="card-description">
                ${esc(x.description || "")}
              </p>

              ${certificateUrl ? `
                <a
                  class="btn btn-primary"
                  href="${esc(certificateUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Certificate ↗
                </a>
              ` : ""}
            </article>
          `;
        }).join("");
      }
    }

    // Display achievements
    if (achievements.data?.length) {
      const achievementsGrid = document.getElementById("achievementsGrid");

      if (achievementsGrid) {
        achievementsGrid.innerHTML = achievements.data.map((x) => `
          <article class="achievement-card">
            <p class="card-kicker">
              ${esc(x.event_date || "Achievement")}
            </p>

            <h3>${esc(x.title)}</h3>

            <p class="card-description">
              ${esc(x.description || "")}
            </p>

            ${x.file_url ? `
              <a
                class="btn btn-secondary"
                href="${esc(x.file_url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                View attachment ↗
              </a>
            ` : ""}
          </article>
        `).join("");
      }
    }

  } catch (error) {
    console.error("Portfolio content loading failed:", error);
  }
} else {
  console.warn("Supabase is not configured.");
}
