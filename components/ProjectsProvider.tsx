"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { Project, ProjectsDB } from "@/lib/schema";
import { createProject, deleteProject, loadDB, saveDB, upsertProject } from "@/lib/storage";

type State = {
  db: ProjectsDB;
  hydrated: boolean;
};

type Action =
  | { type: "HYDRATE"; db: ProjectsDB }
  | { type: "CREATE"; productName: string }
  | { type: "DELETE"; id: string }
  | { type: "UPSERT"; project: Project };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { db: action.db, hydrated: true };
    case "CREATE": {
      const p = createProject(action.productName);
      return { ...state, db: { ...state.db, projects: [p, ...state.db.projects] } };
    }
    case "DELETE":
      return { ...state, db: deleteProject(state.db, action.id) };
    case "UPSERT":
      return { ...state, db: upsertProject(state.db, action.project) };
    default:
      return state;
  }
}

type Ctx = {
  hydrated: boolean;
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  create: (productName: string) => Project;
  remove: (id: string) => void;
  save: (project: Project) => void;
};

const ProjectsContext = createContext<Ctx | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { db: { version: 1, projects: [] }, hydrated: false });

  // Hydrate from localStorage
  useEffect(() => {
    const db = loadDB();
    dispatch({ type: "HYDRATE", db });
  }, []);

  // Persist
  useEffect(() => {
    if (!state.hydrated) return;
    saveDB(state.db);
  }, [state.db, state.hydrated]);

  const ctx = useMemo<Ctx>(() => {
    return {
      hydrated: state.hydrated,
      projects: state.db.projects,
      getProject: (id) => state.db.projects.find((p) => p.id === id),
      create: (productName) => {
        const p = createProject(productName);
        dispatch({ type: "UPSERT", project: p });
        return p;
      },
      remove: (id) => dispatch({ type: "DELETE", id }),
      save: (project) => dispatch({ type: "UPSERT", project }),
    };
  }, [state.db.projects, state.hydrated]);

  return <ProjectsContext.Provider value={ctx}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const v = useContext(ProjectsContext);
  if (!v) throw new Error("useProjects must be used inside ProjectsProvider");
  return v;
}
