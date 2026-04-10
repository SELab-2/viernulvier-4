import type { PrintItemView, PaginatedResponse } from "@repo/common";

interface GetAllParams {
    paginationFilters: { page: number; limit: number; descending: boolean };
    languageFilters:   { lang: "nl" | "en" };
    printFilters?: {
        title?:  string;
        after?:  string;
        before?: string;
    };
}

const MOCK_PRINTS: PrintItemView[] = Array.from({ length: 55 }, (_, i) => {
    const types = ["AFFICHE", "BROCHURE", "DRUKWERK", "PROGRAMMA"] as const;
    const type  = types[i % 4];
    return {
        id:          i + 1,
        titel:       `${type} — item ${i + 1}`,
        description: `Mock description for print item ${i + 1}`,
        url:         `https://picsum.photos/seed/${i + 1}/400/533`,
        created_at:  new Date(2022, 0, i + 1).toISOString(),
        updated_at:  new Date(2023, 0, i + 1).toISOString(),
    };
});

export function usePrintApi() {
    async function getAll(params: GetAllParams): Promise<PaginatedResponse<PrintItemView>> {
        await new Promise(r => setTimeout(r, 600));

        const { page, limit, descending } = params.paginationFilters;
        const titleFilter = params.printFilters?.title?.toLowerCase() ?? "";

        let filtered = MOCK_PRINTS.filter(p =>
            titleFilter ? p.titel.toLowerCase().includes(titleFilter) : true,
        );

        if (descending) filtered = [...filtered].reverse();

        const start = page * limit;
        const objects = filtered.slice(start, start + limit);

        return { objects, totalItems: filtered.length, page, limit };
    }

    return { getAll };
}

//TODO file to be replaced later on