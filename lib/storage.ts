"use client";

import { ProjectsDBSchema, type Project, type ProjectsDB, emptyWorkspace } from "@/lib/schema";
import { uid } from "@/lib/id";

const LS_KEY = "prodlens.db";

export function loadDB(): ProjectsDB {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return ProjectsDBSchema.parse({ version: 1, projects: [] });
    return ProjectsDBSchema.parse(JSON.parse(raw));
  } catch {
    return ProjectsDBSchema.parse({ version: 1, projects: [] });
  }
}

export function saveDB(db: ProjectsDB) {
  localStorage.setItem(LS_KEY, JSON.stringify(db));
}

export function createProject(productName: string): Project {
  const now = Date.now();
  return {
    id: uid("proj"),
    createdAt: now,
    updatedAt: now,
    workspace: emptyWorkspace(productName),
  };
}

export function upsertProject(db: ProjectsDB, project: Project): ProjectsDB {
  const idx = db.projects.findIndex((p) => p.id === project.id);
  const next = { ...project, updatedAt: Date.now() };
  if (idx === -1) return { ...db, projects: [next, ...db.projects] };

  const projects = db.projects.slice();
  projects[idx] = next;
  return { ...db, projects };
}

export function deleteProject(db: ProjectsDB, id: string): ProjectsDB {
  return { ...db, projects: db.projects.filter((p) => p.id !== id) };
}
