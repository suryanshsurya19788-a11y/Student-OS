import type { CSSProperties, ReactNode } from "react";
import {
  Award,
  Briefcase,
  Compass,
  FolderGit2,
  Globe,
  GraduationCap,
  Languages,
  Link2,
  Mail,
  MapPin,
  Palette,
  Phone,
  Quote,
  Sparkles,
  Trophy,
  User,
  Wrench,
  Lightbulb,
} from "lucide-react";
import {
  CV_ACCENTS,
  formatCvDate,
  formatRange,
  has,
  lines,
  linkParts,
  type ContactKey,
  type CvData,
} from "@/lib/cv";

/**
 * The printable resume. Purely presentational: every section hides itself
 * when it has no real content, so the output never contains placeholders.
 */
export function CvPaper({ cv }: { cv: CvData }) {
  const accent = CV_ACCENTS[cv.accent] ?? CV_ACCENTS.teal;
  const twoCol = cv.template === "modern" || cv.template === "professional";
  // Accent is user-chosen data, so it is passed as CSS variables.
  const style = { "--cv-ink": accent.ink, "--cv-soft": accent.soft } as CSSProperties;

  const side = <SideContent cv={cv} />;
  const sideHasContent = hasSideContent(cv);

  return (
    <article className={`cv-paper cv-${cv.template}`} style={style} aria-label="Resume preview">
      {twoCol ? (
        <div className={`cv-grid ${sideHasContent ? "" : "cv-grid-single"}`}>
          {sideHasContent ? (
            <aside className="cv-side">
              {has(cv.personal.photo) ? (
                <img src={cv.personal.photo} alt="" className="cv-photo" />
              ) : null}
              {side}
            </aside>
          ) : null}
          <div className="cv-main">
            <Header cv={cv} />
            <MainContent cv={cv} />
          </div>
        </div>
      ) : (
        <div className="cv-main">
          <Header cv={cv} withPhoto />
          <MainContent cv={cv} />
          {sideHasContent ? <div className="cv-side-inline">{side}</div> : null}
        </div>
      )}
    </article>
  );
}

/* --------------------------------- Header -------------------------------- */

const CONTACT_ICONS: Record<ContactKey, typeof Mail> = {
  location: MapPin,
  email: Mail,
  phone: Phone,
  linkedin: Link2,
  github: Link2,
  website: Globe,
};

