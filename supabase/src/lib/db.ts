import { supabase, isSupabaseConfigured } from './supabase';

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  description: string;
  display_order?: number;
}

export interface TechCategory {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  skills: { name: string }[];
}

export interface ResumeMeta {
  file_url: string;
  file_name: string;
  last_updated: string;
}

// Fallback seed data
export const FALLBACK_CERTIFICATES: Certificate[] = [
  {
    id: 'aws-sa',
    title: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    issue_date: 'Oct 2023',
    description: 'Demonstrated expertise in designing distributed systems and deploying scalable, highly available applications on AWS.',
    display_order: 1,
  },
  {
    id: 'gcp-de',
    title: 'Professional Data Engineer',
    issuer: 'Google Cloud',
    issue_date: 'Mar 2023',
    description: 'Certified in designing and building data processing systems, with a focus on reliability, security, and performance.',
    display_order: 2,
  },
  {
    id: 'meta-react',
    title: 'Meta React Developer',
    issuer: 'Meta / Coursera',
    issue_date: 'Nov 2022',
    description: 'Completed advanced coursework in React application architecture, hooks, performance optimisation, and testing.',
    display_order: 3,
  },
  {
    id: 'pg-sql',
    title: 'PostgreSQL Advanced',
    issuer: 'EDB Training',
    issue_date: 'Jul 2022',
    description: 'Covered query optimisation, indexing strategies, partitioning, and high-availability configurations for PostgreSQL.',
    display_order: 4,
  },
  {
    id: 'docker-k8s',
    title: 'Docker and Kubernetes',
    issuer: 'Linux Foundation',
    issue_date: 'Jan 2022',
    description: 'Hands-on certification in containerisation, orchestration, and deploying production workloads on Kubernetes clusters.',
    display_order: 5,
  },
  {
    id: 'scrum-master',
    title: 'Certified Scrum Master',
    issuer: 'Scrum Alliance',
    issue_date: 'Sep 2021',
    description: 'Certified in Agile principles and the Scrum framework, with practical experience facilitating cross-functional delivery teams.',
    display_order: 6,
  },
];

export const FALLBACK_TECH_CATEGORIES: TechCategory[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    slug: 'frontend',
    icon_name: 'frontend',
    skills: [
      { name: 'React' },
      { name: 'Next.js' },
      { name: 'TypeScript' },
      { name: 'CSS Modules' },
      { name: 'Framer Motion' },
      { name: 'Figma' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    slug: 'backend',
    icon_name: 'backend',
    skills: [
      { name: 'Node.js' },
      { name: 'Python' },
      { name: 'FastAPI' },
      { name: 'PostgreSQL' },
      { name: 'Redis' },
      { name: 'GraphQL' },
    ],
  },
  {
    id: 'data',
    name: 'Data',
    slug: 'data',
    icon_name: 'data',
    skills: [
      { name: 'Apache Spark' },
      { name: 'dbt' },
      { name: 'Airflow' },
      { name: 'BigQuery' },
      { name: 'Kafka' },
      { name: 'Pandas' },
    ],
  },
  {
    id: 'tools',
    name: 'Tools',
    slug: 'tools',
    icon_name: 'tools',
    skills: [
      { name: 'Docker' },
      { name: 'Kubernetes' },
      { name: 'GitHub Actions' },
      { name: 'Terraform' },
      { name: 'AWS' },
      { name: 'GCP' },
    ],
  },
];

export const FALLBACK_RESUME_META: ResumeMeta = {
  file_url: '/resume.pdf',
  file_name: 'Edward_Emmanuel_Resume.pdf',
  last_updated: 'Oct 17, 2023',
};

// In-memory runtime state for local development when Supabase is not connected
let runtimeResumeMeta: ResumeMeta = { ...FALLBACK_RESUME_META };

export async function getCertificates(): Promise<Certificate[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Certificate[];
      }
    } catch (err) {
      console.warn('Supabase query error, falling back to local data:', err);
    }
  }
  return FALLBACK_CERTIFICATES;
}

export async function getTechStack(): Promise<TechCategory[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: categories, error: catError } = await supabase
        .from('tech_categories')
        .select(`
          id,
          name,
          slug,
          icon_name,
          display_order,
          tech_skills (
            name,
            display_order
          )
        `)
        .order('display_order', { ascending: true });

      if (!catError && categories && categories.length > 0) {
        return categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          icon_name: cat.icon_name,
          skills: (cat.tech_skills || [])
            .sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0))
            .map((s: any) => ({ name: s.name })),
        }));
      }
    } catch (err) {
      console.warn('Supabase query error, falling back to local data:', err);
    }
  }
  return FALLBACK_TECH_CATEGORIES;
}

export async function getResumeMeta(): Promise<ResumeMeta> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('resume_meta')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        return {
          file_url: data.file_url,
          file_name: data.file_name,
          last_updated: new Date(data.last_updated).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };
      }
    } catch (err) {
      console.warn('Supabase query error, falling back to local data:', err);
    }
  }
  return runtimeResumeMeta;
}

export async function setRuntimeResumeMeta(meta: Partial<ResumeMeta>): Promise<ResumeMeta> {
  runtimeResumeMeta = {
    ...runtimeResumeMeta,
    ...meta,
  };
  return runtimeResumeMeta;
}
