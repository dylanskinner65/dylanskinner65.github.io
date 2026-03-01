import { useMemo } from "react";
import Fuse from "fuse.js";
import contentData from "../data/content.json";

export type SearchItem = {
  slug: string;
  title: string;
  date: string;
  description: string;
  type: 'blog' | 'project';
  category?: string;
  tags?: string[];
  content: string;
};

export function useSearch(query: string) {
  const searchData: SearchItem[] = useMemo(() => {
    const blogPosts: SearchItem[] = contentData.blog.map(post => ({
      ...post,
      type: 'blog' as const,
    }));
    const projects: SearchItem[] = contentData.projects.map(project => ({
      ...project,
      type: 'project' as const,
    }));
    return [...blogPosts, ...projects];
  }, []);

  const fuse = useMemo(() => {
    return new Fuse(searchData, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'tags', weight: 1 },
        { name: 'category', weight: 1 },
        { name: 'content', weight: 0.5 }
      ],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true
    });
  }, [searchData]);

  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query);
  }, [fuse, query]);

  return results;
}
