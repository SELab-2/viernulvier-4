import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ref, type Ref } from "vue";
import { useProductionFormPage } from "../../../app/composables/productions/useProductionFormPage";
import * as useProductionCoreModule from "../../../app/composables/productions/steps/productionCore";
import * as useProductionTagsModule from "../../../app/composables/productions/steps/productionTags";
import * as useProductionMediaModule from "../../../app/composables/productions/steps/productionMedia";
import * as useProductionEventsModule from "../../../app/composables/productions/steps/productionEvents";
import * as useProductionSeriesModule from "../../../app/composables/productions/steps/productionSeries";
import * as useProductionApiModule from "../../../app/composables/useProductionApi";
import * as useTagApiModule from "../../../app/composables/useTagApi";
import * as useEventApiModule from "../../../app/composables/useEventApi";
import * as useSeriesApiModule from "../../../app/composables/useSeriesApi";
import * as useGalleryApiModule from "../../../app/composables/media/useGalleryApi";
import * as useItemApiModule from "../../../app/composables/media/useItemApi";
import * as useCropApiModule from "../../../app/composables/media/useCropApi";
import * as useStorageApiModule from "../../../app/composables/media/useStorageApi";
import * as usePriceApiModule from "../../../app/composables/usePriceApi";
import * as useLocationApiModule from "../../../app/composables/useLocationApi";

const mockPush = vi.fn();
const mockAfterEach = vi.fn();

vi.mock("vue-router", async (importOriginal) => {
  const actual = await (
    importOriginal as () => Promise<Record<string, unknown>>
  )();
  return {
    ...actual,
    useRoute: () => ({ params: { id: "123" } }),
    useRouter: () => ({
      push: mockPush,
      afterEach: mockAfterEach,
    }),
  };
});

// Mock all step composables
vi.mock("../../../app/composables/productions/steps/productionCore", () => ({
  useProductionCore: vi.fn(),
}));
vi.mock("../../../app/composables/productions/steps/productionTags", () => ({
  useProductionTags: vi.fn(),
}));
vi.mock("../../../app/composables/productions/steps/productionMedia", () => ({
  useProductionMedia: vi.fn(),
}));
vi.mock("../../../app/composables/productions/steps/productionEvents", () => ({
  useProductionEvents: vi.fn(),
}));
vi.mock("../../../app/composables/productions/steps/productionSeries", () => ({
  useProductionSeries: vi.fn(),
}));

// Mock all APIs
vi.mock("../../../app/composables/useProductionApi", () => ({
  useProductionApi: vi.fn(),
}));
vi.mock("../../../app/composables/useTagApi", () => ({ useTagApi: vi.fn() }));
vi.mock("../../../app/composables/useLocationApi", () => ({
  useLocationApi: vi.fn(),
}));
vi.mock("../../../app/composables/useEventApi", () => ({
  useEventApi: vi.fn(),
}));
vi.mock("../../../app/composables/usePriceApi", () => ({
  usePriceApi: vi.fn(),
}));
vi.mock("../../../app/composables/media/useGalleryApi", () => ({
  useGalleryApi: vi.fn(),
}));
vi.mock("../../../app/composables/media/useItemApi", () => ({
  useItemApi: vi.fn(),
}));
vi.mock("../../../app/composables/media/useCropApi", () => ({
  useCropApi: vi.fn(),
}));
vi.mock("../../../app/composables/media/useStorageApi", () => ({
  useStorageApi: vi.fn(),
}));
vi.mock("../../../app/composables/useSeriesApi", () => ({
  useSeriesApi: vi.fn(),
}));

interface MockStep {
  initialize: Mock;
  reset: Mock;
  getChangedFields: Mock;
  extractPayload: Mock;
  draft: Ref<Record<string, unknown>>;
}

interface MockProductionApi {
  create: Mock;
  replace: Mock;
  addTag: Mock;
  removeTag: Mock;
  linkMedia: Mock;
}

interface MockEventApi {
  create: Mock;
  modify: Mock;
  remove: Mock;
  linkLocation: Mock;
  linkPrice: Mock;
}

interface MockTagApi {
  create: Mock;
}

interface MockSeriesApi {
  create: Mock;
  modify: Mock;
  linkProductionToSeries: Mock;
}

interface MockGalleryApi {
  create: Mock;
  linkPrintToGallery: Mock;
  unlinkPrintFromGallery: Mock;
}