function Header({ cv, withPhoto }: { cv: CvData; withPhoto?: boolean }) {
  const p = cv.personal;
  const order: ContactKey[] = ["location", "email", "phone", "linkedin", "github", "website"];
  const items = order
    .filter((k) => cv.showContact[k] && has(p[k]))
    .map((k) => {
      const Icon = CONTACT_ICONS[k];
      const value = p[k].trim();
      let href: string | null = null;
      let text = value;
      if (k === "email") href = `mailto:${value}`;
      else if (k === "phone") href = `tel:${value.replace(/[^\d+]/g, "")}`;
      else if (k !== "location") ({ text, href } = linkParts(value));
      return { k, Icon, text, href };
    });

  if (!has(p.name) && !has(p.headline) && !has(p.tagline) && items.length === 0) return null;

  return (
    <header className="cv-header">
      {withPhoto && has(p.photo) ? <img src={p.photo} alt="" className="cv-photo cv-photo-sm" /> : null}
      <div className="cv-header-text">
        {has(p.name) ? <h1 className="cv-name">{p.name}</h1> : null}
        {has(p.headline) ? <p className="cv-headline">{p.headline}</p> : null}
        {has(p.tagline) ? <p className="cv-tagline">{p.tagline}</p> : null}
        {items.length ? (
          <ul className="cv-contact">
            {items.map(({ k, Icon, text, href }) => (
              <li key={k}>
                <Icon className="cv-ico" aria-hidden />
                {href ? <a href={href}>{text}</a> : <span>{text}</span>}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </header>
  );
}

/* --------------------------------- Pieces -------------------------------- */

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Mail;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="cv-section">
      <h2 className="cv-h">
        <Icon className="cv-ico" aria-hidden />
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="cv-bullets">
      {items.map((b, i) => (
        <li key={i}>{b}</li>
      ))}
    </ul>
  );
}

function Ext({ value, prefix }: { value: string; prefix?: string }) {
  const { text, href } = linkParts(value);
  if (!text) return null;
  return (
    <p className="cv-link">
      {prefix ? <span className="cv-muted">{prefix} </span> : null}
      {href ? <a href={href}>{text}</a> : text}
    </p>
  );
}

/* ------------------------------ Main column ------------------------------ */

function MainContent({ cv }: { cv: CvData }) {
  const education = cv.education.filter((e) => has(e.degree) || has(e.institution));
  const projects = cv.projects.filter((e) => has(e.name));
  const experience = cv.experience.filter((e) => has(e.role) || has(e.company));
  const certs = cv.certifications.filter((e) => has(e.name));
  const achievements = cv.achievements.filter((e) => has(e.title));
  const creative = cv.creative.filter((e) => has(e.title));
  const extra = cv.additionalSkills.filter(has);
  const interests = cv.interests.filter(has);

  return (
    <>
      {has(cv.summary) ? (
        <Section icon={User} title="Professional Summary">
          <p className="cv-p">{cv.summary.trim()}</p>
        </Section>
      ) : null}

      {education.length ? (
        <Section icon={GraduationCap} title="Education">
          {education.map((e) => {
            const range = formatRange(e.start, e.end, e.current);
            return (
              <div key={e.id} className="cv-entry">
                <div className="cv-row">
                  <p className="cv-title">{e.degree || e.institution}</p>
                  {range ? <p className="cv-date">{range}</p> : null}
                </div>
                {e.degree && has(e.institution) ? (
                  <p className="cv-sub">
                    {e.institution}
                    {has(e.location) ? <span className="cv-muted"> · {e.location}</span> : null}
                  </p>
                ) : null}
                {has(e.description) ? <p className="cv-p">{e.description.trim()}</p> : null}
                <Bullets items={lines(e.achievements)} />
              </div>
            );
          })}
        </Section>
      ) : null}

      {projects.length ? (
        <Section icon={FolderGit2} title="Projects">
          {projects.map((e) => {
            const range = formatRange(e.start, e.end);
            const bullets = lines(e.description);
            if (has(e.technologies)) bullets.push(`Technologies: ${e.technologies.trim()}`);
            return (
              <div key={e.id} className="cv-entry">
                <div className="cv-row">
                  <p className="cv-title cv-caps">{e.name}</p>
                  {range ? <p className="cv-date">{range}</p> : null}
                </div>
                {has(e.type) ? <p className="cv-sub">{e.type}</p> : null}
                <Bullets items={bullets} />
                {has(e.link) ? <Ext value={e.link} prefix="Live:" /> : null}
              </div>
            );
          })}
        </Section>
      ) : null}

      {experience.length ? (
        <Section icon={Briefcase} title="Experience">
          {experience.map((e) => {
            const range = formatRange(e.start, e.end, e.current);
            return (
              <div key={e.id} className="cv-entry">
                <div className="cv-row">
                  <p className="cv-title">{e.role || e.company}</p>
                  {range ? <p className="cv-date">{range}</p> : null}
                </div>
                {e.role && has(e.company) ? (
                  <p className="cv-sub">
                    {e.company}
                    {has(e.location) ? <span className="cv-muted"> · {e.location}</span> : null}
                  </p>
                ) : null}
                {has(e.description) ? <p className="cv-p">{e.description.trim()}</p> : null}
                <Bullets items={lines(e.bullets)} />
              </div>
            );
          })}
        </Section>
      ) : null}

      {certs.length ? (
        <Section icon={Award} title="Certifications">
          {certs.map((e) => {
            const date = formatCvDate(e.date);
            const { href } = linkParts(e.link);
            return (
              <div key={e.id} className="cv-entry cv-entry-tight">
                <div className="cv-row">
                  <p className="cv-title">
                    {href ? <a href={href}>{e.name}</a> : e.name}
                    {has(e.issuer) ? <span className="cv-sub-inline"> — {e.issuer}</span> : null}
                  </p>
                  {date ? <p className="cv-date">{date}</p> : null}
                </div>
              </div>
            );
          })}
        </Section>
      ) : null}

      {creative.length ? (
        <Section icon={Palette} title="Creative Work">
          {creative.map((e) => (
            <div key={e.id} className="cv-entry">
              <p className="cv-title">
                {e.title}
                {has(e.type) ? <span className="cv-sub-inline"> — {e.type}</span> : null}
              </p>
              {has(e.description) ? <p className="cv-p">{e.description.trim()}</p> : null}
              {has(e.link) ? <Ext value={e.link} /> : null}
            </div>
          ))}
        </Section>
      ) : null}

      {achievements.length ? (
        <Section icon={Trophy} title="Achievements">
          {achievements.map((e) => {
            const date = formatCvDate(e.date);
            return (
              <div key={e.id} className="cv-entry cv-entry-tight">
                <div className="cv-row">
                  <p className="cv-title">{e.title}</p>
                  {date ? <p className="cv-date">{date}</p> : null}
                </div>
                {has(e.description) ? <p className="cv-p">{e.description.trim()}</p> : null}
              </div>
            );
          })}
        </Section>
      ) : null}

      {extra.length ? (
        <Section icon={Sparkles} title="Additional Skills">
          <p className="cv-p">{extra.join(" · ")}</p>
        </Section>
      ) : null}

      {interests.length ? (
        <Section icon={Compass} title="Career Interests">
          <p className="cv-p">{interests.join(" · ")}</p>
        </Section>
      ) : null}
    </>
  );
}

/* ------------------------------ Side column ------------------------------ */

function hasSideContent(cv: CvData) {
  return (
    has(cv.personal.photo) ||
    cv.skills.some((s) => has(s.name)) ||
    cv.tools.some(has) ||
    cv.languages.some((l) => has(l.name)) ||
    has(cv.personal.linkedin) ||
    has(cv.personal.github) ||
    has(cv.personal.website) ||
    has(cv.quote)
  );
}

function SideContent({ cv }: { cv: CvData }) {
  const skills = cv.skills.filter((s) => has(s.name));
  const tools = cv.tools.filter(has);
  const languages = cv.languages.filter((l) => has(l.name));
  const links = (
    [
      ["LinkedIn", cv.personal.linkedin],
      ["GitHub", cv.personal.github],
      ["Portfolio", cv.personal.website],
    ] as const
  )
    .map(([label, v]) => ({ label, ...linkParts(v) }))
    .filter((l) => l.text);

  // Group skills by category, keeping uncategorised first.
  const groups = new Map<string, string[]>();
  for (const s of skills) {
    const key = s.category.trim();
    groups.set(key, [...(groups.get(key) ?? []), s.name.trim()]);
  }

  return (
    <>
      {skills.length ? (
        <Section icon={Lightbulb} title="Skills">
          {Array.from(groups.entries()).map(([cat, names]) => (
            <div key={cat || "_"} className="cv-group">
              {cat ? <p className="cv-group-title">{cat}</p> : null}
              <Bullets items={names} />
            </div>
          ))}
        </Section>
      ) : null}

      {tools.length ? (
        <Section icon={Wrench} title="Technical Tools">
          <Bullets items={tools} />
        </Section>
      ) : null}

      {links.length ? (
        <Section icon={Link2} title="Links">
          <ul className="cv-links">
            {links.map((l) => (
              <li key={l.label}>
                <span className="cv-group-title">{l.label}</span>
                {l.href ? <a href={l.href}>{l.text}</a> : <span>{l.text}</span>}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {languages.length ? (
        <Section icon={Languages} title="Languages">
          <ul className="cv-langs">
            {languages.map((l) => (
              <li key={l.id}>
                <span>{l.name}</span>
                {has(l.level) ? <span className="cv-muted">{l.level}</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {has(cv.quote) ? (
        <blockquote className="cv-quote">
          <Quote className="cv-ico" aria-hidden />
          <p>{cv.quote.trim()}</p>
        </blockquote>
      ) : null}
    </>
  );
}
