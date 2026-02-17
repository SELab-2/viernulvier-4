// src/db/interfaces.ts

// TODO add null if field can be null.
export interface Production {
    id: number;
    titel: string;
    ondertitel: string;
    description1: string;
    description2: string | null;
    genre: string;
    planning_id: number | null;
    blog_titel: string | null;
    blog_text: string | null;
}

export interface Event {
    id: number;
    starttime: string; // ISO string
    endtime: string | null;
    hall: string;
    production_id: number;
    price: number;
}