interface MockItemApi {
  create: Mock;
  modify: Mock;
  remove: Mock;
}

interface MockStorageApi {
  saveMedia: Mock;
  deleteMedia: Mock;
}

interface MockCropApi {
  create: Mock;
  remove: Mock;
}

interface MockPriceApi {
  create: Mock;
  modify: Mock;
  remove: Mock;
}

interface MockLocationApi {
  create: Mock;
}

describe("useProductionFormPage", () => {
  const createMockStep = (): MockStep => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
    getChangedFields: vi.fn().mockReturnValue([]),
    extractPayload: vi.fn().mockReturnValue({}),
    draft: ref({}),
  });

  let core: MockStep,
    tags: MockStep,
    media: MockStep,
    events: MockStep,
    series: MockStep;
  let productionApi: MockProductionApi,
    eventApi: MockEventApi,
    tagApi: MockTagApi,
    seriesApi: MockSeriesApi;
  let galleryApi: MockGalleryApi,
    itemApi: MockItemApi,
    storageApi: MockStorageApi,
    cropApi: MockCropApi;
  let priceApi: MockPriceApi, locationApi: MockLocationApi;

  beforeEach(() => {
    vi.clearAllMocks();

    core = createMockStep();
    tags = createMockStep();
    media = createMockStep();
    events = createMockStep();
    series = createMockStep();

    (useProductionCoreModule.useProductionCore as Mock).mockReturnValue(core);
    (useProductionTagsModule.useProductionTags as Mock).mockReturnValue(tags);
    (useProductionMediaModule.useProductionMedia as Mock).mockReturnValue(
      media,
    );
    (useProductionEventsModule.useProductionEvents as Mock).mockReturnValue(
      events,
    );
    (useProductionSeriesModule.useProductionSeries as Mock).mockReturnValue(
      series,
    );

    productionApi = {
      create: vi.fn(),
      replace: vi.fn(),
      addTag: vi.fn(),
      removeTag: vi.fn(),
      linkMedia: vi.fn(),
    };
    (useProductionApiModule.useProductionApi as Mock).mockReturnValue(
      productionApi,
    );

    eventApi = {
      create: vi.fn(),
      modify: vi.fn(),
      remove: vi.fn(),
      linkLocation: vi.fn(),
      linkPrice: vi.fn(),
    };
    (useEventApiModule.useEventApi as Mock).mockReturnValue(eventApi);

    tagApi = { create: vi.fn() };
    (useTagApiModule.useTagApi as Mock).mockReturnValue(tagApi);

    seriesApi = {
      create: vi.fn(),
      modify: vi.fn(),
      linkProductionToSeries: vi.fn(),
    };
    (useSeriesApiModule.useSeriesApi as Mock).mockReturnValue(seriesApi);

    galleryApi = {
      create: vi.fn(),
      linkPrintToGallery: vi.fn(),
      unlinkPrintFromGallery: vi.fn(),
    };
    (useGalleryApiModule.useGalleryApi as Mock).mockReturnValue(galleryApi);

    itemApi = { create: vi.fn(), modify: vi.fn(), remove: vi.fn() };
    (useItemApiModule.useItemApi as Mock).mockReturnValue(itemApi);

    storageApi = { saveMedia: vi.fn(), deleteMedia: vi.fn() };
    (useStorageApiModule.useStorageApi as Mock).mockReturnValue(storageApi);

    cropApi = { create: vi.fn(), remove: vi.fn() };
    (useCropApiModule.useCropApi as Mock).mockReturnValue(cropApi);

    priceApi = { create: vi.fn(), modify: vi.fn(), remove: vi.fn() };
    (usePriceApiModule.usePriceApi as Mock).mockReturnValue(priceApi);

    locationApi = { create: vi.fn() };
    (useLocationApiModule.useLocationApi as Mock).mockReturnValue(locationApi);
  });

  it("navigates between steps", () => {
    const { currentStepIndex, nextStep, prevStep } =
      useProductionFormPage("create");

    expect(currentStepIndex.value).toBe(0);
    nextStep();
    expect(currentStepIndex.value).toBe(1);
    prevStep();
    expect(currentStepIndex.value).toBe(0);
  });

  it("initializes all steps", async () => {
    const { initializeSteps } = useProductionFormPage("edit");
    await initializeSteps();

    expect(core.initialize).toHaveBeenCalled();
    expect(tags.initialize).toHaveBeenCalled();
    expect(media.initialize).toHaveBeenCalled();
  });

  it("calls productionApi.replace on finish (edit mode)", async () => {
    core.extractPayload.mockReturnValue({
      nl: {
        titel: "T",
        description1: "D",
        description2: null,
        artist: null,
        tagline: null,
        credits: null,
      },
      en: {
        titel: "",
        description1: "",
        description2: null,
        artist: null,
        tagline: null,
        credits: null,
      },
    });
    tags.extractPayload.mockReturnValue({
      create: [{ nl: "NewTag", en: "NewTag" }],
      connect: [1],
      disconnect: [2],
    });
    media.extractPayload.mockReturnValue({
      itemsToCreate: [],
      itemsToUpdate: [],
      itemsToDelete: [],
      printsToLink: [],
      printsToUnlink: [],
      galleryId: 10,
      printGalleryId: 20,
    });
    events.extractPayload.mockReturnValue({
      eventsToCreate: [],
      eventsToUpdate: [],
      eventsToDelete: [],
    });
    series.extractPayload.mockReturnValue({
      create: [],
      connect: [],
      disconnect: [],
      update: [],
    });

    tagApi.create.mockResolvedValue({ data: { id: 100 } });
    productionApi.replace.mockResolvedValue({ data: {} });

    const { finish } = useProductionFormPage("edit");
    await finish();

    expect(productionApi.replace).toHaveBeenCalled();
    expect(tagApi.create).toHaveBeenCalledWith({
      tag: { nl: "NewTag", en: "NewTag" },
    });
    expect(productionApi.addTag).toHaveBeenCalledWith(123, 100);
    expect(productionApi.removeTag).toHaveBeenCalledWith(123, 2);
    expect(mockPush).toHaveBeenCalled();
  });

  it("handles complex media and event creation", async () => {
    core.extractPayload.mockReturnValue({
      nl: {
        titel: "T",
        description1: "D",
        description2: null,
        artist: null,
        tagline: null,
        credits: null,
      },
      en: {
        titel: "",
        description1: "",
        description2: null,
        artist: null,
        tagline: null,
        credits: null,
      },
    });
    tags.extractPayload.mockReturnValue({
      create: [],
      connect: [],
      disconnect: [],
    });

    const mockFile = new File([""], "test.jpg");
    media.extractPayload.mockReturnValue({
      itemsToCreate: [
        {
          position: "main",
          cropsToUpload: [{ cropName: "hd_ready", file: mockFile }],
          nl: { title: "T1", description: "D1", credits: "C1" },
          en: { title: "", description: "", credits: "" },
        },
      ],
      itemsToUpdate: [],
      itemsToDelete: [],
      printsToLink: [500],
      printsToUnlink: [],
    });

    events.extractPayload.mockReturnValue({
      eventsToCreate: [
        {
          starttime: "2023-12-01T20:00:00Z",
          pricesToCreate: [{ price: 10, name: { nl: "P1", en: "" } }],
          linkLocationId: 10,
          createLocation: null,
        },
      ],
      eventsToUpdate: [],
      eventsToDelete: [],
    });
    series.extractPayload.mockReturnValue({
      create: [],
      connect: [],
      disconnect: [],
      update: [],
    });

    productionApi.create.mockResolvedValue({ data: { id: 1 } });
    galleryApi.create.mockResolvedValue({ data: { id: 1000 } });
    itemApi.create.mockResolvedValue({ data: { id: 2000 } });
    eventApi.create.mockResolvedValue({ data: { id: 3000 } });
    priceApi.create.mockResolvedValue({ data: { id: 4000 } });
    productionApi.replace.mockResolvedValue({ data: {} });

    const { finish } = useProductionFormPage("create");
    await finish();

    expect(productionApi.create).toHaveBeenCalled();
    expect(galleryApi.create).toHaveBeenCalledTimes(2);
    expect(itemApi.create).toHaveBeenCalled();
    expect(storageApi.saveMedia).toHaveBeenCalled();
    expect(cropApi.create).toHaveBeenCalled();
    expect(eventApi.create).toHaveBeenCalled();
    expect(eventApi.linkLocation).toHaveBeenCalledWith(3000, 10);
    expect(priceApi.create).toHaveBeenCalled();
    expect(eventApi.linkPrice).toHaveBeenCalledWith(3000, 4000);
    expect(galleryApi.linkPrintToGallery).toHaveBeenCalledWith(1000, 500);
  });
});
