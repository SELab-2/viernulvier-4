<script>
const { getAll: getProductions } = useProductionApi();
const { getAll: getBlogs } = useBlogApi();
const { getAll: getEvents } = useEventApi();
const { getAll: getLocations } = useLocationApi();
const { getAll: getTags } = useTagApi();
const { getAll: getPrices } = usePriceApi();

const productions = await getProductions({ 
  paginationFilters: { page: 1, descending: true }, 
  languageFilters: { lang: "nl" }
});
console.log(productions);

const locations = await getLocations({
  paginationFilters: { page: 10 },
});
console.log(locations);
</script>
