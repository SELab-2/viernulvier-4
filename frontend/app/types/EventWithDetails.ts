import type {Event, LocationView, PriceView} from "@repo/common";

export type EventWithDetails = Event & { // combining info from tables into one single type
    locations: LocationView[];
    prices: PriceView[];
}