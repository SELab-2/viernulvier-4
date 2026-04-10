//TODO file uses mock data for the moment, needs to be replaced later on!!

import type { PrintItemView, PaginatedResponse, PaginationFilter } from "@repo/common";

interface PrintListOptions {
    printFilters?: { title?: string };
    paginationFilters?: PaginationFilter;
    lang?: "nl" | "en";
}

const MOCK_PRINTS: PrintItemView[] = Array.from({ length: 60 }, (_, i) => {
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
}); //TODO these are mock prints !!

export function usePrintApi() {
    //TODO remove lang if you will not use it
    async function getAll({
      printFilters,
      paginationFilters,
      lang
    }: PrintListOptions = {}): Promise<PaginatedResponse<PrintItemView>> { //TODO needs to be changed to get actual API call
        await new Promise(r => setTimeout(r, 600));

        const { page = 0, limit = 20, descending = true } = paginationFilters ?? {};
        const titleFilter = printFilters?.title?.toLowerCase() ?? "";

        let filtered = MOCK_PRINTS.filter(p =>
            titleFilter ? p.titel.toLowerCase().includes(titleFilter) : true,
        );

        if (descending) filtered = [...filtered].reverse();

        const objects = filtered.slice(page * limit, page * limit + limit);

        return { objects, totalItems: filtered.length, page, limit };
    }

    return { getAll };
}