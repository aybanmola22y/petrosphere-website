/**
 * Hand-maintained Database types for the website `public` schema.
 * Regenerate after migrations: `npm run supabase:gen:types`
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      news_authored: {
        Row: {
          id: string;
          slug: string;
          category: string;
          title: string;
          published_at: string;
          summary: string;
          image_src: string;
          body: Json;
          external: boolean;
          external_href: string | null;
          cta: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["news_authored"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["news_authored"]["Insert"]>;
        Relationships: [];
      };
      news_fetched_overrides: {
        Row: {
          slug: string;
          category: string | null;
          title: string | null;
          published_at: string | null;
          summary: string | null;
          image_src: string | null;
          body: Json | null;
          external: boolean | null;
          external_href: string | null;
          cta: Json | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["news_fetched_overrides"]["Row"], "updated_at"> & {
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["news_fetched_overrides"]["Insert"]>;
        Relationships: [];
      };
      news_fetched_hidden: {
        Row: {
          slug: string;
          hidden_at: string;
        };
        Insert: {
          slug: string;
          hidden_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["news_fetched_hidden"]["Insert"]>;
        Relationships: [];
      };
      site_stats: {
        Row: {
          id: string;
          value: string;
          label: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["site_stats"]["Row"], "id" | "updated_at"> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_stats"]["Insert"]>;
        Relationships: [];
      };
      video_testimonials: {
        Row: {
          id: string;
          student_name: string;
          credential: string;
          summary: string;
          youtube_video_id: string;
          poster_src: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["video_testimonials"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["video_testimonials"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
